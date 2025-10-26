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
      {/* Sticky Header Bar */}
      <header className="sticky top-0 z-50 bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-4">
              <img 
                src="https://customer-assets.emergentagent.com/job_smartbiz-portal/artifacts/p67oqb1l_Screenshot%202025-10-11%20at%204.38.29%20PM.png" 
                alt="CCC Logo" 
                className="h-8 w-auto object-contain"
              />
              <div>
                <h1 className="text-xl font-bold text-white" style={{ fontFamily: 'Plus Jakarta Sans' }}>
                  E-commerce Chatbot Demo
                </h1>
                <p className="text-sm text-white/80">
                  M Supplies Premium Packaging
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                asChild 
                variant="outline" 
                className="border-white/30 text-white hover:bg-white hover:text-[#4facfe]"
              >
                <a href="/demos">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Demos
                </a>
              </Button>
              <Button 
                asChild
                className="bg-white text-[#4facfe] hover:bg-white/90 font-medium"
                onClick={handleContactClick}
              >
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
                  href="https://wa.me/6589821301?text=Hi%20CCC%2C%20I%27d%20like%20a%20chatbot%20like%20this&utm_source=ccc&utm_medium=demo&utm_campaign=showcase"
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
            <ShoppingCart className="mr-2 h-5 w-5" /> E-commerce Platform
          </Badge>
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6 tracking-tight" style={{ fontFamily: 'Plus Jakarta Sans' }}>
            M Supplies <span className="bg-gradient-to-r from-[#a8edea] to-[#fed6e3] bg-clip-text text-transparent">Premium Platform</span>
          </h2>
          <div className="glass-card p-8 max-w-4xl mx-auto border border-white/20">
            <p className="text-xl text-white/90 leading-relaxed mb-4">
              Complete e-commerce solution with AI-powered customer support, intelligent promotion systems, and seamless user experience.
            </p>
            <p className="text-lg text-white/80">
              Ask about polymailer sizes, colours, delivery timelines, bulk rates.
            </p>
          </div>
        </motion.div>

        {/* Live Website Embed */}
        <motion.div
          className="glass-card p-8 border border-white/20 mb-12"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <div className="text-center mb-8">
            <h3 className="text-3xl font-bold text-white mb-4" style={{ fontFamily: 'Plus Jakarta Sans' }}>
              Live Website Demo
            </h3>
            <p className="text-white/80 text-lg">
              Explore the complete M Supplies platform with real products, pricing, and AI chat functionality.
            </p>
          </div>
          
          {/* Responsive Iframe Container */}
          <div className="relative" style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div className="aspect-video bg-white/10 rounded-2xl overflow-hidden border-2 border-white/20" style={{ minHeight: '700px' }}>
              <iframe 
                src="https://www.msupplies.sg?embedded=true"
                className="w-full h-full"
                title="M Supplies E-commerce Platform Demo"
                loading="lazy"
                style={{ border: 'none', borderRadius: '16px' }}
                allow="fullscreen"
              />
            </div>
          </div>
          
          <div className="text-center mt-8">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                asChild
                className="bg-white text-[#4facfe] hover:bg-white/90 font-bold text-lg px-8 py-3"
              >
                <a 
                  href="https://www.msupplies.sg" 
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="mr-2 h-5 w-5" />
                  Open Full Site
                </a>
              </Button>
              <Button 
                asChild
                className="border-white/30 text-white hover:bg-white hover:text-[#4facfe] text-lg px-8 py-3 backdrop-blur-sm"
              >
                <a 
                  href="https://www.msupplies.sg/contact" 
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle className="mr-2 h-5 w-5" />
                  Test Contact Form
                </a>
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Platform Features */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <Card className="ai-card p-8 bg-white/20 backdrop-blur-md border border-white/30 h-full">
              <h3 className="text-2xl font-bold text-white mb-6" style={{ fontFamily: 'Plus Jakarta Sans' }}>
                🛒 E-commerce Features
              </h3>
              <ul className="space-y-3 text-white/90">
                <li>• <strong>User Profiles</strong> - Address management & autofill</li>
                <li>• <strong>Smart Promotions</strong> - Dynamic coupon & gift tier system</li>
                <li>• <strong>Weight Calculations</strong> - Accurate shipping costs</li>
                <li>• <strong>Multi-Brand Support</strong> - Rainbow Palace, M Supplies, Mossom</li>
                <li>• <strong>Admin Dashboard</strong> - Order & inventory management</li>
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
                🤖 AI Capabilities
              </h3>
              <ul className="space-y-3 text-white/90">
                <li>• <strong>Product Guidance</strong> - Sizing, colors, bulk pricing</li>
                <li>• <strong>Order Assistance</strong> - Support & tracking help</li>
                <li>• <strong>Business Solutions</strong> - Custom packaging consultation</li>
                <li>• <strong>Context Awareness</strong> - Page-specific responses</li>
                <li>• <strong>Lead Capture</strong> - Automatic inquiry collection</li>
              </ul>
            </Card>
          </motion.div>
        </div>

        {/* Technical Stats */}
        <motion.div
          className="glass-card p-8 border border-white/30 mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
        >
          <h3 className="text-2xl font-bold text-white text-center mb-8" style={{ fontFamily: 'Plus Jakarta Sans' }}>
            Platform Capabilities
          </h3>
          
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                <MessageCircle className="w-8 h-8 text-white" />
              </div>
              <div className="text-2xl font-bold text-white mb-1">4</div>
              <div className="text-sm text-white/80">AI Agent Types</div>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                <Gift className="w-8 h-8 text-white" />
              </div>
              <div className="text-2xl font-bold text-white mb-1">Smart</div>
              <div className="text-sm text-white/80">Promotion Engine</div>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                <Mail className="w-8 h-8 text-white" />
              </div>
              <div className="text-2xl font-bold text-white mb-1">Real</div>
              <div className="text-sm text-white/80">Email Integration</div>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                <Users className="w-8 h-8 text-white" />
              </div>
              <div className="text-2xl font-bold text-white mb-1">100%</div>
              <div className="text-sm text-white/80">Feature Complete</div>
            </div>
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2 }}
        >
          <div className="glass-card p-10 border border-white/30">
            <h3 className="text-3xl font-bold text-white mb-6" style={{ fontFamily: 'Plus Jakarta Sans' }}>
              Ready for Your E-commerce Platform?
            </h3>
            <p className="text-xl text-white/90 mb-8 leading-relaxed">
              CCC Digital builds complete e-commerce solutions with AI-powered customer support for Singapore businesses.
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
                  onClick={handleWhatsAppClick}
                >
                  <a 
                    href="https://wa.me/6589821301?text=Hi%20CCC%2C%20I%27d%20like%20an%20e-commerce%20chatbot%20like%20M%20Supplies&utm_source=ccc&utm_medium=demo&utm_campaign=showcase"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <MessageCircle className="mr-3 h-5 w-5" />
                    WhatsApp About E-commerce AI
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