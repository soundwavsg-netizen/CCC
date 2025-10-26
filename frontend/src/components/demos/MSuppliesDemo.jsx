import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { 
  ExternalLink, 
  MessageCircle, 
  ShoppingCart, 
  Package,
  ArrowLeft,
  Target,
  Send,
  X,
  Zap,
  Gift,
  Users,
  BarChart3,
  Mail
} from 'lucide-react';
import { trackEvent } from '../../utils/analytics';

const MSuppliesDemo = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const messagesEndRef = useRef(null);

  // M Supplies backend URL (adjust to actual M Supplies chatbot endpoint)
  const MSUPPLIES_BACKEND_URL = 'https://www.msupplies.sg/api';

  useEffect(() => {
    // Analytics tracking
    trackEvent('view_demo_page', { vertical: 'ecommerce', page: 'msupplies' });
    
    // Set SEO
    document.title = "E-commerce Chatbot Demo | CCC Digital";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.content = "Product Q&A, delivery support, order guidance, lead capture.";
    }
  }, []);

  // Initialize demo
  useEffect(() => {
    if (isOpen && !sessionId) {
      setSessionId(Date.now().toString());
      setMessages([{
        id: 'welcome',
        text: 'Hi! I am M Supplies AI Assistant Demo. I can help you with product information, polymailer sizing, delivery options, and bulk pricing. Try asking about polymailer colors or shipping to Malaysia!',
        sender: 'bot',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    }
  }, [isOpen, sessionId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const cleanText = (text) => {
    if (!text || typeof text !== 'string') return '';
    return text.replace(/\\r\\n/g, '\\n').replace(/\\r/g, '\\n').trim();
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMsg = {
      id: Date.now().toString(),
      text: cleanText(inputMessage),
      sender: 'user',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // For demo purposes, simulate M Supplies AI responses
      const simulatedResponse = generateMSuppliesResponse(inputMessage);
      
      const botMsg = {
        id: Date.now().toString(),
        text: simulatedResponse,
        sender: 'bot',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      // Simulate network delay
      setTimeout(() => {
        setMessages(prev => [...prev, botMsg]);
        setIsLoading(false);
      }, 1000 + Math.random() * 1000);

    } catch (error) {
      console.error('Chat error:', error);
      const errorMsg = {
        id: 'error-' + Date.now(),
        text: 'Demo connection issue. This showcases M Supplies chatbot capabilities. Please try again.',
        sender: 'bot',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
      setIsLoading(false);
    }
  };

  // Simulate M Supplies AI responses
  const generateMSuppliesResponse = (input) => {
    const text = input.toLowerCase();
    
    if (text.includes('polymailer') || text.includes('size') || text.includes('color')) {
      return `🌈 **M Supplies Polymailers:**

📦 **Available Sizes:**
• Small: 17cm x 30cm (suitable for documents)
• Medium: 25cm x 35cm (clothing, accessories)  
• Large: 35cm x 45cm (shoes, bulky items)
• Custom sizes available for bulk orders

🎨 **Popular Colors:**
• Classic White • Vibrant Pink • Ocean Blue • Forest Green
• Rainbow Palace collection: 12 vibrant colors available

💰 **Pricing (50+ pieces):**
• Small: $0.45 each • Medium: $0.65 each • Large: $0.85 each
• Bulk discounts available for 500+ pieces

Would you like information about delivery or custom branding options?`;
    }
    
    if (text.includes('delivery') || text.includes('shipping') || text.includes('malaysia')) {
      return `🚚 **M Supplies Delivery Options:**

🇸🇬 **Singapore Delivery:**
• Same day: $15 (orders before 2pm)
• Next day: $8 (standard)
• Free delivery for orders above $200

🇲🇾 **Malaysia Shipping:**
• Standard: 3-5 days, from $25
• Express: 1-2 days, from $45  
• Bulk shipments: Special rates available

📦 **Weight Calculations:**
Our system automatically calculates shipping based on:
• Package dimensions and weight
• Delivery location (postal code)
• Service type selected

Need a shipping quote for your specific order?`;
    }
    
    if (text.includes('bulk') || text.includes('business') || text.includes('wholesale')) {
      return `💼 **M Supplies Business Solutions:**

🏢 **VIP Business Program:**
• Dedicated account manager
• Volume discounts (15-30% off)
• Priority processing & shipping
• Custom branding options
• Flexible payment terms

📊 **Bulk Pricing Tiers:**
• 100-499 pieces: 10% discount
• 500-999 pieces: 20% discount  
• 1000+ pieces: 25% discount
• 5000+ pieces: Custom pricing

🎨 **Custom Branding:**
• Logo printing on polymailers
• Custom colors and sizes
• Professional design consultation
• Sample approval process

Would you like to apply for our VIP program?`;
    }
    
    if (text.includes('rainbow palace') || text.includes('vibrant') || text.includes('colorful')) {
      return `🌈 **Rainbow Palace Collection:**

✨ **Premium Vibrant Series:**
Perfect for fashion brands, gift packaging, and creative businesses!

🎨 **12 Stunning Colors:**
• Sunset Orange • Electric Purple • Neon Pink
• Ocean Teal • Forest Green • Royal Blue
• Sunshine Yellow • Rose Gold • Mint Green  
• Coral Red • Lavender • Hot Magenta

📏 **All Standard Sizes Available:**
• Small, Medium, Large
• Custom sizes for bulk orders
• Matching tissue paper options

💎 **Premium Features:**
• Extra-thick material (120gsm)
• Tear-resistant design
• Water-resistant coating
• Professional finish

Perfect for your brand image! Need samples?`;
    }
    
    // Default response
    return `🤖 **M Supplies AI Assistant:**

I can help you with:
• 📦 Polymailer sizes, colors, and pricing
• 🚚 Delivery options (Singapore & Malaysia)
• 💼 Business & wholesale solutions
• 🌈 Rainbow Palace vibrant collection
• 📞 Custom packaging consultation

Try asking about:
• "Polymailer sizes and colors"
• "Delivery to Malaysia"
• "Bulk business pricing"
• "Rainbow Palace collection"

What would you like to know about our packaging solutions?`;
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleContactClick = () => {
    trackEvent('click_contact_from_demo', { 
      source: 'demo-ecommerce',
      demo: 'msupplies'
    });
  };

  const handleWhatsAppClick = () => {
    trackEvent('click_whatsapp_from_demo', { 
      source: 'demo-ecommerce',
      demo: 'msupplies'
    });
  };

  const quickReplies = [
    "What polymailer sizes do you have?",
    "Shipping to Malaysia pricing?",
    "Rainbow Palace collection colors?",
    "Bulk business pricing?"
  ];

  const demoFeatures = [
    {
      icon: Package,
      title: 'Product Intelligence',
      description: 'AI knows all polymailer sizes, colors, materials, and pricing for instant customer guidance',
      color: 'from-[#4facfe] to-[#00f2fe]'
    },
    {
      icon: ShoppingCart,
      title: 'E-commerce Support',
      description: 'Order assistance, delivery calculations, and business solution recommendations',
      color: 'from-[#f093fb] to-[#f5576c]'
    },
    {
      icon: Gift,
      title: 'Smart Promotions',
      description: 'AI understands bulk pricing, VIP programs, and promotional offers for customer benefits',
      color: 'from-[#a8edea] to-[#fed6e3]'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#4facfe] via-[#00f2fe] to-[#06B6D4]">
      {/* Header with CCC Branding */}
      <header className="bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center gap-4">
              <img 
                src="https://customer-assets.emergentagent.com/job_smartbiz-portal/artifacts/p67oqb1l_Screenshot%202025-10-11%20at%204.38.29%20PM.png" 
                alt="CCC Logo" 
                className="h-8 w-auto object-contain"
              />
              <div>
                <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'Plus Jakarta Sans' }}>
                  E-commerce Chatbot Demo
                </h1>
                <p className="text-sm text-white/80 font-medium">
                  CCC Digital - E-commerce AI Customer Support
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button asChild variant="outline" className="border-white/30 text-white hover:bg-white hover:text-[#4facfe]">
                <a href="/demos">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Demos
                </a>
              </Button>
              <Button asChild className="bg-white text-[#4facfe] hover:bg-white/90 font-medium" onClick={handleContactClick}>
                <a href="/contact?source=demo-ecommerce&utm_source=ccc&utm_medium=demo&utm_campaign=showcase">
                  Talk to Sales
                </a>
              </Button>
              <Button 
                asChild
                className="btn-ai-tertiary text-white font-medium"
                onClick={handleWhatsAppClick}
              >
                <a 
                  href="https://wa.me/6589821301?text=Hi%20CCC%2C%20I%27d%20like%20an%20e-commerce%20chatbot%20like%20M%20Supplies&utm_source=ccc&utm_medium=demo&utm_campaign=showcase"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  WhatsApp Us
                </a>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Demo Introduction */}
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Badge className="ai-badge mb-6 text-lg px-6 py-3">
            <ShoppingCart className="mr-2 h-5 w-5" /> E-commerce AI Demo
          </Badge>
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6 tracking-tight" style={{ fontFamily: 'Plus Jakarta Sans' }}>
            M Supplies <span className="bg-gradient-to-r from-[#a8edea] to-[#fed6e3] bg-clip-text text-transparent">AI Assistant</span>
          </h2>
          <div className="glass-card p-8 max-w-4xl mx-auto border border-white/20">
            <p className="text-xl text-white/90 leading-relaxed mb-4">
              Experience how an AI chatbot handles e-commerce customer support with product guidance, pricing, and order assistance.
            </p>
            <p className="text-lg text-white/80">
              Ask about polymailer sizes, colours, delivery timelines, bulk rates.
            </p>
          </div>
        </motion.div>

        {/* Demo Features */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {demoFeatures.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
            >
              <Card className="ai-card p-8 text-center h-full bg-white/20 backdrop-blur-md border border-white/30">
                <div 
                  className={`h-16 w-16 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center text-white mx-auto mb-4 ai-breathe`}
                >
                  <feature.icon size={32} />
                </div>
                <h3 className="text-xl font-bold text-white mb-4" style={{ fontFamily: 'Plus Jakarta Sans' }}>
                  {feature.title}
                </h3>
                <p className="text-white/80 leading-relaxed">{feature.description}</p>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Interactive Chatbot Demo */}
        <motion.div
          className="glass-card p-8 border border-white/20"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <div className="text-center mb-8">
            <h3 className="text-3xl font-bold text-white mb-4" style={{ fontFamily: 'Plus Jakarta Sans' }}>
              Live Demo - M Supplies AI Assistant
            </h3>
            <p className="text-white/80 text-lg">
              Try asking about product sizes, delivery options, bulk pricing, or custom solutions. 
              Experience intelligent e-commerce customer support.
            </p>
          </div>

          {!isOpen ? (
            <div className="text-center">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  onClick={() => setIsOpen(true)}
                  className="bg-white text-[#4facfe] hover:bg-white/90 font-bold text-xl px-12 py-6 rounded-2xl shadow-2xl"
                >
                  <MessageCircle className="mr-3 h-6 w-6" />
                  🚀 Launch M Supplies AI Chat
                </Button>
              </motion.div>
              
              <div className="mt-8 grid md:grid-cols-4 gap-4">
                {[
                  { label: 'Try asking:', example: 'What polymailer sizes do you have?' },
                  { label: 'Test products:', example: 'Rainbow Palace collection colors' },
                  { label: 'Check delivery:', example: 'Shipping to Malaysia pricing' },
                  { label: 'Business solutions:', example: 'Bulk pricing for 1000 pieces' }
                ].map((item, index) => (
                  <Card key={index} className="ai-card p-4 bg-white/20 backdrop-blur-md border border-white/30">
                    <div className="text-center">
                      <div className="font-bold text-white text-sm mb-2">{item.label}</div>
                      <div className="text-white/70 text-xs">{item.example}</div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto">
              {/* Chat Interface */}
              <div className="ai-card bg-white/95 backdrop-blur-md rounded-2xl overflow-hidden border border-white/30">
                {/* Chat Header */}
                <div className="bg-gradient-to-r from-[#4facfe] to-[#00f2fe] text-white p-4 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                      <ShoppingCart className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="font-bold" style={{ fontFamily: 'Plus Jakarta Sans' }}>M Supplies AI Assistant</div>
                      <div className="text-xs text-white/80">E-commerce Demo - Powered by CCC Digital</div>
                    </div>
                  </div>
                  <Button
                    onClick={() => setIsOpen(false)}
                    variant="ghost"
                    size="sm"
                    className="text-white/80 hover:text-white hover:bg-white/20"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                {/* Messages */}
                <div className="h-96 overflow-y-auto p-6 bg-gradient-to-br from-white to-gray-50">
                  {messages.map((msg) => (
                    <motion.div
                      key={msg.id}
                      className={`flex mb-4 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-sm ${
                        msg.sender === 'user'
                          ? 'bg-gradient-to-br from-[#4facfe] to-[#00f2fe] text-white'
                          : 'bg-white text-gray-800 border border-gray-200'
                      }`}>
                        <div className="whitespace-pre-line leading-relaxed text-sm">{msg.text}</div>
                        <div className={`text-xs mt-2 ${
                          msg.sender === 'user' ? 'text-white/70' : 'text-gray-500'
                        }`}>
                          {msg.time}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  
                  {isLoading && (
                    <div className="flex justify-start mb-4">
                      <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3 shadow-sm">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-[#4facfe] rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-[#00f2fe] rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                          <div className="w-2 h-2 bg-[#06B6D4] rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Quick Replies */}
                {messages.length <= 1 && !isLoading && (
                  <div className="p-4 bg-white/80 backdrop-blur-sm border-t border-white/20">
                    <div className="text-sm text-gray-600 mb-3 font-medium">Try these questions:</div>
                    <div className="grid grid-cols-2 gap-2">
                      {quickReplies.map((reply, index) => (
                        <Button
                          key={index}
                          onClick={() => setInputMessage(reply)}
                          variant="outline"
                          size="sm"
                          className="justify-start text-left h-auto py-2 px-3 border-gray-200 hover:border-[#4facfe] hover:text-[#4facfe] transition-all"
                        >
                          <span className="text-xs">{reply}</span>
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Input */}
                <div className="p-4 bg-white/90 backdrop-blur-sm border-t border-white/20">
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Ask about M Supplies products, pricing, delivery..."
                      className="flex-1 border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-[#4facfe] focus:ring-2 focus:ring-[#4facfe]/20 transition-all"
                      disabled={isLoading}
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={isLoading || !inputMessage.trim()}
                      className="bg-gradient-to-r from-[#4facfe] to-[#00f2fe] text-white px-6 py-3 hover:from-[#3b8bf0] hover:to-[#06B6D4] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>

        {/* Demo Information */}
        <div className="mt-16 grid md:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <Card className="ai-card p-8 bg-white/20 backdrop-blur-md border border-white/30 h-full">
              <h3 className="text-2xl font-bold text-white mb-6" style={{ fontFamily: 'Plus Jakarta Sans' }}>
                🎯 E-commerce AI Capabilities
              </h3>
              <ul className="space-y-3 text-white/90">
                <li>• <strong>Product Knowledge</strong> - Complete polymailer catalog with sizing and pricing</li>
                <li>• <strong>Business Intelligence</strong> - Bulk pricing, VIP programs, custom solutions</li>
                <li>• <strong>Delivery Expertise</strong> - Singapore & Malaysia shipping calculations</li>
                <li>• <strong>Brand Support</strong> - Rainbow Palace collection specialist</li>
                <li>• <strong>Order Assistance</strong> - Professional customer support</li>
              </ul>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <Card className="ai-card p-8 bg-white/20 backdrop-blur-md border border-white/30 h-full">
              <h3 className="text-2xl font-bold text-white mb-6" style={{ fontFamily: 'Plus Jakarta Sans' }}>
                💼 Perfect For E-commerce
              </h3>
              <ul className="space-y-3 text-white/90">
                <li>• <strong>Reduce Support Calls</strong> - 60-70% fewer product inquiries</li>
                <li>• <strong>24/7 Availability</strong> - Customers get answers anytime</li>
                <li>• <strong>Accurate Information</strong> - Always up-to-date pricing & inventory</li>
                <li>• <strong>Lead Generation</strong> - Capture business inquiries automatically</li>
                <li>• <strong>Sales Support</strong> - Upsell recommendations and bulk solutions</li>
              </ul>
            </Card>
          </motion.div>
        </div>

        {/* CTA Section */}
        <motion.div 
          className="mt-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
        >
          <div className="glass-card p-10 border border-white/30">
            <h3 className="text-3xl font-bold text-white mb-6" style={{ fontFamily: 'Plus Jakarta Sans' }}>
              Ready for Your E-commerce AI Assistant?
            </h3>
            <p className="text-xl text-white/90 mb-8 leading-relaxed">
              CCC Digital builds intelligent customer support for e-commerce businesses across Singapore.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  asChild
                  className="bg-white text-[#4facfe] hover:bg-white/90 font-bold text-lg px-10 py-4"
                  onClick={handleContactClick}
                >
                  <a href="/contact?source=demo-ecommerce&utm_source=ccc&utm_medium=demo&utm_campaign=showcase">
                    <MessageCircle className="mr-3 h-5 w-5" />
                    💬 Discuss Your E-commerce Project
                  </a>
                </Button>
              </motion.div>
              
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  asChild
                  className="border-2 border-white/40 text-white hover:bg-white hover:text-[#4facfe] backdrop-blur-sm text-lg px-10 py-4"
                >
                  <a 
                    href="https://www.msupplies.sg" 
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="mr-3 h-5 w-5" />
                    Visit Live M Supplies Site
                  </a>
                </Button>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default MSuppliesDemo;