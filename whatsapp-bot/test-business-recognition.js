// Test business recognition logic
const testMessage = (text) => {
    console.log(`Testing: "${text}"`);
    
    if (text.includes('ecommerce') || text.includes('e-commerce') || text.includes('selling') || 
        text.includes('shopee') || text.includes('lazada') || text.includes('online store') ||
        text.includes('polymailer') || text.includes('products') || text.includes('inventory')) {
        console.log('✅ E-COMMERCE RECOGNIZED!');
        return 'E-commerce recognition triggered';
    } else {
        console.log('❌ NOT RECOGNIZED as e-commerce');
        return 'Default response';
    }
};

// Test the exact messages from your screenshot
console.log('\n=== TESTING BUSINESS RECOGNITION ===');
testMessage('ecommerce selling polymailer on shopee mainly');
testMessage('polymailer company selling polymailers');
testMessage('selling products online');
testMessage('shopee store');
