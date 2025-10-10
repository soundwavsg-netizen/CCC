// Final test for WhatsApp bot
console.log('🔬 FINAL WHATSAPP BOT TEST\n');

// Test pricing specifically
const testPricing = (message) => {
    const text = message.toLowerCase().trim();
    if (text.includes('how much') || text.includes('cost') || text.includes('price') || text.includes('pricing')) {
        return `💰 **CCC Investment Guide:**

🌐 **Websites:** $3K-$12K *(EDG: $1.5K-$6K)*
🛒 **E-commerce:** $6K-$18K *(EDG: $3K-$9K)*
🤖 **AI Integration:** $1.8K-$8.8K *(EDG: $0.9K-$4.4K)*

**EDG covers up to 50% for Singapore companies!**

What type of solution interests you?`;
    }
    return null;
};

// Test scenarios
const tests = [
    'Hi',
    'Tell me about services', 
    'Teaching school',
    'Website with AI integration',
    'How much for a website?',
    'Quote education'
];

tests.forEach(test => {
    const pricingResult = testPricing(test);
    console.log(`"${test}" → Pricing match: ${pricingResult ? 'YES ✅' : 'NO'}`);
});
