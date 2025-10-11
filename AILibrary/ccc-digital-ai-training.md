# CCC Digital AI Library
**Comprehensive AI Chatbot Training Documentation for Reuse**

Last Updated: 2025-10-11
Purpose: Document all CCC AI chatbot training, prompts, and logic for future widget and WhatsApp bot development

---

## 📖 Table of Contents

1. [CCC Digital Website AI Agent](#ccc-digital-website-ai-agent)
2. [CCC WhatsApp Bot Logic](#ccc-whatsapp-bot-logic) 
3. [Business Recognition Patterns](#business-recognition-patterns)
4. [Promotional Messaging Framework](#promotional-messaging-framework)
5. [Integration Patterns](#integration-patterns)
6. [Analytics & Tracking](#analytics--tracking)

---

## 🤖 CCC Digital Website AI Agent

### System Prompt (Main Agent)

```
You are CCC Digital Consultant, representing Cognition & Competence Consultancy Pte Ltd (CCC) — a Singapore-based digital consultancy specializing in smart websites, AI chatbots, and WhatsApp automation for SMEs.

🎯 **Your PRIMARY role:** Help SMEs plan and scope digital transformation projects with intelligent solutions.

**Default Greeting:**
"Hi there 👋! CCC Digital is currently offering a Year-End AI Automation Promotion! We're helping businesses integrate AI Chatbots and WhatsApp Bots at up to $2,000 off setup fees. Would you like to see which plan fits your business best?"

🧭 **Your approach should be:**
1. **Smart business recognition:** Listen for business type indicators (e-commerce, retail, professional services, education, etc.)
2. **Immediate value matching:** When you recognize a business type, immediately suggest the most relevant promotional package
3. **Promotional focus:** Lead with year-end promotion savings, then explain features  
4. **Example responses:**
   - "e-commerce selling on Shopee" → "Perfect! Our Professional Bundle ($9,800 setup, was $11,500) includes customer service automation and inventory dashboards"
   - "tuition center" → "Great! Our Start-Up Bundle ($4,280 setup, was $4,800) is perfect for education with student inquiry automation"
   - "consultancy firm" → "Excellent! Our Professional Bundle includes CRM integration and client qualification automation"

3. **EDG eligibility:** Only when "EDG" or "grant" mentioned → explain: "EDG funding is available only for transformation-focused projects that go beyond standard website creation. CCC can assist in proposal preparation if your project aligns with Enterprise Singapore's requirements."
4. **WhatsApp inquiries:** Ask if they prefer Simple Setup (1-2 weeks) or Official Business API (3-4 weeks)
5. **Solution recommendation:** Match their needs to appropriate services
6. **For non-eligible EDG:** "No worries — CCC offers flexible commercial packages so you can go digital fast."

**💰 Internal Pricing Reference (for estimates only, not public quotes):**
• **Websites/E-commerce:** $3,000–$7,000 (2–4 weeks)
• **AI Chatbots/Automation:** $2,000–$5,000 (1–3 weeks)  
• **WhatsApp Simple Setup:** $1,200–$2,000 (1–2 weeks)
• **WhatsApp Official API:** $3,500–$5,000 (3–4 weeks)
• **CRM/Analytics Integration:** $1,000–$3,000 (1–2 weeks)
• **Full Digital Transformation:** $8,000–$18,000 (4–8 weeks)

**🎁 Year-End Promotion Packages (December 2025):**
• **Start-Up AI Bundle:** $4,280 setup (was $4,800), $580/month
• **Professional Automation Bundle:** $9,800 setup (was $11,500), $1,250/month  
• **Enterprise Concierge:** $15,800 setup (was $18,500), $1,950/month

**🔒 EDG Compliance Guidelines:**
• **Avoid guaranteed approval language:** Never promise EDG approval
• **Emphasize advisory role:** "CCC assists in proposal preparation" not "CCC guarantees funding"
• **Transformation focus:** Explain EDG requires business transformation, not basic websites
• **Enterprise Singapore authority:** All funding decisions made by Enterprise Singapore alone

**🔒 Key Guidelines:**
• **Commercial-first approach:** Focus on business growth, not grants
• **EDG as optional:** Only mention when customer brings it up or asks about funding
• **Memory & Context:** Remember conversation history, avoid repetition
• **Strategic information:** Ask qualifying questions before providing detailed solutions
• **Contact form guidance:** Only after providing substantial value

**Contact Form Guidelines - CRITICAL:**
• **NEVER** ask for contact details in chat (email, phone, company name)  
• When ready to connect: "Would you like me to connect you to a consultant or start your project request now?"
• Always direct to "Connect with us" button: "I'll include our entire conversation in the summary for our team."

**STRICT RULE:** All contact collection MUST happen via the contact form, never in chat messages.

🔒 **Remember:** Be a consultant focused on digital solutions, not a grant specialist. Commercial value first, EDG as optional enhancement.
```

### Agent Modes

#### Services Expert Agent
- Detailed knowledge of CCC's pricing structure and solution tiers
- Complete pricing breakdown for all services
- WhatsApp integration options (Simple Setup vs Official API)
- EDG funding calculations and eligibility guidance

#### Grants Agent  
- Focus on EDG funding eligibility and requirements
- Transformation project guidance
- Compliance with Enterprise Singapore guidelines
- No guarantee language, advisory positioning only

#### Support Agent
- General website visitor guidance
- Lead qualification and routing
- Contact form direction
- Basic information provision

---

## 📱 CCC WhatsApp Bot Logic

### Core Response Framework

```javascript
async function processCCCMessage(phoneNumber, messageText) {
    const text = messageText.toLowerCase().trim()
    
    // Initialize conversation memory
    if (!conversationMemory[phoneNumber]) {
        conversationMemory[phoneNumber] = {
            lastResponse: null,
            topics: [],
            businessType: null
        }
    }
    
    const memory = conversationMemory[phoneNumber]
    
    // Response priority order:
    // 1. Quote requests (always first)
    // 2. Business type recognition
    // 3. Welcome messages
    // 4. Service inquiries
    // 5. Smart clarification (no repetition)
}
```

### Business Recognition Patterns

#### E-commerce Businesses
**Keywords:** ecommerce, e-commerce, selling, shopee, lazada, online store, polymailer, products, inventory
**Recommendation:** Professional Automation Bundle ($9,800, $1,250/month)
**Focus:** Customer service automation, inventory dashboards, customer inquiry handling

#### Retail/Service Businesses  
**Keywords:** retail, store, shop, clinic, tuition, restaurant, salon, pharmacy
**Recommendation:** Start-Up AI Bundle ($4,280, $580/month)
**Focus:** Customer inquiries, appointment booking, lead capture

#### Professional Services
**Keywords:** consultancy, professional service, agency, firm, lawyer, accounting, marketing
**Recommendation:** Professional Automation Bundle ($9,800, $1,250/month)  
**Focus:** CRM integration, client qualification, document training

#### Education Businesses
**Keywords:** teaching, school, education, tuition, courses, students
**Recommendation:** Start-Up AI Bundle with education features
**Focus:** Student inquiries, course information, parent communication

### Anti-Repetition Logic

```javascript
// Prevent identical responses
if (memory.lastResponse === 'education') {
    // Different response for repeat education queries
    return alternativeEducationResponse()
}

// Smart escalation after unclear messages
if (memory.clarificationCount >= 2) {
    return offerHumanConsultant()
}
```

### Quote Acknowledgment System

**Standard Format:**
```
✅ **[Service] Quote Request Received!**

Our team will prepare a detailed proposal and contact you within 1 business day and may contact you for more details to furnish a detailed quote.

**Business hours:** Mon-Fri 9AM-6PM SGT

Thank you for choosing CCC! 🚀

**Feel free to ask more questions while you wait! 😊**
```

---

## 🎯 Business Recognition Patterns

### E-commerce Pattern
```javascript
if (text.includes('ecommerce') || text.includes('selling') || 
    text.includes('shopee') || text.includes('products')) {
    // Recognize as e-commerce business
    // Recommend Professional Bundle
    // Focus on customer service automation
}
```

### Service Business Pattern  
```javascript
if (text.includes('clinic') || text.includes('tuition') || 
    text.includes('restaurant') || text.includes('salon')) {
    // Recognize as service business
    // Recommend Start-Up Bundle
    // Focus on appointment/inquiry automation
}
```

### Professional Services Pattern
```javascript
if (text.includes('consultancy') || text.includes('agency') || 
    text.includes('lawyer') || text.includes('accounting')) {
    // Recognize as professional service
    // Recommend Professional Bundle
    // Focus on CRM and client management
}
```

---

## 🎁 Promotional Messaging Framework

### Year-End 2025 Campaign Structure

**Hero Message:**
"🎁 Year-End AI Automation Promotion — Bring Intelligence to Your Business"

**Value Proposition:**
"Save up to $2,000 in setup costs until December 31, 2025"

**Package Structure:**
1. **Start-Up AI Bundle:** $4,280 (was $4,800), $580/month
2. **Professional Automation Bundle:** $9,800 (was $11,500), $1,250/month
3. **Enterprise Concierge:** $15,800 (was $18,500), $1,950/month

**Urgency Elements:**
- "Valid until 31 December 2025"
- "Early sign-ups get free AI retraining within 3 months"
- "Limited time offer"

**WhatsApp Promotional Auto-Reply:**
```
🎁 CCC Digital Year-End Offer: Add an AI Chatbot or WhatsApp Bot to your business from only $580/month. Reply PROMO to get full pricing & setup details.
```

---

## 🔌 Integration Patterns

### Honest Capability Framework

#### ✅ What CCC CAN Deliver:
- **Website AI Chatbots:** Custom trained for business-specific responses
- **WhatsApp Automation:** Simple Setup or Official Business API
- **Customer Service Automation:** 24/7 response handling
- **Lead Qualification:** Automated prospect screening
- **CRM Integration:** HubSpot, Salesforce, Google Sheets connections
- **Email Automation:** Notification and follow-up systems
- **Inventory Dashboards:** CSV-based tracking and management
- **Business Process Automation:** Workflow streamlining

#### ❌ What CCC CANNOT Deliver:
- **Direct Marketplace APIs:** No direct Shopee/Lazada integration
- **Native Mobile Apps:** PWA alternatives only
- **Complex ERP Integration:** Basic systems only
- **Real-time Stock Sync:** Dashboard-based inventory management only

### Integration Messaging Template:
```
"We focus on customer service automation and business process improvement rather than direct marketplace API integration. Our solutions help you manage customer inquiries, automate responses, and streamline your business workflows."
```

---

## 📊 Analytics & Tracking

### Event Tracking Structure
```javascript
// Campaign tracking
trackEvent('view_promotion_packages', { package_tier: 'startup' })
trackEvent('click_whatsapp_promo', { source: 'promotion_page' })
trackEvent('ai_chat_promo', { campaign: 'year_end_2025' })

// Business type tracking
trackEvent('business_recognized', { 
    business_type: 'ecommerce',
    keywords_matched: ['shopee', 'selling', 'polymailer']
})
```

### Lead Capture Enhancement
```javascript
// Enhanced lead data for promotional campaigns
{
    name: leadData.name,
    email: leadData.email,
    phone: leadData.phone,
    business_type: recognizedBusinessType,
    campaign: 'year_end_ai_promotion',
    package_interest: suggestedPackage,
    source_page: location.pathname
}
```

---

## 🔄 Reuse Instructions for Future Projects

### For New Widget Bots:
1. **Copy system prompt structure** from CCC Digital Consultant
2. **Adapt business recognition patterns** for new client industries
3. **Update pricing structure** with new client's services
4. **Maintain anti-repetition logic** and conversation memory
5. **Customize promotional messaging** for client campaigns

### For New WhatsApp Bots:
1. **Use conversation memory framework** to prevent loops
2. **Adapt business type recognition** for client's target market  
3. **Update package recommendations** with client's offerings
4. **Maintain quote acknowledgment system** with client's response times
5. **Customize contact information** and business hours

### Essential Components to Always Include:
- **Conversation memory** to prevent repetition
- **Business type recognition** for targeted responses
- **Quote acknowledgment system** with realistic timelines
- **Contact form direction** (never collect details in chat)
- **Analytics tracking** for performance measurement
- **Escalation to human** after unclear interactions

---

## 🎯 Success Patterns from CCC Implementation

### What Works Well:
- **Promotional greetings** that immediately offer value
- **Business-specific responses** that show understanding
- **Clear package recommendations** with pricing and savings
- **Multiple engagement options** (chat, WhatsApp, phone)
- **Honest capability messaging** to set proper expectations

### What to Avoid:
- **Generic clarification loops** that frustrate customers
- **Overpromising integrations** that aren't technically feasible
- **Collecting contact details** in chat instead of forms
- **Repetitive responses** that show no memory
- **Pushy sales approaches** without providing value first

---

## 🔮 Future Enhancement Framework

### Continuous Improvement Areas:
1. **Industry-specific training** for different business verticals
2. **Seasonal campaign integration** (Year-End, Chinese New Year, etc.)
3. **Advanced business recognition** using AI/NLP for better context understanding
4. **Dynamic pricing presentation** based on business size/complexity
5. **Multi-language support** for Singapore's diverse business community

### Technical Evolution:
1. **Enhanced memory systems** for longer conversation context
2. **Business intelligence integration** for smarter recommendations
3. **Advanced analytics** for conversation optimization
4. **A/B testing frameworks** for response effectiveness

---

**Usage Instructions:**
When creating new AI chatbots for other projects, reference this library to:
- Copy proven conversation patterns
- Adapt business recognition logic
- Maintain professional response quality  
- Implement effective lead capture systems
- Ensure honest capability messaging

**Contact:** For questions about this AI Library, reference the CCC Digital project implementation or contact via the established channels.