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

        const response = await processCCCMessage(phoneNumber, messageText)

        if (response) {
            await sendMessage(phoneNumber, response)
        }

    } catch (error) {
        console.error('❌ Error handling message:', error)
        await sendMessage(phoneNumber.replace('@s.whatsapp.net', ''), 
            "Sorry, I encountered a technical issue. Please call us at +65 8982 1301.")
    }
}

async function processCCCMessage(phoneNumber, messageText) {
    const text = messageText.toLowerCase().trim()

    // 1. SPECIFIC CHATBOT QUESTIONS - Handle first to prevent loops
    if (text.includes('ai chatbot') || text.includes('chatbot like') || text.includes('whatsapp chatbot') || 
        text.includes('chatbot cost') || text.includes('just chatbot') || text.includes('chatbot price') ||
        (text.includes('how much') && text.includes('chatbot'))) {
        return `🤖 **WhatsApp AI Chatbot (like this one):**

**Pricing:**
• Basic chatbot: $1,800
• Advanced with CRM: $2,500
• Full business integration: $3,500

**What you get:**
• 24/7 automated responses
• Lead capture & qualification
• Integration with your business
• Customized for your industry

**With EDG support:** Pay only $900 - $1,750
**Timeline:** 2-3 weeks to build & deploy

Want this for your business? Type "quote chatbot"
⏳ **Our consultant will get back to you within 1 business day and may contact you for more details to furnish a detailed quote.**

**Or call directly: +65 8982 1301**`
    }

    // 2. QUOTE ACKNOWLEDGMENTS
    if (text.includes('quote chatbot')) {
        return `✅ **AI Chatbot Quote Request Received!**

Our team will prepare a detailed chatbot proposal and contact you within 1 business day and may contact you for more details to furnish a detailed quote.

**We'll include:**
• Custom chatbot features for your business
• Integration requirements
• EDG funding calculation
• Implementation timeline

**Business hours:** Mon-Fri 9AM-6PM SGT

Thank you for choosing CCC! 🚀`
    }

    if (text.includes('quote')) {
        return `✅ **Quote Request Received!**

Our team will prepare a customized proposal and contact you within 1 business day and may contact you for more details to furnish a detailed quote.

**Business hours:** Mon-Fri 9AM-6PM SGT

Thank you for choosing CCC! 🚀`
    }

    // 1. SERVICES INQUIRY - Handle first
    if (text.includes('tell me about') || text.includes('your services') || text.includes('what do you offer') || 
        text.includes('what services') || text.includes('what can you do')) {
        return `🚀 **CCC specializes in digital transformation for Singapore businesses:**

**Our main services:**
• AI-powered websites & web applications
• E-commerce & online stores  
• Progressive web apps (mobile-like experience)
• AI automation & chatbots
• EDG grant application support

**We help businesses:**
• Get online presence & more customers
• Automate processes to save time
• Qualify for government funding (EDG)

What type of business do you have? I can suggest the best solution for your needs!
**Or feel free to ask me more questions and I will do my best to help! 😊**`
    }

    // 2. WELCOME - More casual and consultative
    if (text === 'hi' || text === 'hello' || text === 'start' || text === 'help') {
        return `👋 Hi there! Welcome to CCC!

I'm here to help with your digital business needs. 

**What brings you here today?**
• Looking to build a website?
• Want to set up online sales?
• Need business automation?
• Curious about government grants?
• Or something else entirely?

Let me know what you're thinking about and I'll guide you from there!
**Or feel free to ask me questions and I will do my best to help! 😊**`
    }

    // 4. CONVERSATIONAL CLARIFICATION - For unclear messages
    return `🤔 I want to help you better! Could you be more specific?

**For example:**
• "I need a website for my restaurant"
• "How much for an online store?"
• "Can you build a mobile app?"
• "Tell me about AI chatbots"
• "What is EDG funding?"

**Quick options:**
💻 Website  🛒 E-commerce  📱 Web App  🤖 AI Solutions  💰 EDG Info

**Direct contact:** +65 8982 1301
**Or feel free to ask me more questions and I will do my best to help! 😊**`

    // 3. PRICING REQUESTS - Only show pricing when specifically asked
    if (text.includes('pricing') || text.includes('how much') || text.includes('cost') || 
        text.includes('website pricing') || text.includes('price list')) {
        return `💰 **CCC Pricing Guide:**

🌐 **Websites:** $3K-$12K *(EDG: $1.5K-$6K)*
🛒 **E-commerce:** $6K-$18K *(EDG: $3K-$9K)*  
📱 **Web Apps (PWA):** $8.5K-$24K *(EDG: $4.25K-$12K)*
🤖 **AI & Automation:** $1.8K-$8.8K *(EDG: $0.9K-$4.4K)*

**EDG funding covers up to 50% of costs!**

**Popular packages:**
• Basic website + EDG: ~$1,500 total
• Online store + EDG: ~$4,500 total  
• Web app + EDG: ~$9,000 total

Which service interests you? I can explain the features and benefits!
**Or feel free to ask me more questions and I will do my best to help! 😊**`
    }

    // 4. SERVICE DESCRIPTIONS (features only, no pricing)
    if (text.includes('website') || text === '1') {
        return `🌐 **AI-Powered Websites:**

**Perfect for:**
• Professional business presence
• Lead generation & customer contact
• Showcase products/services
• Build trust & credibility

**Features we include:**
• Mobile-friendly responsive design
• AI chat integration (like this!)
• Easy content management
• SEO optimization for Google
• Contact forms & analytics

**Great for:** Consultants, service providers, small businesses, agencies

Want to know investment levels? Ask "website pricing"
**Or feel free to ask me more questions and I will do my best to help! 😊**`
    }

    // 5. E-COMMERCE DESCRIPTIONS (features only, no pricing)
    if (text.includes('ecommerce') || text.includes('e-commerce') || text.includes('online store') || text === '2') {
        return `🛒 **E-commerce & Online Stores:**

**Perfect for:**
• Retail businesses wanting online sales
• Service businesses with bookings
• B2B companies with product catalogs
• Anyone wanting 24/7 sales channel

**Features we include:**
• Product catalog & inventory management
• Secure payment processing (Stripe)
• Customer accounts & order history
• Mobile shopping experience
• Sales analytics & reporting

**Great for:** Retail stores, wholesalers, service providers

Want to know investment levels? Ask "ecommerce pricing"
**Or feel free to ask me more questions and I will do my best to help! 😊**`
    }
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

// REST API endpoints
app.get('/qr', (req, res) => {
    res.json({ qr: qrCode })
})

app.get('/status', (req, res) => {
    res.json({
        connected: connectionStatus === 'connected',
        status: connectionStatus,
        user: sock?.user || null,
        business_number: '+65 8982 1301'
    })
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`🤖 CCC Digital WhatsApp Bot running on port ${PORT}`)
    console.log(`📞 Business number: +65 8982 1301`)
    initWhatsApp()
})