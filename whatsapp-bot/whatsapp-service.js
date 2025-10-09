    // Enhanced pricing and business questions - Handle conversational queries
    if (text.includes('price range') || text.includes('why') && text.includes('price') || 
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

Which type of project are you considering? I can explain the specific features that affect pricing!`
    }

    // Business-specific advice - Handle industry questions
    if (text.includes('music shop') || text.includes('retail') || text.includes('customers') && text.includes('buying') ||
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

    // General business growth questions
    if (text.includes('more customers') || text.includes('grow business') || text.includes('increase revenue') ||
        text.includes('digital transformation') || text.includes('online presence')) {
        return `🚀 **Digital Growth Strategy for Your Business:**

**Most Popular Solutions:**
1. **Website + SEO** = More online visibility
2. **E-commerce** = 24/7 sales channel  
3. **AI Chatbot** = Better customer service
4. **PWA** = Mobile app experience without app store

**Success Formula:**
📱 Professional Website + 🛒 Online Store + 🤖 AI Support = 📈 More Customers

**EDG makes it affordable:**
• $15K typical digital transformation
• EDG covers 50% = You pay only $7.5K

What type of business do you have? I can suggest the best combination for your industry!
**Or feel free to ask me more questions and I will do my best to help! 😊**`
    }