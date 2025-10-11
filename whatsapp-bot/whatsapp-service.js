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
let conversationMemory = {} // Track what we've told each customer

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
                console.log('📱 QR Code generated')
            }

            if (connection === 'close') {
                const shouldReconnect = (lastDisconnect?.error)?.output?.statusCode !== DisconnectReason.loggedOut
                connectionStatus = 'disconnected'
                if (shouldReconnect) setTimeout(initWhatsApp, 5000)
            } else if (connection === 'open') {
                console.log('✅ WhatsApp Bot connected - +65 8982 1301')
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
        console.error('Error:', error)
        setTimeout(initWhatsApp, 10000)
    }
}

async function handleIncomingMessage(message) {
    try {
        const phoneNumber = message.key.remoteJid.replace('@s.whatsapp.net', '')
        const messageText = message.message.conversation || message.message.extendedTextMessage?.text || ''
        
        console.log(`Message from ${phoneNumber}: ${messageText}`)
        
        const response = await getSmartResponse(phoneNumber, messageText)
        
        if (response) {
            await sendMessage(phoneNumber, response)
        }

    } catch (error) {
        console.error('Error handling message:', error)
    }
}

async function getSmartResponse(phoneNumber, messageText) {
    const text = messageText.toLowerCase().trim()
    
    // Initialize memory for this customer
    if (!conversationMemory[phoneNumber]) {
        conversationMemory[phoneNumber] = {
            lastResponse: null,
            topics: [],
            businessType: null
        }
    }
    
    const memory = conversationMemory[phoneNumber]

    // === QUOTE REQUESTS (always handle first) ===
    if (text.includes('quote')) {
        memory.lastResponse = 'quote'
        if (text.includes('education') || text.includes('school')) {
            return `✅ **Education Website Quote Request Received!**

Our team will prepare a detailed proposal for your teaching school within 1 business day and may contact you for more details.

**Business hours:** Mon-Fri 9AM-6PM
Thank you for choosing CCC! 🚀

**Feel free to ask more questions while you wait! 😊**`
        }
        return `✅ **Quote Request Received!**

Our team will contact you within 1 business day.
Thank you for choosing CCC! 🚀

**Feel free to ask more questions while you wait! 😊**`
    }

    // === SPECIFIC COMBINATIONS ===
    if ((text.includes('website') && text.includes('ai')) || text.includes('website with ai') || text.includes('ai integration')) {
        memory.lastResponse = 'website_ai'
        memory.topics.push('website_ai')
        
        if (text.includes('school') || text.includes('teaching') || memory.businessType === 'education') {
            return `🏫 **Website + AI Integration for Teaching Schools:**

**Perfect combination for education:**
• Professional school website
• AI chatbot for student/parent inquiries
• Course information & enrollment
• Automated FAQ responses
• Lead capture for new students

**Typical setup:**
• School website: $6,000-$9,000
• AI chatbot integration: $2,000-$3,000
• **Total:** $8,000-$12,000
• **With EDG:** Pay only $4,000-$6,000!

Ready for a proposal? Type "quote education website"`
        }
        
        return `🤖 **Website + AI Integration:**

**Powerful combination:**
• Professional website
• AI chatbot (like this one!)
• Lead capture automation
• Customer service enhancement
• 24/7 visitor engagement

**Investment:** $8,000-$15,000
**With EDG:** Pay only $4,000-$7,500

What type of business is this for?`
    }

    // 2. WELCOME - Year-End Promotion
    if (text === 'hi' || text === 'hello' || text === 'start') {
        memory.lastResponse = 'welcome'
        return `👋 Hi! Welcome to CCC Digital!

🎁 **Year-End AI Automation Promotion!**

We help Singapore SMEs build smart websites, AI chatbots, and WhatsApp automation.

**🎯 Special offer: Save up to $2,000 on AI setup until Dec 31, 2025!**

• Website Chatbot + WhatsApp Bot: from $580/month  
• Professional AI Bundle: from $1,250/month
• Enterprise Concierge: from $1,950/month

**How can we automate your business today?**
• Reply "PROMO" for full pricing details
• Or tell me about your business!

*Limited time offer - act fast! 🚀*`
    }

    // PROMO keyword response
    if (text.includes('promo') || text.includes('promotion') || text.includes('offer') || text.includes('pricing')) {
        memory.lastResponse = 'promo'
        return `🎁 **CCC Digital Year-End Offer: AI Chatbot & WhatsApp Bot Automation**

**3 PACKAGES AVAILABLE:**

💚 **Start-Up Bundle:** $4,280 setup (was $4,800)
• Website chatbot + WhatsApp simple setup
• Perfect for small businesses
• Only $580/month

💙 **Professional Bundle:** $9,800 setup (was $11,500)  
• AI trained on your documents + WhatsApp Business API
• Perfect for SMEs & professional services
• Only $1,250/month

💜 **Enterprise Concierge:** $15,800 setup (was $18,500)
• Full AI concierge with CRM integration
• Perfect for enterprises
• Only $1,950/month

**🕒 Valid until December 31, 2025**
**🎯 Early signup = Free AI retraining within 3 months**

Ready to automate? Share your business type and I'll recommend the best package!`
    }

    // 3. SERVICES INQUIRY - Commercial focus
    if (text.includes('services') || text.includes('what do you do') || text.includes('tell me about')) {
        memory.lastResponse = 'services'
        return `🚀 **CCC Digital builds smart business solutions:**

**Our main services:**
• Professional websites & e-commerce platforms
• AI chatbots & workflow automation
• WhatsApp business integration (like this chat!)
• CRM & analytics systems
• Custom web portals

**We help businesses:**
• Get more customers online
• Automate repetitive tasks
• Engage customers 24/7
• Streamline operations

*Plus optional EDG funding support for eligible projects*

What type of business do you run?`
    }

    // === E-COMMERCE BUSINESS RECOGNITION ===
    if (text.includes('ecommerce') || text.includes('e-commerce') || text.includes('selling') || 
        text.includes('shopee') || text.includes('lazada') || text.includes('online store') ||
        text.includes('polymailer') || text.includes('products') || text.includes('inventory')) {
        
        memory.lastResponse = 'ecommerce_business'
        memory.businessType = 'ecommerce'
        
        return `🛒 **Perfect! For e-commerce businesses selling on platforms like Shopee:**

🎁 **Year-End Special: Professional Automation Bundle**
• **Was $11,500 → Now $9,800 setup (Save $1,700!)**
• **Only $1,250/month**

**Perfect for your e-commerce business:**
✅ AI chatbot for customer inquiries
✅ WhatsApp Business API for order updates  
✅ Integration with Shopee/marketplace orders
✅ Inventory management automation
✅ Customer service automation

**This package helps you:**
• Handle customer questions 24/7
• Automate order confirmations via WhatsApp
• Manage inventory across platforms
• Reduce manual customer service work

**🎯 Early signup = Free AI retraining within 3 months!**

Want to see how this works for polymailer/e-commerce businesses? Type "demo" or call +65 8982 1301`
    }
    if (text.includes('how much') || text.includes('cost') || text.includes('price') || text.includes('pricing')) {
        memory.lastResponse = 'pricing'
        return `💰 **CCC Investment Guide:**

🌐 **Websites:** $3K-$12K *(EDG: $1.5K-$6K)*
🛒 **E-commerce:** $6K-$18K *(EDG: $3K-$9K)*
🤖 **AI Integration:** $1.8K-$8.8K *(EDG: $0.9K-$4.4K)*

**EDG covers up to 50% for Singapore companies!**

What type of solution interests you?`
    }

    // === EDUCATION/TEACHING BUSINESS ===
    if (text.includes('teaching') || text.includes('school') || text.includes('education') || text.includes('tuition')) {
        // Avoid repetition if we already identified them as education
        if (memory.lastResponse === 'education') {
            return `📚 **Since you're in education, here are next steps:**

1. **Basic school website:** $3,000-$6,000
2. **Website + online enrollment:** $6,000-$9,000
3. **Full platform with AI:** $8,000-$12,000

**All qualify for EDG support (pay 50% less!)**

Which option interests you most?`
        }
        
        memory.lastResponse = 'education'
        memory.businessType = 'education'
        memory.topics.push('education')
        
        return `🏫 **Perfect! For teaching schools & education:**

**Website + Course Management:**
• Student registration & course booking
• Online course materials & resources
• Parent communication portal
• Schedule management
• Payment processing for courses

**Popular for:** Tuition centers, training schools

**With EDG support, costs can be 50% lower!**

What subjects do you teach? This helps me recommend specific features.`
    }

    // === RETAIL/PHYSICAL STORE RECOGNITION ===
    if (text.includes('retail') || text.includes('store') || text.includes('shop') || 
        text.includes('clinic') || text.includes('tuition') || text.includes('restaurant') ||
        text.includes('salon') || text.includes('pharmacy')) {
        
        memory.lastResponse = 'retail_business'
        memory.businessType = 'retail'
        
        return `🏪 **Great! For retail/service businesses like yours:**

🎁 **Year-End Special: Start-Up AI Bundle**
• **Was $4,800 → Now $4,280 setup (Save $520!)**
• **Only $580/month**

**Perfect for your ${text.includes('tuition') ? 'tuition center' : text.includes('clinic') ? 'clinic' : text.includes('restaurant') ? 'restaurant' : 'business'}:**
✅ Website AI chatbot for inquiries
✅ WhatsApp bot for appointments/orders
✅ Customer qualification & lead capture
✅ Automated responses for common questions
✅ Integration with your current systems

**This helps you:**
• Answer customer questions instantly
• Book appointments via WhatsApp
• Capture leads automatically
• Reduce phone calls and manual work

**🎯 Early signup = Free AI retraining within 3 months!**

Ready to automate? Type "startup bundle" or call +65 8982 1301`
    }

    // === BUSINESS SERVICE RECOGNITION ===
    if (text.includes('consultancy') || text.includes('professional service') || 
        text.includes('agency') || text.includes('firm') || text.includes('lawyer') ||
        text.includes('accounting') || text.includes('marketing')) {
        
        memory.lastResponse = 'professional_service'
        memory.businessType = 'professional'
        
        return `🏢 **Excellent! For professional service businesses:**

🎁 **Year-End Special: Professional Automation Bundle**
• **Was $11,500 → Now $9,800 setup (Save $1,700!)**
• **Only $1,250/month**

**Perfect for professional services:**
✅ AI chatbot trained on your service documents
✅ WhatsApp Business API for client communication
✅ CRM integration (HubSpot/Salesforce)
✅ Automated client qualification
✅ Professional response flows
✅ Lead nurturing automation

**This helps you:**
• Qualify prospects automatically
• Provide instant service information
• Schedule consultations efficiently
• Nurture leads with follow-ups

**🎯 Early signup = Free AI retraining within 3 months!**

Want to see how this works for your industry? Type "professional demo" or call +65 8982 1301`
    }
    // === PRICING REQUESTS ===
    if (text.includes('how much') || text.includes('cost') || text.includes('price') || text.includes('pricing')) {
        memory.lastResponse = 'pricing'
        return `💰 **CCC Investment Guide:**

🌐 **Websites:** $3K-$12K *(EDG: $1.5K-$6K)*
🛒 **E-commerce:** $6K-$18K *(EDG: $3K-$9K)*
🤖 **AI Integration:** $1.8K-$8.8K *(EDG: $0.9K-$4.4K)*

**EDG covers up to 50% for Singapore companies!**

What type of solution interests you?`
    }

    // === SMART DEFAULT (no repetition) ===
    if (memory.lastResponse === 'unclear') {
        return `👨‍💼 **Let me connect you with our consultant:**

For better assistance with your specific needs:
**Call: +65 8982 1301**

Or share your name & number and we'll call you back today!`
    }
    
    memory.lastResponse = 'unclear'
    return `🤔 **To help you better, could you tell me:**

• What type of business you have?
• What you want to achieve?

**Examples:**
"Restaurant wanting online orders"
"Retail store needing website"
"School wanting student portal"

**Or call: +65 8982 1301**`
}

async function sendMessage(phoneNumber, text) {
    try {
        if (!sock) return { success: false }
        
        const jid = phoneNumber.includes('@') ? phoneNumber : `${phoneNumber}@s.whatsapp.net`
        await sock.sendMessage(jid, { text })
        console.log(`✅ Sent to ${phoneNumber}`)
        return { success: true }
    } catch (error) {
        console.error('Send error:', error)
        return { success: false }
    }
}

// API endpoints
app.get('/qr', (req, res) => res.json({ qr: qrCode }))
app.get('/status', (req, res) => res.json({
    connected: connectionStatus === 'connected',
    status: connectionStatus,
    user: sock?.user || null,
    business_number: '+65 8982 1301'
}))

const PORT = 3001
app.listen(PORT, () => {
    console.log(`WhatsApp Bot running on port ${PORT}`)
    initWhatsApp()
})