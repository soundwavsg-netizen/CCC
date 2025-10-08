import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { 
  Globe, ShoppingBag, Smartphone, Bot, Award, 
  CheckCircle2, ArrowRight, MessageSquare 
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
      id: 'website',
      icon: Globe,
      title: 'Website Development',
      color: '#10B981', // Green
      bgColor: '#D1FAE5',
      description: 'Professional, responsive websites built with Next.js and Firebase. Perfect for businesses, agencies, and consultants who need a modern online presence.',
      details: 'CCC creates custom websites tailored to your brand and business goals. We handle everything from design and development to content management, SEO optimization, and hosting. Each site is built to be fast, secure, and mobile-friendly.',
      features: [
        'Corporate & portfolio websites',
        'CMS-integrated sites with easy content updates',
        'AI chat integration for customer engagement',
        'Booking and appointment automation',
        'Advanced SEO and branding support',
        'Secure hosting and maintenance'
      ]
    },
    {
      id: 'ecommerce',
      icon: ShoppingBag,
      title: 'E-Commerce Solutions',
      color: '#F59E0B', // Yellow/Amber
      bgColor: '#FEF3C7',
      description: 'Tailor-made online stores with Stripe or Lemon Squeezy payment integration. Complete solutions for product catalogs, inventory, and multi-channel sales.',
      details: 'Build a powerful online store that scales with your business. CCC develops custom e-commerce platforms with secure checkout, real-time inventory tracking, and seamless integration with marketplaces like Shopee and Lazada.',
      features: [
        'Custom product catalogs with variants',
        'Inventory & order tracking systems',
        'Multi-channel sales integration',
        'Subscription and membership options',
        'Delivery calculation and tracking',
        'Customer portals and analytics dashboards'
      ]
    },
    {
      id: 'mobile-app',
      icon: Smartphone,
      title: 'Mobile & Web App Development',
      color: '#3B82F6', // Blue
      bgColor: '#DBEAFE',
      description: 'End-to-end full-stack applications using Flutter or Next.js. From startups to enterprise tools, we build apps that solve real business problems.',
      details: 'CCC delivers complete web and mobile applications with Firebase authentication, real-time data handling, and role-based access. Perfect for business management, customer portals, educational platforms, or custom enterprise tools.',
      features: [
        'Business management applications',
        'Customer and vendor portals',
        'Educational and booking platforms',
        'AI-powered mobile assistants',
        'Push notifications and real-time updates',
        'Role-based dashboards and analytics'
      ]
    },
    {
      id: 'ai-automation',
      icon: Bot,
      title: 'AI & Automation',
      color: '#F97316', // Orange
      bgColor: '#FFEDD5',
      description: 'Custom AI agents and workflow automation that boost productivity. From chatbots to intelligent process automation, we make AI work for your business.',
      details: 'CCC builds AI solutions that enhance customer engagement and streamline operations. Our custom AI agents handle customer queries, automate repetitive tasks, and provide data-driven insights to help you work smarter.',
      features: [
        'Custom GPT / AI assistants (like CCC AI Consultant)',
        'Knowledge-based chatbots for websites',
        'Process automation (CRM, Notion, Google Sheets)',
        'AI workflow automation for reports and scheduling',
        'Data-driven analytics dashboards',
        'Integration with existing business systems'
      ]
    },
    {
      id: 'consultancy',
      icon: Award,
      title: 'Consultancy & Grant Support',
      color: '#EF4444', // Red
      bgColor: '#FEE2E2',
      description: 'Expert guidance for EDG and SFEC grant applications. We help you secure government funding and manage the entire application process.',
      details: 'CCC provides end-to-end support for Enterprise Singapore grant applications. From eligibility assessment to claim submission, we guide you through every step to maximize your chances of approval.',
      features: [
        'EDG & SFEC eligibility assessment',
        'Proposal documentation and writing',
        'Project scope justification',
        'Budget preparation and validation',
        'Claim preparation and submission',
        'Post-project compliance support'
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
              <Badge className="mb-4 bg-[hsl(var(--accent))] text-[hsl(var(--primary))] hover:bg-[hsl(var(--accent))]">
                Services & Solutions
              </Badge>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-[hsl(var(--foreground))] mb-6">
                Complete Digital Solutions for Your Business
              </h1>
              <p className="text-lg text-[#475467] leading-relaxed mb-8">
                From websites to AI automation, CCC delivers tailored solutions that help Singapore SMEs grow and succeed in the digital age.
              </p>
              <Button 
                asChild
                className="bg-[hsl(var(--secondary))] hover:bg-[#0AA099] text-white shadow-[0_6px_18px_rgba(15,181,174,0.22)]"
                data-testid="hero-cta-button"
              >
                <Link to="/contact">Get a Free Consultation</Link>
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
                    <MessageSquare className="h-5 w-5" style={{ color: service.color }} />
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
                          <span className="text-sm text-[#1F2A37]">{feature}</span>
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

      {/* CTA Section */}
      <section className="py-16 sm:py-20 bg-[hsl(var(--primary))] text-white">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeUp>
            <div className="text-center">
              <h2 className="text-3xl sm:text-4xl font-semibold mb-4">
                Ready to Get Started?
              </h2>
              <p className="text-lg text-[#EAF7F5] mb-8 max-w-2xl mx-auto">
                Let's discuss your project and explore how CCC can help you achieve your digital transformation goals. Our team is ready to provide personalized recommendations and accurate project estimates.
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Button 
                  asChild
                  className="bg-[hsl(var(--secondary))] hover:bg-[#0AA099] text-white shadow-[0_6px_18px_rgba(15,181,174,0.22)]"
                  data-testid="cta-contact-button"
                >
                  <Link to="/contact">Schedule a Consultation</Link>
                </Button>
                <Button 
                  asChild
                  variant="outline"
                  className="border-white text-white hover:bg-white hover:text-[hsl(var(--primary))]"
                  data-testid="cta-grants-button"
                >
                  <Link to="/grants">Learn About Grants</Link>
                </Button>
              </div>
              <p className="text-sm text-[#EAF7F5] mt-6">
                💬 Or chat with our AI consultant now for instant answers and rough cost estimates!
              </p>
            </div>
          </FadeUp>
        </div>
      </section>
    </div>
  );
}
