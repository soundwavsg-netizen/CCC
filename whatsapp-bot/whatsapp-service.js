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

    // Welcome/Help responses
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
• EDG eligibility • Pricing • Timeline • Features`
    }

    // Service-specific responses
    if (text.includes('website') || text === '1') {
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

**Need a quote? Type "quote website" or call +65 8982 1301**
**Or feel free to ask me more questions and I will do my best to help! 😊**`
    }

    if (text.includes('ecommerce') || text.includes('e-commerce') || text.includes('online store') || text === '2') {
        return `🛒 **E-commerce & Inventory** ($6,000 - $18,000):

**Features:**
• Product catalog & management
• Stripe payment processing
• Customer accounts & profiles
• Inventory tracking
• Sales analytics dashboard
• Mobile-optimized checkout

**Tiers:**
• Starter (20-30 products): $6,000
• Growth (50-150 products): $9K-$12K
• Enterprise (multi-channel): $15K-$18K

*With EDG: Pay $3,000 - $9,000*

Interested? Type "quote ecommerce" or call +65 8982 1301
**Or feel free to ask me more questions and I will do my best to help! 😊**`
    }

    if (text.includes('web app') || text.includes('pwa') || text.includes('progressive') || text === '3') {
        return `📱 **Progressive Web Apps (PWA)** ($8,500 - $24,000):

**Benefits vs Native Apps:**
• Works on all devices (iOS/Android/Desktop)
• No app store approval needed
• Instant updates
• Offline functionality
• Push notifications
• 50% faster development

**Tiers:**
• Prototype: $8,500
• Full Web App: $12K-$18K  
• Premium PWA: $18K-$24K

*With EDG: Pay $4,250 - $12,000*

Ready to build? Type "quote pwa" or call +65 8982 1301
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

    // Pricing Information - Updated with full services
    if (text.includes('price') || text.includes('cost') || text.includes('how much') || text === '2' || text === 'pricing') {
        return `💻 **CCC Digital Complete Services:**

🌐 **Websites:** $3K-$12K *(EDG: $1.5K-$6K)*
🛒 **E-commerce:** $6K-$18K *(EDG: $3K-$9K)*  
📱 **Web Apps (PWA):** $8.5K-$24K *(EDG: $4.25K-$12K)*
🤖 **AI & Automation:** $1.8K-$8.8K *(EDG: $0.9K-$4.4K)*
📋 **EDG Documentation:** $800-$1,500

**Popular Packages:**
• Basic Website + EDG: ~$1,500 total cost
• Growth E-commerce + EDG: ~$4,500 total cost
• Premium PWA + EDG: ~$9,000 total cost

Which service interests you? Type the service name for details!
**Or feel free to ask me more questions and I will do my best to help! 😊**`
    }

    // Schedule Consultation - Enhanced with immediate acknowledgment
    if (text.includes('consultation') || text.includes('schedule') || text.includes('meet') || text === '3') {
        return `📅 **Consultation Request Received!**

✅ Our team will call you back within 2 business hours to schedule your FREE consultation.

**What we'll discuss:**
• Your project requirements
• EDG funding eligibility  
• Detailed cost breakdown
• Timeline & next steps

**Business hours:** Mon-Fri 9AM-6PM SGT

**To confirm your request, please share:**
• Your name
• Company name  
• Best time to call you

Or call directly: +65 8982 1301`
    }

    // Human Agent - Enhanced with immediate response
    if (text.includes('human') || text.includes('agent') || text.includes('person') || text === '4') {
        return `👨‍💼 **Human Agent Request Received!**

✅ Our consultant will prioritize your inquiry and call you back within 2 business hours.

**For immediate assistance:** +65 8982 1301

**To help our team prepare:**
• Share your name & company
• Brief description of your needs
• Preferred callback time

**Business hours:** Mon-Fri 9AM-6PM SGT
**After hours:** We'll respond first thing next business day

Thank you for your patience! 🙏`
    }

    // Quote Request
    if (text.includes('quote') || text.includes('proposal') || text.includes('estimate')) {
        return `📋 To prepare an accurate quote, I need:

1. Project type? (Website/E-commerce/Web App/AI)
2. Business name?
3. Key features needed?
4. Timeline?
5. Rough budget range?

Our team will prepare a detailed EDG-supported proposal for you.`
    }

    // Eligibility Check
    if (text.includes('eligibility') || text.includes('eligible') || text.includes('qualify')) {
        return `✅ EDG Eligibility Quick Check:

Requirements:
• Singapore-registered company (UEN)
• Project improves business capability
• Reasonable project scope & timeline

For full assessment:
1. Visit: cccdigital.sg/edg
2. Call: +65 8982 1301  
3. Or share your company details here

What's your business type and project goal?`
    }

    // EDG Information - Updated
    if (text.includes('edg') || text.includes('funding') || text.includes('grant') || text === '5') {
        return `💰 **Enterprise Development Grant (EDG):**

**Covers up to 50% of costs for:**
• Custom websites & web applications  
• E-commerce platforms
• AI automation systems
• Digital transformation projects

**Requirements:**
• Singapore-registered company (UEN)
• Project improves business capability  
• Reasonable scope & timeline

**Process with CCC:**
1. Free eligibility assessment
2. Project scope & quotation  
3. EDG application preparation
4. Implementation & documentation

**Typical approval:** 3-6 weeks

Want eligibility check? Type "eligible" or call +65 8982 1301
**Or feel free to ask me more questions and I will do my best to help! 😊**`
    }

    // Quote requests - Handle FIRST before service-specific responses
    if (text.includes('quote')) {
        // Handle specific service quotes with immediate acknowledgment
        if (text.includes('quote website') || text.includes('quote site')) {
            return `✅ **Website Quote Request Received!**

Our team will prepare a detailed website proposal and contact you within 2 business hours.

**We'll include:**
• Custom design & features
• EDG funding calculation
• Timeline & milestones
• Total cost breakdown

**Business hours:** Mon-Fri 9AM-6PM SGT
Thank you for choosing CCC Digital! 🚀`
        }
        
        if (text.includes('quote ecommerce') || text.includes('quote e-commerce') || text.includes('quote store')) {
            return `✅ **E-commerce Quote Request Received!**

Our team will prepare a detailed e-commerce proposal and contact you within 2 business hours.

**We'll include:**
• Platform features & integrations
• Product management capabilities
• EDG funding calculation
• Payment setup & logistics

**Business hours:** Mon-Fri 9AM-6PM SGT
Thank you for choosing CCC Digital! 🚀`
        }
        
        if (text.includes('quote pwa') || text.includes('quote app') || text.includes('quote web app')) {
            return `✅ **Web App Quote Request Received!**

Our team will prepare a detailed PWA proposal and contact you within 2 business hours.

**We'll include:**
• App features & functionality
• Cross-platform capabilities
• EDG funding calculation
• Development timeline

**Business hours:** Mon-Fri 9AM-6PM SGT
Thank you for choosing CCC Digital! 🚀`
        }
        
        if (text.includes('quote ai') || text.includes('quote automation') || text.includes('quote chatbot')) {
            return `✅ **AI & Automation Quote Request Received!**

Our team will prepare a detailed AI solution proposal and contact you within 2 business hours.

**We'll include:**
• AI capabilities & features
• Integration requirements
• EDG funding calculation
• Implementation roadmap

**Business hours:** Mon-Fri 9AM-6PM SGT
Thank you for choosing CCC Digital! 🚀`
        }
        
        // Generic quote request
        return `✅ **Quote Request Received!**

Our team will prepare a customized proposal and contact you within 2 business hours.

**To speed up the process, please share:**
• Your business name
• Project type needed
• Key features required
• Preferred timeline

**Business hours:** Mon-Fri 9AM-6PM SGT
Thank you for choosing CCC Digital! 🚀`
    }

    // Default response - Updated with full service list
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

Or call directly: +65 8982 1301`
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

// Health check
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