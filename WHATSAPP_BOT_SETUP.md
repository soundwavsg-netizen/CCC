# WhatsApp Bot Integration for CCC Digital
# Business Number: +65 8982 1301

## Current Status: Number NOT YET ACTIVATED

### When Number is Activated, Complete These Steps:

## Step 1: Get CallMeBot API Key for New Number
1. From +65 8982 1301, send WhatsApp message to: +34 644 44 32 85
2. Message content: "I allow callmebot to send me messages"
3. You'll receive API key for the new number
4. Update CALLMEBOT_API_KEY in backend/.env

## Step 2: Update Backend Configuration
Update /app/backend/.env:
```
# Replace old config with new:
CALLMEBOT_API_KEY=<new_api_key_from_step_1>
CALLMEBOT_PHONE_NUMBER=6589821301
```

## Step 3: Install WhatsApp Bot Dependencies
```bash
cd /app
npm init -y
npm install @whiskeysockets/baileys qrcode-terminal redis express cors axios
```

## Step 4: WhatsApp Bot Features for CCC Digital

### Automated Responses:
- **EDG eligibility questions**
- **Basic service pricing**  
- **Project consultation scheduling**
- **Business hours information**
- **Handoff to human for complex queries**

### Integration Points:
- **Lead capture:** Qualified leads sent to existing email/notification system
- **CRM sync:** Integration with current lead management
- **Analytics:** Track WhatsApp engagement alongside web analytics

## Step 5: Bot Conversation Flow

### Welcome Message:
"👋 Hi! Welcome to CCC Digital. I'm your AI assistant. I can help with:
1️⃣ EDG funding information
2️⃣ Service pricing
3️⃣ Schedule consultation
4️⃣ Talk to human agent

Reply with a number or ask any question!"

### Lead Qualification:
- Capture: Name, Company, Project Type, Budget Range
- Forward qualified leads to email + human agent
- Schedule callbacks during business hours

## Step 6: Testing Checklist (When Active)
- [ ] QR code authentication works
- [ ] Bot responds to basic questions
- [ ] Lead capture integrates with email
- [ ] Human handoff works properly
- [ ] Business hours logic functions
- [ ] Error handling works correctly

---

## Current Configuration Status:
✅ Website updated with new number
✅ WhatsApp links updated (will work when activated)  
⏳ CallMeBot notifications: Using old number temporarily
⏳ WhatsApp bot: Ready to deploy when number is activated

**Next Action Required:** Activate +65 8982 1301, then get CallMeBot API key