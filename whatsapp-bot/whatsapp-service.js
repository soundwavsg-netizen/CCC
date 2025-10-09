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

Our team will prepare a detailed chatbot proposal and contact you within 2 business hours.

**We'll include:**
• Custom chatbot features for your business
• Integration requirements
• EDG funding calculation
• Implementation timeline

**Business hours:** Mon-Fri 9AM-6PM SGT

⏳ **Please wait for our consultant to get back to you at the shortest possible time.**
Thank you for choosing CCC Digital! 🚀`
    }

    if (text.includes('quote')) {
        return `✅ **Quote Request Received!**

Our team will prepare a customized proposal and contact you within 2 business hours.

**Business hours:** Mon-Fri 9AM-6PM SGT

⏳ **Please wait for our consultant to get back to you at the shortest possible time.**
Thank you for choosing CCC Digital! 🚀`
    }

    // 3. WELCOME
    if (text === 'hi' || text === 'hello' || text === 'start' || text === 'help') {
        return `👋 Hi! Welcome to CCC Digital!

🚀 **Complete Digital Solutions:**
1️⃣ AI-Powered Websites ($3K-$12K)
2️⃣ E-commerce & Inventory ($6K-$18K)  
3️⃣ Progressive Web Apps/PWA ($8.5K-$24K)
4️⃣ AI Agents & Automation ($1.8K-$8.8K)
5️⃣ EDG Grant Advisory

💰 *All projects eligible for EDG support (pay ~50% less)*

What interests you? Ask about specific services!
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