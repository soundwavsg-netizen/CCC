import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { 
  ExternalLink, 
  Play, 
  Code, 
  Database, 
  Mail, 
  MessageCircle, 
  Users, 
  ShoppingCart, 
  Gift, 
  Package,
  ArrowLeft,
  Target,
  Zap
} from 'lucide-react';
import { trackEvent } from '../../utils/analytics';

const MSuppliesDemo = () => {
  const [activeFeature, setActiveFeature] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Analytics tracking
    trackEvent('view_demo_page', { vertical: 'ecommerce', page: 'msupplies' });
    
    // Set SEO
    document.title = "E-commerce Chatbot Demo | CCC Digital";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.content = "Product Q&A, delivery support, order guidance, lead capture.";
    }
    
    // Simulate loading
    setTimeout(() => setIsLoading(false), 1000);
  }, []);

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

  const features = {
    overview: {
      title: "Project Overview",
      icon: <Package className="w-6 h-6" />,
      content: (
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-teal-50 to-blue-50 p-6 rounded-xl border border-teal-200">
            <h3 className="text-2xl font-bold text-slate-900 mb-4">M Supplies (INT) Pte Ltd</h3>
            <p className="text-gray-700 text-lg leading-relaxed mb-4">
              Complete e-commerce platform for premium polymailers and custom packaging solutions serving Singapore and Malaysia markets.
            </p>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-lg">
                <h4 className="font-semibold text-teal-700">🌈 Rainbow Palace</h4>
                <p className="text-sm text-gray-600">Vibrant polymailers for brand impact</p>
              </div>
              <div className="bg-white p-4 rounded-lg">
                <h4 className="font-semibold text-teal-700">📦 M Supplies</h4>
                <p className="text-sm text-gray-600">Thick polymailers & branding solutions</p>
              </div>
              <div className="bg-white p-4 rounded-lg">
                <h4 className="font-semibold text-teal-700">🌿 Mossom SG Studio</h4>
                <p className="text-sm text-gray-600">Bespoke floral arrangements & styling</p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    ai: {
      title: "AI Chat Assistant",
      icon: <MessageCircle className="w-6 h-6" />,
      content: (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-xl font-bold text-slate-900 mb-4">Intelligent Customer Support</h3>
            <p className="text-gray-700 mb-6">
              Context-aware AI assistant that provides specialized help based on page location and customer needs.
            </p>
            
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div className="bg-teal-50 p-4 rounded-lg">
                <h4 className="font-semibold text-teal-700 mb-2">💼 Homepage: Sales Expert</h4>
                <p className="text-sm text-gray-600">Focuses on bulk pricing, VIP programs, and business solutions</p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-700 mb-2">📏 Products: Sizing Specialist</h4>
                <p className="text-sm text-gray-600">Helps with dimensions, pack quantities, and sizing advice</p>
              </div>
            </div>
          </div>
        </div>
      )
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#4facfe] to-[#00f2fe] flex items-center justify-center">
        <motion.div 
          className="text-center text-white"
          animate={{ 
            scale: [1, 1.05, 1],
            opacity: [0.8, 1, 0.8]
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
            <ShoppingCart className="w-10 h-10" />
          </div>
          <p className="text-xl font-medium">Loading M Supplies Demo...</p>
        </motion.div>
      </div>
    );
  }

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