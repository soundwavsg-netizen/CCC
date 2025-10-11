import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Code, Bot, ShoppingCart, GraduationCap, ArrowRight, Check } from 'lucide-react';

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

export default function Services() {
  const services = [
    {
      id: 'web-app',
      icon: Code,
      title: 'Website & App Development',
      tagline: 'Modern, responsive, and performance-first solutions',
      description: 'Transform your business with custom websites and applications built using cutting-edge technologies. We create responsive, fast, and user-friendly digital experiences that drive results.',
      features: [
        'Responsive React frontends with modern UI/UX design',
        'FastAPI backends with robust database integration',
        'Progressive Web Apps (PWA) for offline functionality',
        'RESTful API development and third-party integrations',
        'Performance optimization and SEO best practices',
        'Ongoing maintenance and support'
      ],
      technologies: ['React', 'FastAPI', 'MongoDB', 'PostgreSQL', 'Tailwind CSS', 'Node.js'],
      caseStudy: 'M-Supplies e-commerce platform'
    },
    {
      id: 'ai',
      icon: Bot,
      title: 'AI Automation & WhatsApp Integration',
      tagline: 'Intelligent systems for websites AND WhatsApp',
      description: 'Leverage AI to automate workflows and customer engagement across your website AND WhatsApp. From chatbots to business automation, our AI solutions work 24/7 to grow your business.',
      features: [
        'Website AI chatbots with smart lead qualification',
        'WhatsApp AI bot integration (live example: +65 8982 1301)',
        'Cross-platform customer engagement automation',
        'Workflow automation and business process optimization',
        'AI-powered customer service across all channels',
        'CRM integration and automated follow-ups'
      ],
      technologies: ['OpenAI GPT', 'WhatsApp Business API', 'Baileys Integration', 'Custom Automation'],
      caseStudy: 'CCC WhatsApp Bot (active on +65 8982 1301)'
    },
    {
      id: 'ecommerce',
      icon: ShoppingCart,
      title: 'E-Commerce Solutions',
      tagline: 'Sell online with confidence and efficiency',
      description: 'Build a powerful online presence with our comprehensive e-commerce solutions. From product catalogs to payment processing, we handle everything you need to succeed online.',
      features: [
        'Complete product catalog and inventory management',
        'Secure payment gateway integration (Stripe, PayPal)',
        'Shopping cart and checkout optimization',
        'Order management and fulfillment tracking',
        'Customer accounts and order history',
        'Analytics and reporting dashboards'
      ],
      technologies: ['Shopify', 'WooCommerce', 'Custom Solutions', 'Stripe', 'PayPal'],
      caseStudy: 'M-Supplies retail platform'
    },
    {
      id: 'training',
      icon: GraduationCap,
      title: 'Business Training & Grants',
      tagline: 'Empowering teams and accessing funding',
      description: 'Upskill your team and secure government funding for your digital transformation. We provide comprehensive training and guide you through the grant application process.',
      features: [
        'Team upskilling workshops and training programs',
        'EDG (Enterprise Development Grant) application support',
        'Documentation preparation and submission',
        'Post-approval implementation assistance',
        'Compliance and reporting support',
        'Grant eligibility assessment and consultation'
      ],
      technologies: ['Enterprise Singapore EDG', 'Grant Documentation', 'Custom Training'],
      caseStudy: 'Multiple successful grant applications'
    }
  ];

  return (
    <div className="flex flex-col" data-testid="services-page">
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
                  className="h-20 w-auto object-contain mx-auto"
                  style={{ 
                    background: 'transparent',
                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
                  }}
                />
              </div>
              <Badge className="mb-4 bg-[hsl(var(--accent))] text-[hsl(var(--primary))] hover:bg-[hsl(var(--accent))]" data-testid="services-badge">
                Our Services
              </Badge>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-[hsl(var(--foreground))] mb-6">
                Comprehensive Digital Solutions
              </h1>
              <p className="text-lg text-[#475467] leading-relaxed">
                From concept to deployment, we deliver end-to-end technology solutions that drive business growth and digital transformation.
              </p>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* Services Tabs */}
      <section className="py-16 sm:py-20 bg-white" data-testid="services-tabs">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <Tabs defaultValue="web-app" className="w-full">
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 h-auto gap-2 bg-transparent" data-testid="services-tab-list">
              {services.map((service) => (
                <TabsTrigger 
                  key={service.id}
                  value={service.id}
                  className="data-[state=active]:bg-[hsl(var(--accent))] data-[state=active]:text-[hsl(var(--primary))] px-4 py-3"
                  data-testid={`service-tab-${service.id}`}
                >
                  <service.icon className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">{service.title}</span>
                  <span className="sm:hidden">{service.title.split(' ')[0]}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            {services.map((service, index) => (
              <TabsContent key={service.id} value={service.id} className="mt-8">
                <FadeUp>
                  <div className="grid lg:grid-cols-2 gap-12">
                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="h-12 w-12 rounded-lg bg-[hsl(var(--accent))] flex items-center justify-center text-[hsl(var(--primary))]">
                          <service.icon size={24} />
                        </div>
                        <div>
                          <h2 className="text-3xl font-semibold text-[hsl(var(--foreground))]">
                            {service.title}
                          </h2>
                          <p className="text-sm text-[#475467]">{service.tagline}</p>
                        </div>
                      </div>
                      
                      <p className="text-base text-[#475467] mb-6 leading-relaxed">
                        {service.description}
                      </p>

                      <h3 className="font-semibold text-lg mb-4">Key Features:</h3>
                      <ul className="space-y-3 mb-8">
                        {service.features.map((feature, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <Check className="h-5 w-5 text-[hsl(var(--secondary))] shrink-0 mt-0.5" />
                            <span className="text-sm text-[#475467]">{feature}</span>
                          </li>
                        ))}
                      </ul>

                      <Button 
                        asChild
                        className="bg-[hsl(var(--secondary))] hover:bg-[#0AA099] text-white"
                        data-testid={`service-cta-${service.id}`}
                      >
                        <Link to="/contact">Get Started <ArrowRight className="ml-2 h-4 w-4" /></Link>
                      </Button>
                    </div>

                    <div className="space-y-6">
                      <Card className="p-6 rounded-xl shadow-[0_12px_40px_rgba(16,24,40,0.08)] border-0">
                        <h3 className="font-semibold text-lg mb-4">Technologies We Use</h3>
                        <div className="flex flex-wrap gap-2">
                          {service.technologies.map((tech) => (
                            <Badge 
                              key={tech} 
                              variant="outline"
                              className="border-[hsl(var(--border))]"
                              data-testid="service-technology-badge"
                            >
                              {tech}
                            </Badge>
                          ))}
                        </div>
                      </Card>

                      <Card className="p-6 rounded-xl shadow-[0_12px_40px_rgba(16,24,40,0.08)] border-0 bg-gradient-to-br from-[#EAF7F5] to-white">
                        <h3 className="font-semibold text-lg mb-2">Case Study</h3>
                        <p className="text-sm text-[#475467] mb-4">{service.caseStudy}</p>
                        <Button 
                          asChild
                          variant="ghost" 
                          className="p-0 h-auto hover:bg-transparent text-[hsl(var(--secondary))] hover:text-[#0AA099]"
                          data-testid={`service-portfolio-link-${service.id}`}
                        >
                          <Link to="/portfolio">View Portfolio <ArrowRight className="ml-1 h-4 w-4" /></Link>
                        </Button>
                      </Card>

                      <Card className="p-6 rounded-xl shadow-[0_12px_40px_rgba(16,24,40,0.08)] border-0">
                        <h3 className="font-semibold text-lg mb-4">Why Choose CCC?</h3>
                        <ul className="space-y-2 text-sm text-[#475467]">
                          <li>• Over 10 years of industry experience</li>
                          <li>• Proven track record with Singapore SMEs</li>
                          <li>• Comprehensive post-launch support</li>
                          <li>• Competitive pricing with grant assistance</li>
                        </ul>
                      </Card>
                    </div>
                  </div>
                </FadeUp>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-20 bg-[hsl(var(--primary))] text-white">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeUp>
            <div className="text-center">
              <h2 className="text-3xl sm:text-4xl font-semibold mb-4">
                Ready to Get Started?
              </h2>
              <p className="text-lg text-[#EAF7F5] mb-8 max-w-2xl mx-auto">
                Let's discuss your project and how we can help you achieve your digital transformation goals.
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Button 
                  asChild
                  className="bg-[hsl(var(--secondary))] hover:bg-[#0AA099] text-white shadow-[0_6px_18px_rgba(15,181,174,0.22)]"
                  data-testid="services-contact-cta"
                >
                  <Link to="/contact">Schedule a Consultation</Link>
                </Button>
                <Button 
                  asChild
                  variant="outline"
                  className="border-white text-white hover:bg-white hover:text-[hsl(var(--primary))]"
                  data-testid="services-grants-cta"
                >
                  <Link to="/grants">Learn About Grants</Link>
                </Button>
              </div>
            </div>
          </FadeUp>
        </div>
      </section>
    </div>
  );
}
