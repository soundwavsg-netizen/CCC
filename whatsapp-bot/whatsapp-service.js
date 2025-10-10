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
let conversationHistory = {} // Track conversation per phone number

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
    
    // Initialize conversation history for this number
    if (!conversationHistory[phoneNumber]) {
        conversationHistory[phoneNumber] = {
            responses: [],
            lastResponseType: null,
            clarificationCount: 0
        }
    }
    
    const history = conversationHistory[phoneNumber]

    // 1. QUOTE REQUESTS - Always handle first
    if (text.includes('quote')) {
        if (text.includes('quote chatbot') || text.includes('quote ai')) {
            const response = `✅ **AI Chatbot Quote Request Received!**

Our team will prepare a detailed chatbot proposal and contact you within 1 business day and may contact you for more details to furnish a detailed quote.

**We'll include:**
• Custom chatbot features for your business
• Integration requirements
• EDG funding calculation
• Implementation timeline

**Business hours:** Mon-Fri 9AM-6PM SGT

Thank you for choosing CCC! 🚀

**Feel free to ask me more questions while you wait! 😊**`
            history.responses.push('quote_acknowledgment')
            return response
        }
        
        const response = `✅ **Quote Request Received!**

Our team will prepare a customized proposal and contact you within 1 business day and may contact you for more details to furnish a detailed quote.

**Business hours:** Mon-Fri 9AM-6PM SGT

Thank you for choosing CCC! 🚀

**Feel free to ask me more questions while you wait! 😊**`
        history.responses.push('quote_acknowledgment')
        return response
    }

    // 2. WELCOME
    if (text === 'hi' || text === 'hello' || text === 'start') {
        history.responses.push('welcome')
        return `👋 Hi there! Welcome to CCC!

I'm here to help with your digital business needs.

**What brings you here today?**
• Looking to build a website?
• Want to set up online sales?
• Need business automation?
• Curious about government grants?
• Or something else entirely?

Let me know what you're thinking about!`
    }

    // 3. SERVICES INQUIRY
    if (text.includes('tell me about') || text.includes('your services') || text.includes('what do you offer') || 
        text.includes('what services') || text.includes('what can you do')) {
        history.responses.push('services_overview')
        return `🚀 **CCC helps Singapore businesses go digital:**

**Our specialties:**
• Professional websites & web apps
• E-commerce & online stores  
• Business automation & AI
• Government grant applications (EDG)

**We help businesses:**
• Get more customers online
• Streamline operations
• Access government funding

What type of business do you run? I can suggest the perfect solution!`
    }

    // 4. BUSINESS-SPECIFIC RESPONSES (Handle specific industries)
    if (text.includes('teaching') || text.includes('school') || text.includes('education') || text.includes('courses') || text.includes('tuition')) {
        history.responses.push('education_business')
        return `🏫 **Perfect! For teaching schools & education businesses:**

**Website + Course Management:**
• Student registration & course booking
• Online course materials & resources
• Parent communication portal
• Schedule management
• Payment processing for courses

**Popular for:** Tuition centers, training schools, enrichment programs

**With EDG support, development costs can be 50% lower!**

**What subjects do you teach?** This helps me recommend specific features like:
• Student progress tracking
• Online assignments & homework
• Video lesson integration
• Automated class reminders

Want a detailed proposal? Type "quote education"`
    }

    // 5. WEBSITE INQUIRIES
    if (text.includes('website') || text === '1') {
        if (history.responses.includes('website_features')) {
            // Different response if already explained websites
            return `🌐 **Let me be more specific about websites:**

**What's your main goal?**
• Get more customers to find you?
• Showcase your work/products?
• Accept bookings or appointments?
• Sell products online?
• Build trust & credibility?

Knowing your goal helps me recommend the right features and approach.`
        } else {
            history.responses.push('website_features')
            return `🌐 **AI-Powered Websites:**

**Perfect for businesses wanting:**
• Professional online presence
• Lead generation from Google
• Customer contact & trust building
• Showcase products/services

**Key features:**
• Mobile-responsive design
• AI chat integration (like this!)
• Easy content management
• SEO optimization
• Contact forms & analytics

**What industry is your business in?** I can share specific examples.`
        }
    }

    // 6. PRICING REQUESTS
    if (text.includes('pricing') || text.includes('how much') || text.includes('cost')) {
        history.responses.push('pricing_shown')
        return `💰 **CCC Investment Guide:**

🌐 **Websites:** $3K-$12K *(with EDG: $1.5K-$6K)*
🛒 **E-commerce:** $6K-$18K *(with EDG: $3K-$9K)*  
📱 **Web Apps:** $8.5K-$24K *(with EDG: $4.25K-$12K)*
🤖 **AI & Automation:** $1.8K-$8.8K *(with EDG: $0.9K-$4.4K)*

**EDG funding covers up to 50% for qualifying Singapore companies!**

Which service fits your business needs?`
    }

    // 7. SMART CLARIFICATION - Different responses based on attempts
    if (history.clarificationCount >= 2) {
        // After 2 clarification attempts, offer human help
        return `👨‍💼 **Let me connect you with our human consultant!**

I want to make sure you get the best help possible.

**Our team can discuss:**
• Your specific business needs
• Tailored solution recommendations  
• Exact pricing for your project
• EDG funding eligibility

**Call directly: +65 8982 1301**
**Or share your name & number, and we'll call you back today!**`
    } else if (history.clarificationCount === 1) {
        // Second clarification - more direct
        history.clarificationCount++
        return `💡 **Let me try a different approach:**

**What's your business?** (e.g., restaurant, retail store, consultancy)
**What's your biggest challenge?** (e.g., need more customers, want online sales)

**Or pick a topic:**
• Website for my business
• Online store setup  
• AI automation
• Government funding

**Quick call works best: +65 8982 1301**`
    } else {
        // First clarification
        history.clarificationCount++
        return `🤔 Let me help you find the right solution!

**Could you share more about:**
• What type of business you have?
• What challenge you're trying to solve?
• What you hope to achieve?

**Examples:**
"I run a restaurant and need more online orders"
"I have a retail store wanting online sales"
"I need to automate my customer service"

**For immediate help, call: +65 8982 1301**`
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