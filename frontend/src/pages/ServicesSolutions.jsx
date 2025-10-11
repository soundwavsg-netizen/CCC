import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { 
  Globe, 
  ShoppingCart, 
  MessageCircle, 
  Bot, 
  BarChart3, 
  Settings,
  CheckCircle2,
  ArrowRight,
  Award,
  Zap,
  Users,
  Smartphone,
  Clock,
  Target,
  Rocket
} from 'lucide-react';

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

export default function ServicesSolutions() {
  const services = [
    {
      id: 'website-ecommerce',
      icon: Globe,
      title: 'Website & E-Commerce Development',
      color: '#10B981', // Green
      bgColor: '#D1FAE5',
      description: 'Fast, mobile-ready, and scalable websites built for growth. Includes integrated payment, inventory tracking, and SEO-optimised design.',
      details: 'We build fast, mobile-ready, and scalable websites designed for growth. Whether you\'re creating a corporate site or a full online store, our builds integrate seamlessly with secure payment gateways, inventory systems, and analytics.',
      features: [
        'Responsive design for all devices',
        'E-commerce setup with secure checkout',
        'SEO optimisation & analytics integration',
        'Content management systems (CMS)',
        'Payment gateway integration (Stripe, PayNow)',
        'Inventory management and order tracking'
      ]
    },
    {
      id: 'ai-chatbots',
      icon: Bot,
      title: 'AI Chatbots & Workflow Automation',
      color: '#F59E0B', // Amber
      bgColor: '#FEF3C7',
      description: 'Automate repetitive processes, qualify leads instantly, and save time. AI chatbots for websites AND WhatsApp automation — your most powerful customer engagement channels.',
      details: 'Your business deserves to work smarter, not harder. Our AI solutions include website chatbots AND WhatsApp automation (like this business number +65 8982 1301) to qualify leads, respond to customer questions, and streamline operations 24/7.',
      features: [
        'Website AI chatbots with smart lead qualification',
        'WhatsApp AI bot integration (+65 8982 1301 business number example)',
        'Automated customer service across both platforms', 
        'Integration with CRM, email, and business workflows',
        'AI logic trained to your specific business tone and industry',
        'Complete automation: website visitors AND WhatsApp customers'
      ]
    },
    {
      id: 'whatsapp-bot',
      icon: MessageCircle,
      title: 'WhatsApp AI Bot Integration',
      color: '#25D366', // WhatsApp Green
      bgColor: '#DCFCE7',
      description: 'Engage customers directly on WhatsApp — your most powerful communication channel. Simple setup or Official Business API integration available.',
      details: 'Turn your WhatsApp into a 24/7 digital assistant that handles sales and enquiries instantly. We offer flexible integration options to match your scale and needs.',
      features: [
        'Simple Setup (Short-Term Connection) – quick deployment for small-scale usage',
        'Official WhatsApp Business API (Recommended) – verified Meta connection for multi-user operations',
        'Handles customer enquiries automatically',
        'Connects to your AI chatbot logic',
        'Sends instant replies, forms, and lead data to your CRM or email',
        'Custom business automation workflows'
      ]
    },
    {
      id: 'crm-analytics',
      icon: BarChart3,
      title: 'CRM & Analytics Integration',
      color: '#3B82F6', // Blue
      bgColor: '#DBEAFE',
      description: 'Connect your website or chatbot to HubSpot, Google Sheets, or custom dashboards. Track leads, automate follow-ups, and visualise insights.',
      details: 'Connect your website or chatbot to your customer relationship tools for end-to-end visibility. From HubSpot to Google Sheets, we help you automate follow-ups and track your performance with clarity.',
      features: [
        'Lead tracking and customer database setup',
        'Workflow automation (email, WhatsApp, notifications)',
        'Sales funnel and dashboard integration',
        'Analytics setup for campaign monitoring',
        'HubSpot, Google Sheets, and CRM connections',
        'Custom reporting and data visualization'
      ]
    },
    {
      id: 'custom-systems',
      icon: Settings,
      title: 'Custom Web Systems / Portals',
      color: '#8B5CF6', // Purple
      bgColor: '#EDE9FE',
      description: 'Tailored admin or client portals for booking, order management, analytics, or project tracking. Built to your specific needs.',
      details: 'We create tailored online portals that manage data, bookings, or client services — all built to your specific needs.',
      features: [
        'Order or project management systems',
        'Membership or client portals',
        'Internal admin dashboards',
        'Document or submission management tools',
        'Custom workflow automation',
        'Multi-user access and role management'
      ]
    }
  ];

  return (
    <div className="flex flex-col" data-testid="services-solutions-page">
      {/* Hero Section */}
      <section className="py-16 sm:py-20 lg:py-28 bg-gradient-to-br from-[#EAF7F5] via-white to-[#EAF7F5]">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeUp>
            <div className="max-w-3xl mx-auto text-center">
              {/* CCC Logo */}
              <div className="mb-8">
                <img 
                  src="https://customer-assets.emergentagent.com/job_smartbiz-portal/artifacts/p67oqb1l_Screenshot%202025-10-11%20at%204.38.29%20PM.png" 
                  alt="Cognition & Competence Consultancy" 
                  className="h-16 w-auto object-contain mx-auto"
                  style={{ 
                    background: 'transparent',
                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
                  }}
                />
              </div>
              <Badge className="mb-4 bg-[hsl(var(--secondary))] text-white hover:bg-[hsl(var(--secondary))]">
                <Rocket className="mr-1 h-3 w-3" /> Complete Digital Solutions
              </Badge>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-[hsl(var(--foreground))] mb-6">
                Smart Digital Systems for Modern Businesses
              </h1>
              <p className="text-lg text-[#475467] leading-relaxed mb-8">
                From websites and e-commerce platforms to AI chatbots and WhatsApp automation, CCC delivers complete digital solutions that help Singapore SMEs grow and succeed.
              </p>
              <Button 
                asChild
                className="bg-[hsl(var(--secondary))] hover:bg-[#0AA099] text-white shadow-[0_6px_18px_rgba(15,181,174,0.22)]"
                data-testid="hero-cta-button"
              >
                <Link to="/#lead-form">Start Your Project</Link>
              </Button>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* Services Sections */}
      {services.map((service, index) => (
        <section 
          key={service.id}
          className={`py-16 sm:py-20 ${index % 2 === 0 ? 'bg-white' : 'bg-gradient-to-br from-[#F9FAFB] to-white'}`}
          data-testid={`service-section-${service.id}`}
        >
          <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
            <FadeUp>
              <div className="grid lg:grid-cols-2 gap-12 items-start">
                {/* Content */}
                <div className={index % 2 === 0 ? 'order-1' : 'order-2'}>
                  <div className="flex items-center gap-3 mb-4">
                    <div 
                      className="h-12 w-12 rounded-lg flex items-center justify-center text-white"
                      style={{ backgroundColor: service.color }}
                    >
                      <service.icon size={24} />
                    </div>
                    <div>
                      <h2 className="text-3xl font-semibold text-[hsl(var(--foreground))]">
                        {service.title}
                      </h2>
                      <div 
                        className="h-1 w-20 rounded-full mt-2"
                        style={{ backgroundColor: service.color }}
                      />
                    </div>
                  </div>
                  
                  <p className="text-base text-[#475467] mb-4 leading-relaxed">
                    {service.description}
                  </p>
                  
                  <p className="text-sm text-[#6B7280] mb-6 leading-relaxed">
                    {service.details}
                  </p>

                  <div className="flex items-center gap-2 mb-6">
                    <MessageCircle className="h-5 w-5" style={{ color: service.color }} />
                    <p className="text-sm font-medium" style={{ color: service.color }}>
                      Have questions? Chat with our AI consultant for personalized advice!
                    </p>
                  </div>
                </div>

                {/* Features */}
                <div className={index % 2 === 0 ? 'order-2' : 'order-1'}>
                  <Card 
                    className="p-6 rounded-xl shadow-[0_12px_40px_rgba(16,24,40,0.08)] border-0"
                    style={{ backgroundColor: service.bgColor }}
                  >
                    <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5" style={{ color: service.color }} />
                      Key Features
                    </h3>
                    <ul className="space-y-3">
                      {service.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle2 
                            className="h-5 w-5 shrink-0 mt-0.5" 
                            style={{ color: service.color }}
                          />
                          <span className="text-sm text-[#374151]">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </Card>
                </div>
              </div>
            </FadeUp>
          </div>
        </section>
      ))}

      {/* EDG Support Section - Updated for Compliance */}
      <section className="py-16 sm:py-20 bg-gradient-to-br from-[#EAF7F5] to-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeUp>
            <div className="text-center mb-12">
              <Badge className="mb-4 bg-[#12B76A] text-white">
                <Award className="mr-1 h-3 w-3" /> Strategic Guidance
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-semibold text-[hsl(var(--foreground))] mb-4">
                EDG Alignment for Transformation Projects
              </h2>
              <p className="text-base text-[#475467] max-w-2xl mx-auto">
                CCC assists eligible Singapore SMEs in aligning digital transformation projects with EDG requirements, where applicable.
              </p>
            </div>
          </FadeUp>

          <FadeUp delay={0.1}>
            <Card className="p-8 rounded-xl shadow-[0_12px_40px_rgba(16,24,40,0.08)] border-0">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-semibold mb-4 text-[#12B76A]">
                    ✅ Projects That May Align with EDG:
                  </h3>
                  <ul className="space-y-3 text-sm text-[#475467]">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-[#12B76A] shrink-0 mt-0.5" />
                      <span>AI automation and workflow redesign projects</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-[#12B76A] shrink-0 mt-0.5" />
                      <span>Custom web systems that transform business processes</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-[#12B76A] shrink-0 mt-0.5" />
                      <span>WhatsApp automation for customer service transformation</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-[#12B76A] shrink-0 mt-0.5" />
                      <span>CRM integration with measurable process improvement</span>
                    </li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold mb-4 text-[#DC2626]">
                    ❌ Projects That Typically Don't Qualify:
                  </h3>
                  <ul className="space-y-3 text-sm text-[#475467]">
                    <li className="flex items-start gap-2">
                      <span className="h-4 w-4 text-red-500 font-bold text-center flex items-center justify-center mt-0.5">×</span>
                      <span>Standard website development without transformation elements</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="h-4 w-4 text-red-500 font-bold text-center flex items-center justify-center mt-0.5">×</span>
                      <span>Basic e-commerce platforms without process innovation</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="h-4 w-4 text-red-500 font-bold text-center flex items-center justify-center mt-0.5">×</span>
                      <span>Marketing-focused websites or brochure sites</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="h-4 w-4 text-red-500 font-bold text-center flex items-center justify-center mt-0.5">×</span>
                      <span>Projects without clear business transformation outcomes</span>
                    </li>
                  </ul>
                </div>
              </div>
              
              <div className="mt-8 pt-8 border-t text-center">
                <p className="text-sm text-[#475467] mb-4">
                  CCC assists in structuring proposals and documentation to align with EDG requirements. Final funding decisions rest solely with Enterprise Singapore.
                </p>
                <Button 
                  asChild
                  className="bg-[#12B76A] hover:bg-[#10A561] text-white"
                  data-testid="edg-eligibility-cta"
                >
                  <Link to="/edg">Check EDG Alignment Advisory</Link>
                </Button>
                <p className="text-xs text-[#6B7280] mt-3">
                  ⚠️ EDG approval is not guaranteed. All funding decisions are made by Enterprise Singapore.
                </p>
              </div>
            </Card>
          </FadeUp>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <FadeUp>
            <h2 className="text-3xl sm:text-4xl font-semibold text-[hsl(var(--foreground))] mb-4">
              Ready to Build Something Intelligent?
            </h2>
            <p className="text-base text-[#475467] mb-8">
              Let's discuss how smart digital systems can help your business grow, engage customers, and streamline operations.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                asChild
                className="bg-[hsl(var(--secondary))] hover:bg-[#0AA099] text-white shadow-[0_6px_18px_rgba(15,181,174,0.22)]"
                data-testid="cta-primary-button"
              >
                <Link to="/#lead-form">
                  <Rocket className="mr-2 h-4 w-4" />
                  Start My Project
                </Link>
              </Button>
              <Button 
                asChild
                variant="outline"
                className="border-[hsl(var(--border))]"
                data-testid="cta-secondary-button"
              >
                <Link to="/contact">
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Get in Touch <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </FadeUp>
        </div>
      </section>
    </div>
  );
}