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