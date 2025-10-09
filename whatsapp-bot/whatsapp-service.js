const { makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys')
const express = require('express')
const cors = require('cors')
const axios = require('axios')

const app = express()
app.use(cors())
app.use(express.json())

const FASTAPI_URL = process.env.FASTAPI_URL || 'http://localhost:8001'

let sock = null
let qrCode = null
let connectionStatus = 'disconnected'

async function initWhatsApp() {
    try {
        console.log('🚀 Initializing CCC Digital WhatsApp Bot...')
        
        const { state, saveCreds } = await useMultiFileAuthState('./auth_info')

        sock = makeWASocket({
            auth: state,
            printQRInTerminal: true,
            browser: ['CCC Digital Bot', 'Chrome', '1.0.0'],
            generateHighQualityLinkPreview: true
        })

        sock.ev.on('connection.update', async (update) => {
            const { connection, lastDisconnect, qr } = update

            if (qr) {
                qrCode = qr
                console.log('📱 QR Code generated - scan with WhatsApp to connect')
                console.log('Instructions: WhatsApp → Settings → Linked Devices → Link a Device')
            }

            if (connection === 'close') {
                const shouldReconnect = (lastDisconnect?.error)?.output?.statusCode !== DisconnectReason.loggedOut
                console.log('Connection closed:', lastDisconnect?.error, '| Reconnecting:', shouldReconnect)
                connectionStatus = 'disconnected'

                if (shouldReconnect) {
                    setTimeout(initWhatsApp, 5000)
                }
            } else if (connection === 'open') {
                console.log('✅ CCC Digital WhatsApp Bot connected successfully!')
                console.log('📞 Business number: +65 8982 1301')
                qrCode = null
                connectionStatus = 'connected'
            }
        })

        sock.ev.on('messages.upsert', async ({ messages, type }) => {
            if (type === 'notify') {
                for (const message of messages) {
                    if (!message.key.fromMe && message.message) {
                        await handleIncomingMessage(message)
                    }
                }
            }
        })

        sock.ev.on('creds.update', saveCreds)

    } catch (error) {
        console.error('❌ WhatsApp initialization error:', error)
        connectionStatus = 'error'
        setTimeout(initWhatsApp, 10000)
    }
}

async function handleIncomingMessage(message) {
    try {
        const phoneNumber = message.key.remoteJid.replace('@s.whatsapp.net', '')
        const messageText = message.message.conversation ||
                           message.message.extendedTextMessage?.text || ''

        console.log(`📨 Message from ${phoneNumber}: ${messageText}`)

        // Process message with CCC Digital logic
        const response = await processCCCMessage(phoneNumber, messageText)

        // Send response back to customer
        if (response) {
            await sendMessage(phoneNumber, response)
        }

    } catch (error) {
        console.error('❌ Error handling message:', error)
        await sendMessage(phoneNumber.replace('@s.whatsapp.net', ''), 
            "Sorry, I encountered a technical issue. Please try again or call us at +65 8982 1301.")
    }
}

async function processCCCMessage(phoneNumber, messageText) {
    const text = messageText.toLowerCase().trim()

    // 1. ENHANCED CONVERSATIONAL QUESTIONS - Handle first
    // Pricing questions
    if (text.includes('price range') || (text.includes('why') && text.includes('price')) || 
        text.includes('difference') || text.includes('far apart') || text.includes('expensive vs cheap')) {
        return `💡 **Great question about pricing differences!**

The price ranges vary based on **complexity and features**:

**🌐 Websites ($3K-$12K):**
• $3K = Basic 5-7 pages, simple design
• $12K = Corporate 20+ pages, CMS, analytics, integrations

**🛒 E-commerce ($6K-$18K):**  
• $6K = Starter 20-30 products, basic features
• $18K = Enterprise multi-channel, advanced inventory

**📱 Web Apps ($8.5K-$24K):**
• $8.5K = Simple prototype with basic auth
• $24K = Full PWA with offline features, advanced functionality

**🤖 AI Systems ($1.8K-$8.8K):**
• $1.8K = Basic chatbot
• $8.8K = Complete analytics dashboard with automation

**💰 EDG covers 50%, so actual cost is roughly half!**

Which type of project are you considering? I can explain the specific features that affect pricing!
**Or feel free to ask me more questions and I will do my best to help! 😊**`
    }

    // Business-specific advice
    if (text.includes('music shop') || text.includes('retail') || (text.includes('customers') && text.includes('buying')) ||
        text.includes('more sales') || text.includes('increase sales')) {
        return `🎵 **Perfect! For a music shop wanting more customers:**

**🛒 E-commerce Solution ($6K-$18K, EDG: $3K-$9K):**
• Online catalog for your instruments/equipment
• Customer accounts & wish lists
• Inventory management 
• Stripe payments & delivery options
• Customer reviews & recommendations

**🤖 AI Integration ($1.8K-$8.8K, EDG: $0.9K-$4.4K):**
• AI chatbot for product recommendations
• Customer service automation
• Personalized music suggestions
• Lead capture for music lessons

**💰 Example Package:**
Growth E-commerce + AI chatbot = $10K-$15K
*With EDG support: Only $5K-$7.5K total cost*

**Results:** More online customers, better service, increased sales!

Want a detailed proposal for your music shop? Type "quote music shop" 
**Or feel free to ask me more questions about features! 😊**`
    }

    // 2. QUOTE REQUESTS - Handle before service descriptions
    if (text.includes('quote')) {
        if (text.includes('quote ai') || text.includes('quote automation') || text.includes('quote chatbot')) {
            return `✅ **AI & Automation Quote Request Received!**

Our team will prepare a detailed AI solution proposal and contact you within 2 business hours.

**We'll include:**
• AI capabilities & features
• Integration requirements
• EDG funding calculation
• Implementation roadmap

**Business hours:** Mon-Fri 9AM-6PM SGT

⏳ **Please wait for our consultant to get back to you at the shortest possible time.**
Thank you for choosing CCC Digital! 🚀`
        }
        
        if (text.includes('quote website') || text.includes('quote site')) {
            return `✅ **Website Quote Request Received!**

Our team will prepare a detailed website proposal and contact you within 2 business hours.

**We'll include:**
• Custom design & features
• EDG funding calculation
• Timeline & milestones
• Total cost breakdown

**Business hours:** Mon-Fri 9AM-6PM SGT

⏳ **Please wait for our consultant to get back to you at the shortest possible time.**
Thank you for choosing CCC Digital! 🚀`
        }
        
        // Generic quote
        return `✅ **Quote Request Received!**

Our team will prepare a customized proposal and contact you within 2 business hours.

**Business hours:** Mon-Fri 9AM-6PM SGT

⏳ **Please wait for our consultant to get back to you at the shortest possible time.**
Thank you for choosing CCC Digital! 🚀`
    }

    // 3. WELCOME/HELP responses
    if (text === 'hi' || text === 'hello' || text === 'start' || text === 'help') {
        return `👋 Hi! Welcome to CCC Digital!

🚀 **Complete Digital Solutions:**
1️⃣ AI-Powered Websites ($3K-$12K)
2️⃣ E-commerce & Inventory ($6K-$18K)  
3️⃣ Progressive Web Apps/PWA ($8.5K-$24K)
4️⃣ AI Agents & Automation ($1.8K-$8.8K)
5️⃣ EDG Grant Advisory & Documentation

💰 *All projects eligible for EDG support (pay ~50% less)*

What interests you? Type a number (1-5) or ask about:
• EDG eligibility • Pricing • Timeline • Features
**Or feel free to ask me more questions and I will do my best to help! 😊**`
    }

    // SPECIFIC AI CHATBOT QUESTIONS - Handle directly  
    if (text.includes('ai chatbot') || text.includes('chatbot like') || text.includes('whatsapp chatbot') || 
        text.includes('chatbot cost') || text.includes('just chatbot') || text.includes('chatbot price')) {
        return `🤖 **AI Chatbot Specifically (like this one):**

**WhatsApp AI Chatbot:** $1,800 - $3,500
• Basic responses & menu system: $1,800
• Advanced with lead capture: $2,500  
• Full business integration: $3,500

**Features included:**
• Automated customer support 24/7
• Lead qualification & capture
• Business hours management
• Integration with your CRM/email
• Custom responses for your business

**With EDG support:** Pay only $900 - $1,750

**Development time:** 2-3 weeks

Want this for your business? Type "quote chatbot"
**Or feel free to ask me more specific questions! 😊**`
    }

    // FOLLOW-UP QUESTIONS - Prevent repetition
    if (text.includes('how much') || text.includes('cost') || text.includes('price')) {
        // If they've asked about cost before, provide more specific breakdown
        return `💰 **Let me be more specific about costs:**

**What exactly do you need?**
• Basic website? → $3,000 (EDG: $1,500)
• Online store? → $6K-$18K (EDG: $3K-$9K)
• Mobile web app? → $8.5K-$24K (EDG: $4.25K-$12K)
• AI chatbot only? → $1,800-$3,500 (EDG: $900-$1,750)
• Complete digital transformation? → $15K-$25K (EDG: $7.5K-$12.5K)

**Tell me your business type and main goal** - I'll give you an exact cost estimate!
**Or feel free to ask me more specific questions! 😊**`
    }
        return `🌐 **AI-Powered Websites** ($3,000 - $12,000):

**Features:**
• Responsive design (mobile-friendly)
• AI chat integration
• Content management system  
• SEO optimization
• Analytics integration
• Lead capture forms

**Tiers:**
• Starter (5-7 pages): $3,000
• Growth (12+ pages): $6,500
• Premium (20+ pages): $9K-$12K

*With EDG: Pay $1,500 - $6,000*

Need a quote? Type "quote website" or call +65 8982 1301
**Or feel free to ask me more questions and I will do my best to help! 😊**`
    }

    if (text.includes('ai') || text.includes('automation') || text.includes('chatbot') || text === '4') {
        return `🤖 **AI Agents & Automation** ($1,800 - $8,800):

**Solutions:**
• Custom AI chatbots (like this one!)
• Workflow automation
• Document processing
• Customer service AI
• Data analytics dashboards
• CRM automation

**Tiers:**
• Custom GPT Agent: $1,800
• Workflow Automation: $3K-$5K
• AI Analytics Dashboard: $6K-$8.8K

*With EDG: Pay $900 - $4,400*

Want AI for your business? Type "quote ai" or call +65 8982 1301
**Or feel free to ask me more questions and I will do my best to help! 😊**`
    }

    // Default response for unrecognized messages
    return `🤔 Not sure what you meant. Here's how CCC Digital can help:

**🚀 Our Complete Services:**
1️⃣ AI-Powered Websites ($3K-$12K)
2️⃣ E-commerce & Inventory ($6K-$18K)
3️⃣ Progressive Web Apps/PWA ($8.5K-$24K)  
4️⃣ AI Agents & Automation ($1.8K-$8.8K)
5️⃣ EDG Grant Support

💡 **Popular questions:**
• "website" • "ecommerce" • "web app" • "ai automation"  
• "edg funding" • "pricing" • "quote" • "consultation"

Or call directly: +65 8982 1301
**Or feel free to ask me more questions and I will do my best to help! 😊**`
}

async function sendMessage(phoneNumber, text) {
    try {
        if (!sock) {
            throw new Error('WhatsApp not connected')
        }

        const jid = phoneNumber.includes('@') ? phoneNumber : `${phoneNumber}@s.whatsapp.net`
        await sock.sendMessage(jid, { text })
        console.log(`✅ Message sent to ${phoneNumber}`)
        return { success: true }

    } catch (error) {
        console.error('❌ Error sending message:', error)
        return { success: false, error: error.message }
    }
}

// REST API endpoints for integration
app.get('/qr', (req, res) => {
    res.json({ qr: qrCode })
})

app.post('/send', async (req, res) => {
    const { phone_number, message } = req.body
    const result = await sendMessage(phone_number, message)
    res.json(result)
})

app.get('/status', (req, res) => {
    res.json({
        connected: connectionStatus === 'connected',
        status: connectionStatus,
        user: sock?.user || null,
        business_number: '+65 8982 1301'
    })
})

app.get('/health', (req, res) => {
    res.json({ 
        status: 'healthy', 
        whatsapp_status: connectionStatus,
        timestamp: new Date().toISOString()
    })
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`🤖 CCC Digital WhatsApp Bot running on port ${PORT}`)
    console.log(`📞 Business number: +65 8982 1301`)
    console.log(`📧 FastAPI backend: ${FASTAPI_URL}`)
    initWhatsApp()
})