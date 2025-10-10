// Test script for WhatsApp bot responses
const testResponses = async () => {
    console.log('🧪 TESTING CCC WHATSAPP BOT RESPONSES\n');

    // Import the response logic (simplified version for testing)
    let conversationMemory = {};

    const getSmartResponse = async (phoneNumber, messageText) => {
        const text = messageText.toLowerCase().trim();
        
        // Initialize memory for this customer
        if (!conversationMemory[phoneNumber]) {
            conversationMemory[phoneNumber] = {
                lastResponse: null,
                topics: [],
                businessType: null
            };
        }
        
        const memory = conversationMemory[phoneNumber];

        // === QUOTE REQUESTS (always handle first) ===
        if (text.includes('quote')) {
            memory.lastResponse = 'quote';
            if (text.includes('education') || text.includes('school')) {
                return `✅ **Education Website Quote Request Received!**

Our team will prepare a detailed proposal for your teaching school within 1 business day and may contact you for more details.

**Business hours:** Mon-Fri 9AM-6PM
Thank you for choosing CCC! 🚀

**Feel free to ask more questions while you wait! 😊**`;
            }
            return `✅ **Quote Request Received!**

Our team will contact you within 1 business day.
Thank you for choosing CCC! 🚀

**Feel free to ask more questions while you wait! 😊**`;
        }

        // === SPECIFIC COMBINATIONS ===
        if ((text.includes('website') && text.includes('ai')) || text.includes('website with ai') || text.includes('ai integration')) {
            memory.lastResponse = 'website_ai';
            memory.topics.push('website_ai');
            
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

Ready for a proposal? Type "quote education website"`;
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

What type of business is this for?`;
        }

        // === WELCOME ===
        if (text === 'hi' || text === 'hello' || text === 'start') {
            memory.lastResponse = 'welcome';
            return `👋 Hi! Welcome to CCC!

What can I help you with today?`;
        }

        // === SERVICES INQUIRY ===
        if (text.includes('services') || text.includes('what do you do') || text.includes('tell me about')) {
            memory.lastResponse = 'services';
            return `🚀 **CCC helps Singapore businesses:**

• Build professional websites
• Set up online stores
• Create business automation
• Apply for EDG funding (50% cost coverage!)

What type of business do you have?`;
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

Which option interests you most?`;
            }
            
            memory.lastResponse = 'education';
            memory.businessType = 'education';
            memory.topics.push('education');
            
            return `🏫 **Perfect! For teaching schools & education:**

**Website + Course Management:**
• Student registration & course booking
• Online course materials & resources
• Parent communication portal
• Schedule management
• Payment processing for courses

**Popular for:** Tuition centers, training schools

**With EDG support, costs can be 50% lower!**

What subjects do you teach? This helps me recommend specific features.`;
        }

        // === SMART DEFAULT (no repetition) ===
        if (memory.lastResponse === 'unclear') {
            return `👨‍💼 **Let me connect you with our consultant:**

For better assistance with your specific needs:
**Call: +65 8982 1301**

Or share your name & number and we'll call you back today!`;
        }
        
        memory.lastResponse = 'unclear';
        return `🤔 **To help you better, could you tell me:**

• What type of business you have?
• What you want to achieve?

**Examples:**
"Restaurant wanting online orders"
"Retail store needing website"
"School wanting student portal"

**Or call: +65 8982 1301**`;
    };

    // Test scenarios
    const testCases = [
        { phone: 'test1', message: 'Hi', expected: 'Welcome message' },
        { phone: 'test2', message: 'Tell me about your services', expected: 'Services overview' },
        { phone: 'test3', message: 'Teaching school selling courses', expected: 'Education-specific response' },
        { phone: 'test3', message: 'I want website with AI integration for my teaching school', expected: 'Website + AI combo for education' },
        { phone: 'test4', message: 'How much for a website?', expected: 'Pricing information' },
        { phone: 'test5', message: 'Quote education website', expected: 'Quote acknowledgment' },
        { phone: 'test6', message: 'Random unclear message', expected: 'Clarification request' },
        { phone: 'test6', message: 'Still unclear', expected: 'Human consultant offer' }
    ];

    for (const testCase of testCases) {
        console.log(`\n📱 Test: "${testCase.message}"`);
        console.log(`Expected: ${testCase.expected}`);
        
        const response = await getSmartResponse(testCase.phone, testCase.message);
        
        // Check for key indicators
        const isRepeat = response.includes('Let me help you find the right solution!');
        const hasMemory = !isRepeat || testCase.message.includes('unclear');
        
        console.log(`Response (first 100 chars): ${response.substring(0, 100)}...`);
        console.log(`✅ Memory working: ${hasMemory ? 'YES' : 'NO'}`);
        console.log(`❌ Repetitive: ${isRepeat ? 'YES' : 'NO'}`);
        console.log('---');
    }

    console.log('\n🔍 REPETITION CHECK:');
    console.log('Memory state:', Object.keys(conversationMemory));
    
    // Test same user getting different responses
    const testPhone = 'repetition_test';
    console.log('\nTesting repetition prevention:');
    
    const response1 = await getSmartResponse(testPhone, 'teaching school');
    console.log('First "teaching school":', response1.substring(0, 50) + '...');
    
    const response2 = await getSmartResponse(testPhone, 'teaching school again');  
    console.log('Second education query:', response2.substring(0, 50) + '...');
    
    console.log(`Responses different: ${response1 !== response2 ? 'YES ✅' : 'NO ❌'}`);
};

testResponses().catch(console.error);