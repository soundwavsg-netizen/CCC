# CCC WhatsApp Bot Implementation Guide
**Complete WhatsApp Bot Logic Documentation for Reuse**

---

## 🏗️ WhatsApp Bot Architecture

### Core Files Structure:
```
/whatsapp-bot/
├── package.json (dependencies)
├── whatsapp-service.js (main bot logic)  
├── auth_info/ (WhatsApp authentication)
└── whatsapp-bot.log (operation logs)
```

### Dependencies Required:
```json
{
  "dependencies": {
    "@whiskeysockets/baileys": "^6.7.5",
    "express": "^4.19.2",
    "cors": "^2.8.5",
    "axios": "^1.6.0"
  }
}
```

---

## 🤖 Message Processing Logic

### Priority Order (Critical for preventing loops):

```javascript
async function getSmartResponse(phoneNumber, messageText) {
    const text = messageText.toLowerCase().trim()
    
    // 1. QUOTE REQUESTS (always handle first)
    if (text.includes('quote')) { /* ... */ }
    
    // 2. BUSINESS TYPE RECOGNITION  
    if (text.includes('ecommerce') || text.includes('selling')) { /* ... */ }
    
    // 3. PROMOTIONAL KEYWORDS
    if (text.includes('promo') || text.includes('promotion')) { /* ... */ }
    
    // 4. WELCOME MESSAGES
    if (text === 'hi' || text === 'hello') { /* ... */ }
    
    // 5. SERVICES INQUIRY
    if (text.includes('services')) { /* ... */ }
    
    // 6. SMART CLARIFICATION (different each time)
    return smartClarification(memory)
}
```

---

## 🎯 Business Recognition Framework

### E-commerce Recognition:
```javascript
// Keywords that indicate e-commerce business
const ecommerceKeywords = [
    'ecommerce', 'e-commerce', 'selling', 'shopee', 'lazada', 
    'online store', 'polymailer', 'products', 'inventory'
]

// Response template
if (detectBusinessType(text, ecommerceKeywords)) {
    memory.businessType = 'ecommerce'
    return ecommercePromotionalResponse()
}
```

**E-commerce Response Template:**
```
🛒 **Perfect! For e-commerce businesses like yours:**

🎁 **Year-End Special: Professional Automation Bundle**
• **Was $11,500 → Now $9,800 setup (Save $1,700!)**
• **Only $1,250/month**

**What this includes for your e-commerce:**
✅ AI chatbot for customer product inquiries
✅ WhatsApp Business API for customer service  
✅ Inventory management dashboard (CSV import/export)
✅ Customer inquiry automation
✅ Lead capture for repeat customers
✅ Automated customer service responses

**This helps you:**
• Answer product questions instantly via chat/WhatsApp
• Track inventory through dashboard (not direct Shopee API)
• Automate customer service workflows
• Capture leads and follow up automatically

**Note:** We focus on customer service automation rather than direct marketplace API integration.

**🎯 Early signup = Free AI retraining within 3 months!**

Want to see how customer automation works? Type "demo" or call +65 8982 1301
```

---

## 🏪 Industry-Specific Response Library

### Retail/Service Businesses:
**Keywords:** retail, store, shop, clinic, tuition, restaurant, salon, pharmacy
**Package:** Start-Up AI Bundle ($4,280, $580/month)
**Focus:** Customer inquiries, appointment booking, lead capture

### Professional Services:
**Keywords:** consultancy, professional service, agency, firm, lawyer, accounting, marketing  
**Package:** Professional Automation Bundle ($9,800, $1,250/month)
**Focus:** CRM integration, client qualification, document training

### Education Sector:
**Keywords:** teaching, school, education, tuition, courses, students
**Package:** Start-Up AI Bundle with education features
**Focus:** Student inquiries, course information, parent communication

---

## 🚫 Anti-Repetition System

### Conversation Memory:
```javascript
let conversationMemory = {}

// Track what we've told each customer
conversationMemory[phoneNumber] = {
    lastResponse: 'education',
    topics: ['education', 'website_ai'],
    businessType: 'education',
    clarificationCount: 0
}
```

### Escalation Logic:
```javascript
// After 2 unclear interactions
if (memory.clarificationCount >= 2) {
    return `👨‍💼 **Let me connect you with our consultant:**
    
    For better assistance with your specific needs:
    **Call: +65 8982 1301**
    
    Or share your name & number and we'll call you back today!`
}
```

---

## 🎁 Promotional Campaign Integration

### Year-End 2025 Campaign Messages:

#### Welcome Message:
```
👋 Hi! Welcome to CCC Digital!

🎁 **Year-End AI Automation Promotion!**

We help Singapore SMEs build smart websites, AI chatbots, and WhatsApp automation.

**🎯 Special offer: Save up to $2,000 on AI setup until Dec 31, 2025!**

• Website Chatbot + WhatsApp Bot: from $580/month  
• Professional AI Bundle: from $1,250/month
• Enterprise Concierge: from $1,950/month

**How can we automate your business today?**
• Reply "PROMO" for full pricing details
• Or tell me about your business!

*Limited time offer - act fast! 🚀*
```

#### PROMO Keyword Response:
```
🎁 **CCC Digital Year-End Offer: AI Chatbot & WhatsApp Bot Automation**

**3 PACKAGES AVAILABLE:**

💚 **Start-Up Bundle:** $4,280 setup (was $4,800)
💙 **Professional Bundle:** $9,800 setup (was $11,500)  
💜 **Enterprise Concierge:** $15,800 setup (was $18,500)

**🕒 Valid until December 31, 2025**
**🎯 Early signup = Free AI retraining within 3 months**

Ready to automate? Share your business type and I'll recommend the best package!
```

---

## 📞 Contact Integration

### WhatsApp Business Number: +65 8982 1301
### CallMeBot API Key: 6491265

### Contact Methods:
1. **Direct WhatsApp:** Live bot responses
2. **Voice Call:** +65 8982 1301  
3. **Website Chat:** Integrated with same AI logic
4. **Email:** glor-yeo@hotmail.com

---

## 🔄 Replication Instructions

### To Create New WhatsApp Bot from CCC Template:

1. **Copy core structure** from /whatsapp-bot/whatsapp-service.js
2. **Update business recognition** keywords for new client's industry
3. **Replace CCC branding** with new client information
4. **Update package pricing** with new client's services
5. **Modify promotional campaigns** for new client's offers
6. **Test conversation flows** to ensure no repetition loops
7. **Configure CallMeBot** with new client's WhatsApp number

### Key Configuration Points:
- **Business number** in multiple locations
- **Package pricing** throughout response templates
- **Industry keywords** for business recognition
- **Company branding** and contact information
- **Campaign messaging** for promotional periods

---

**Last Updated:** 2025-10-11
**Version:** CCC Digital v2.0 (Commercial-First with Year-End Promotion)
**Status:** Production Ready
**Tested:** ✅ Business recognition, ✅ Anti-repetition, ✅ Promotional integration