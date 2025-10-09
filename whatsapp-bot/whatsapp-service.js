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

I'm your AI assistant for:
1️⃣ EDG funding information
2️⃣ Website & app pricing  
3️⃣ Schedule consultation
4️⃣ Connect with human agent

What would you like to know about? Or type a number (1-4)`
    }

    // EDG Information
    if (text.includes('edg') || text.includes('funding') || text.includes('grant') || text === '1') {
        return `💰 Enterprise Development Grant (EDG) Info:

• Covers up to 50% of digital project costs
• For websites, e-commerce, web apps, AI integration
• Singapore companies with UEN eligible
• Typical approval: 3-6 weeks

Example: $10,000 project = ~$5,000 after EDG support

Need eligibility check? Type "eligibility" or call us at +65 8982 1301`
    }

    // Pricing Information
    if (text.includes('price') || text.includes('cost') || text.includes('how much') || text === '2') {
        return `💻 CCC Digital Services & Pricing:

🌐 **Websites:** $3,000 - $12,000
🛒 **E-commerce:** $6,000 - $18,000  
📱 **Web Apps (PWA):** $8,500 - $24,000
🤖 **AI Integration:** $1,800 - $8,800

*With EDG: Pay ~50% less*

Need specific quote? Type "quote" or schedule consultation`
    }

    // Schedule Consultation
    if (text.includes('consultation') || text.includes('schedule') || text.includes('meet') || text === '3') {
        return `📅 Schedule Free Consultation:

Option 1: Call directly +65 8982 1301
Option 2: Visit our website: cccdigital.sg
Option 3: Share your details and we'll call you back

Please share:
- Your name
- Company name  
- Project type (website/app/etc)
- Preferred contact time`
    }

    // Human Agent
    if (text.includes('human') || text.includes('agent') || text.includes('person') || text === '4') {
        return `👨‍💼 Connecting you with our team...

Our consultant will call you back within 2 business hours.
Business hours: Mon-Fri 9AM-6PM SGT

For urgent matters: +65 8982 1301

Please share your name and best time to call.`
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

    // Default response for unrecognized messages
    return `🤔 I didn't quite understand that. Here's how I can help:

1️⃣ EDG funding info
2️⃣ Service pricing
3️⃣ Schedule consultation  
4️⃣ Speak with human

Type a number (1-4) or ask about:
• Website development
• E-commerce setup
• EDG eligibility
• Project quotes

Or call us directly: +65 8982 1301`
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