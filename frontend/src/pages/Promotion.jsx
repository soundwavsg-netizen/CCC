import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { 
  Gift,
  MessageCircle, 
  CheckCircle2, 
  Bot, 
  Zap,
  Star,
  Calendar,
  Clock,
  Rocket,
  Sparkles,
  Phone,
  ArrowRight
} from 'lucide-react';
import { 
  trackHeroView, 
  trackChatOpen, 
  trackBookConsultClick 
} from '../utils/analytics';

const FadeUp = ({ delay = 0, children }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.2 }}
    transition={{ duration: 0.45, delay }}
  >
    {children}
  </motion.div>
);

const FloatingBubble = ({ delay = 0, size = 'small' }) => (
  <motion.div
    initial={{ opacity: 0, y: 20, scale: 0 }}
    animate={{ 
      opacity: [0, 1, 1, 0],
      y: [20, -100],
      scale: [0, 1, 1, 0]
    }}
    transition={{ 
      duration: 4,
      repeat: Infinity,
      delay: delay,
      ease: "easeInOut"
    }}
    className={`absolute ${size === 'large' ? 'w-8 h-8' : 'w-6 h-6'} bg-white/30 rounded-full`}
    style={{
      left: `${Math.random() * 80 + 10}%`,
      bottom: '10%'
    }}
  />
);

export default function Promotion() {
  const [selectedPackage, setSelectedPackage] = useState(null);

  useEffect(() => {
    trackHeroView('promotion-page');
    
    // Set promotional SEO
    document.title = "AI Chatbot & WhatsApp Automation Singapore | CCC Digital Year-End Offer 2025";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.content = "Automate your website and WhatsApp with CCC Digital's AI Chatbot solutions — Singapore's trusted automation partner. Save up to $2,000 setup until 31 Dec 2025.";
    }
  }, []);

  const handleChatOpen = (source = 'promo') => {
    trackChatOpen(source);
    const chatButton = document.querySelector('[data-testid="chat-widget-button"]');
    if (chatButton) {
      chatButton.click();
    }
  };

  const handleWhatsAppClick = () => {
    trackBookConsultClick('whatsapp-promo');
    window.open('https://wa.me/6589821301?text=Hi%20CCC%20Digital!%20I%20saw%20your%20Year-End%20AI%20Automation%20Promotion.%20I%20want%20to%20learn%20more%20about%20the%20packages.', '_blank');
  };

  const packages = [
    {
      id: 'startup',
      title: 'Start-Up AI Bundle',
      description: 'Website Chatbot + WhatsApp Bot (Simple Setup)',
      subtitle: 'Perfect for tuition centres, clinics & small biz.',
      regularPrice: '$4,800',
      promoPrice: '$4,280',
      monthly: '$580/mo',
      savings: '$520',
      features: [
        'Website AI chatbot integration',
        'WhatsApp Simple Setup bot',
        'Basic lead qualification',
        'Email & SMS notifications',
        '3 months free support',
        'Mobile-responsive design'
      ],
      badge: 'POPULAR',
      color: '#10B981',
      bgGradient: 'from-green-50 to-emerald-50'
    },
    {
      id: 'professional',
      title: 'Professional Automation Bundle',
      description: 'AI Chatbot trained on your PDFs + WhatsApp Business Bot',
      subtitle: 'Perfect for professional services & SMEs.',
      regularPrice: '$11,500',
      promoPrice: '$9,800',
      monthly: '$1,250/mo',
      savings: '$1,700',
      features: [
        'AI trained on your documents',
        'WhatsApp Business API integration',
        'Advanced lead qualification',
        'CRM integration (HubSpot/Salesforce)',
        'Custom response flows',
        '6 months premium support'
      ],
      badge: 'BEST VALUE',
      color: '#3B82F6',
      bgGradient: 'from-blue-50 to-indigo-50'
    },
    {
      id: 'enterprise',
      title: 'Enterprise Concierge',
      description: 'Full AI Concierge with login, CRM sync & 24/7 support',
      subtitle: 'Perfect for enterprises or multi-branch setups.',
      regularPrice: '$18,500',
      promoPrice: '$15,800',
      monthly: '$1,950/mo',
      savings: '$2,700',
      features: [
        'Multi-user AI concierge system',
        'Advanced CRM & analytics integration',
        'Priority 24/7 technical support',
        'Custom AI training & retraining',
        'Multi-channel automation',
        '12 months enterprise support'
      ],
      badge: 'PREMIUM',
      color: '#8B5CF6',
      bgGradient: 'from-purple-50 to-violet-50'
    }
  ];

  return (
    <div className="flex flex-col overflow-hidden" data-testid="promotion-page">
      {/* Hero Section with Animations */}
      <section className="relative min-h-screen bg-gradient-to-br from-[#293889] via-[#E91F2C] to-[#293889] overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 opacity-20">
          {[...Array(12)].map((_, i) => (
            <FloatingBubble 
              key={i} 
              delay={i * 0.5} 
              size={i % 3 === 0 ? 'large' : 'small'} 
            />
          ))}
        </div>
        
        {/* CCC Logo Watermark */}
        <div className="absolute inset-0 flex items-center justify-center opacity-5">
          <img 
            src="https://customer-assets.emergentagent.com/job_smartbiz-portal/artifacts/p67oqb1l_Screenshot%202025-10-11%20at%204.38.29%20PM.png" 
            alt="CCC Watermark" 
            className="h-96 w-auto object-contain"
            style={{ filter: 'brightness(0) invert(1)' }}
          />
        </div>

        <div className="relative z-10 max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <FadeUp>
            <div className="text-center">
              <Badge className="mb-6 bg-white text-[#293889] hover:bg-white text-lg px-6 py-2">
                <Gift className="mr-2 h-5 w-5" /> 
                🎁 Year-End AI Automation Promotion — Bring Intelligence to Your Business
              </Badge>
              
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white mb-8">
                🎉 Transform Your Website into a 24/7 Smart Assistant
              </h1>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 mb-8 max-w-4xl mx-auto">
                <h2 className="text-2xl sm:text-3xl font-semibold text-white mb-4">
                  Year-End AI Chatbot Promotion!
                </h2>
                <p className="text-xl text-white/90 leading-relaxed mb-6">
                  CCC Digital is bringing intelligent automation to Singapore businesses with our special 2025 Year-End Offer — integrate your website and WhatsApp with AI today and save up to $2,000 in setup costs.
                </p>
                <div className="flex items-center justify-center gap-2 text-white/80">
                  <Calendar className="h-5 w-5" />
                  <span className="font-medium">Offer valid until 31 December 2025</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  onClick={() => document.getElementById('packages')?.scrollIntoView({ behavior: 'smooth' })}
                  size="lg"
                  className="bg-[#293889] hover:bg-[#1e2c6b] text-white text-lg px-8 py-4"
                  data-testid="view-packages-cta"
                >
                  🔵 View Packages & Pricing
                </Button>
                
                <Button 
                  onClick={() => handleChatOpen('promo-hero')}
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-white hover:text-[#293889] text-lg px-8 py-4"
                  data-testid="chat-consultant-cta"
                >
                  🔴 Talk to Our AI Consultant
                </Button>
                
                <Button 
                  onClick={handleWhatsAppClick}
                  size="lg"
                  className="bg-[#25D366] hover:bg-[#1ea952] text-white text-lg px-8 py-4"
                  data-testid="whatsapp-claim-cta"
                >
                  🟢 WhatsApp Us to Claim Offer
                </Button>
              </div>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* Package Pricing Section */}
      <section id="packages" className="py-16 sm:py-20 bg-white">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeUp>
            <div className="text-center mb-16">
              <h2 className="text-4xl sm:text-5xl font-bold text-[hsl(var(--foreground))] mb-4">
                Choose Your AI Automation Package
              </h2>
              <p className="text-xl text-[#475467] max-w-3xl mx-auto">
                Save up to $2,700 with our Year-End promotion. All packages include hosting, monitoring, and AI management by CCC Digital.
              </p>
            </div>
          </FadeUp>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            {packages.map((pkg, index) => (
              <FadeUp key={pkg.id} delay={index * 0.1}>
                <Card className={`relative p-8 rounded-2xl hover:shadow-[0_20px_50px_rgba(16,24,40,0.15)] transition-all duration-300 border-2 hover:border-[${pkg.color}] bg-gradient-to-br ${pkg.bgGradient} h-full`}>
                  {/* Limited Offer Ribbon */}
                  <div className="absolute -top-3 -right-3 bg-[#E91F2C] text-white text-xs font-bold px-3 py-1 rounded-full rotate-12 shadow-lg">
                    🎁 LIMITED OFFER
                  </div>
                  
                  {/* Package Badge */}
                  <div className="text-center mb-6">
                    <Badge 
                      className="text-sm px-4 py-1 font-semibold mb-4"
                      style={{ backgroundColor: pkg.color, color: 'white' }}
                    >
                      {pkg.badge}
                    </Badge>
                    <h3 className="text-2xl font-bold text-[hsl(var(--foreground))] mb-2">{pkg.title}</h3>
                    <p className="text-base font-medium text-[#475467] mb-2">{pkg.description}</p>
                    <p className="text-sm text-[#6B7280]">{pkg.subtitle}</p>
                  </div>

                  {/* Pricing */}
                  <div className="text-center mb-6">
                    <div className="flex items-center justify-center gap-3 mb-2">
                      <span className="text-lg text-[#6B7280] line-through">{pkg.regularPrice}</span>
                      <span className="text-3xl font-bold" style={{ color: pkg.color }}>{pkg.promoPrice}</span>
                    </div>
                    <div className="text-lg font-semibold text-[#475467] mb-1">{pkg.monthly}</div>
                    <div className="text-sm font-medium text-[#25D366]">Save {pkg.savings}</div>
                  </div>

                  {/* Features */}
                  <div className="mb-8">
                    <h4 className="font-semibold text-[hsl(var(--foreground))] mb-4">What's Included:</h4>
                    <ul className="space-y-3">
                      {pkg.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" style={{ color: pkg.color }} />
                          <span className="text-sm text-[#475467]">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* CTA */}
                  <div className="mt-auto">
                    <Button 
                      onClick={() => handleWhatsAppClick()}
                      className="w-full text-white font-semibold"
                      style={{ backgroundColor: pkg.color }}
                      data-testid={`select-package-${pkg.id}`}
                    >
                      <MessageCircle className="mr-2 h-4 w-4" />
                      Choose {pkg.title}
                    </Button>
                  </div>
                </Card>
              </FadeUp>
            ))}
          </div>

          {/* Promotional Note */}
          <FadeUp delay={0.3}>
            <Card className="p-8 rounded-xl shadow-[0_12px_40px_rgba(16,24,40,0.08)] border-2 border-[#25D366] bg-gradient-to-br from-green-50 to-emerald-50">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Sparkles className="h-6 w-6 text-[#25D366]" />
                  <h3 className="text-xl font-bold text-[#25D366]">Special Year-End Benefits</h3>
                  <Sparkles className="h-6 w-6 text-[#25D366]" />
                </div>
                <div className="grid md:grid-cols-2 gap-6 text-[#475467]">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-[#25D366]" />
                    <span>💡 All plans include hosting, monitoring, and AI management by CCC Digital</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-[#25D366]" />
                    <span>🕒 Offer valid until 31 December 2025</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-[#25D366]" />
                    <span>🎯 Early sign-ups get free AI retraining within 3 months!</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-[#25D366]" />
                    <span>⚡ Setup completed within 2-3 weeks</span>
                  </div>
                </div>
              </div>
            </Card>
          </FadeUp>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-20 bg-gradient-to-br from-[#EAF7F5] to-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <FadeUp>
            <div className="mb-8">
              <h2 className="text-3xl sm:text-4xl font-bold text-[hsl(var(--foreground))] mb-4">
                Ready to Automate Your Business?
              </h2>
              <p className="text-lg text-[#475467] mb-8">
                Don't miss this limited-time offer! Transform your customer engagement with AI automation and save thousands on setup costs.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  onClick={handleWhatsAppClick}
                  className="bg-[#25D366] hover:bg-[#1ea952] text-white text-lg px-8 py-4 shadow-[0_6px_18px_rgba(37,211,102,0.22)]"
                  data-testid="final-whatsapp-cta"
                >
                  <Phone className="mr-2 h-5 w-5" />
                  WhatsApp +65 8982 1301
                </Button>
                <Button 
                  onClick={() => handleChatOpen('final-cta')}
                  className="bg-[#293889] hover:bg-[#1e2c6b] text-white text-lg px-8 py-4 shadow-[0_6px_18px_rgba(41,56,137,0.22)]"
                  data-testid="final-chat-cta"
                >
                  <MessageCircle className="mr-2 h-5 w-5" />
                  Chat with AI Consultant
                </Button>
              </div>
            </div>
          </FadeUp>
        </div>
      </section>
    </div>
  );
}