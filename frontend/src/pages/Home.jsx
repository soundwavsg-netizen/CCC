import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { ArrowRight, Code, Bot, ShoppingCart, GraduationCap, Award, CheckCircle2 } from 'lucide-react';

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

export default function Home() {
  const services = [
    {
      icon: Code,
      title: 'Website & App Development',
      description: 'Responsive React frontends, FastAPI backends, and performance-first solutions tailored for your business.',
      link: '/services'
    },
    {
      icon: Bot,
      title: 'AI Automation',
      description: 'Workflow automation, chatbots & RAG systems, and operational augmentation to boost efficiency.',
      link: '/services'
    },
    {
      icon: ShoppingCart,
      title: 'E-Commerce Solutions',
      description: 'Complete product catalogs, payment integrations, and analytics to drive your online sales.',
      link: '/services'
    },
    {
      icon: GraduationCap,
      title: 'Business Training & Grants',
      description: 'Team upskilling, EDG/SFEC guidance, and documentation support for grant applications.',
      link: '/grants'
    }
  ];

  const projects = [
    {
      name: 'M-Supplies',
      description: 'E-commerce platform with inventory management',
      image: 'https://images.unsplash.com/photo-1537155986727-3c402583a35a?auto=format&fit=crop&q=85&w=800'
    },
    {
      name: 'VocaFlow',
      description: 'AI-powered workflow automation system',
      image: 'https://images.unsplash.com/photo-1551395722-0ac9e89cee11?auto=format&fit=crop&q=85&w=800'
    },
    {
      name: 'AISY Math',
      description: 'Educational AI assistant for mathematics',
      image: 'https://images.pexels.com/photos/14321795/pexels-photo-14321795.jpeg?auto=compress&w=800'
    }
  ];

  return (
    <div className="flex flex-col" data-testid="home-page">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white">
        <div className="absolute inset-0 bg-gradient-to-br from-[#EAF7F5] via-white to-[#EAF7F5] opacity-60" />
        <div className="relative max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <FadeUp>
              <div>
                <Badge className="mb-4 bg-[hsl(var(--accent))] text-[hsl(var(--primary))] hover:bg-[hsl(var(--accent))]" data-testid="hero-badge">
                  Singapore's Digital Transformation Partner
                </Badge>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-[hsl(var(--foreground))]">
                  Empowering SMEs with Smart Digital Solutions
                </h1>
                <p className="mt-6 text-base text-[#1F2A37] max-w-prose leading-relaxed">
                  Websites, Apps & AI that Work. CCC delivers AI implementation, modern websites/apps, e-commerce, and grants support (EDG/SFEC) for Singapore SMEs.
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Button 
                    asChild
                    className="bg-[hsl(var(--secondary))] hover:bg-[#0AA099] text-white shadow-[0_6px_18px_rgba(15,181,174,0.22)]"
                    data-testid="hero-primary-cta-button"
                  >
                    <Link to="/contact">Book a Consultation</Link>
                  </Button>
                  <Button 
                    asChild
                    variant="outline"
                    className="border-[hsl(var(--border))]"
                    data-testid="hero-secondary-cta-button"
                  >
                    <Link to="/portfolio">View Portfolio <ArrowRight className="ml-2 h-4 w-4" /></Link>
                  </Button>
                </div>
              </div>
            </FadeUp>
            
            <FadeUp delay={0.1}>
              <Card className="rounded-xl overflow-hidden shadow-[0_12px_40px_rgba(16,24,40,0.08)] border-0">
                <img 
                  alt="Singapore Marina Bay skyline" 
                  src="https://images.unsplash.com/photo-1577548696089-f7bcbc22f70e?auto=format&fit=crop&q=85&w=800&h=600" 
                  className="w-full h-[360px] object-cover" 
                  data-testid="hero-image"
                />
              </Card>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* Services Overview */}
      <section className="py-16 sm:py-20 lg:py-28 bg-white" data-testid="services-section">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeUp>
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-semibold text-[hsl(var(--foreground))] mb-4">
                Comprehensive Digital Services
              </h2>
              <p className="text-base text-[#475467] max-w-2xl mx-auto">
                From concept to deployment, we provide end-to-end solutions that help your business thrive in the digital age.
              </p>
            </div>
          </FadeUp>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {services.map((service, index) => (
              <FadeUp key={service.title} delay={index * 0.1}>
                <Card 
                  className="p-6 rounded-xl hover:shadow-[0_12px_40px_rgba(16,24,40,0.08)] transition-shadow duration-200 border border-[#EAECF0]"
                  data-testid="service-card"
                >
                  <div className="h-10 w-10 rounded-lg bg-[hsl(var(--accent))] flex items-center justify-center text-[hsl(var(--primary))] mb-4">
                    <service.icon size={20} />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{service.title}</h3>
                  <p className="text-sm text-[#475467] mb-4">{service.description}</p>
                  <Button 
                    asChild
                    variant="ghost" 
                    className="p-0 h-auto hover:bg-transparent text-[hsl(var(--secondary))] hover:text-[#0AA099]"
                    data-testid={`service-learn-more-${index}`}
                  >
                    <Link to={service.link}>Learn more <ArrowRight className="ml-1 h-4 w-4" /></Link>
                  </Button>
                </Card>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* Grants Highlight */}
      <section className="py-16 sm:py-20 lg:py-28 bg-gradient-to-br from-[#EAF7F5] to-white" data-testid="grants-section">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <FadeUp>
              <div>
                <Badge className="mb-4 bg-[#12B76A] text-white hover:bg-[#12B76A]" data-testid="grants-badge">
                  <Award className="mr-1 h-3 w-3" /> Grant Support Available
                </Badge>
                <h2 className="text-3xl sm:text-4xl font-semibold text-[hsl(var(--foreground))] mb-4">
                  EDG & SFEC Grant Assistance
                </h2>
                <p className="text-base text-[#475467] mb-6">
                  Access up to 50% funding support from Enterprise Singapore. We guide you through the entire application process for Enterprise Development Grant (EDG) and SFEC programs.
                </p>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-[#12B76A] shrink-0 mt-0.5" />
                    <span className="text-sm">Eligibility assessment and documentation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-[#12B76A] shrink-0 mt-0.5" />
                    <span className="text-sm">Application preparation and submission</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-[#12B76A] shrink-0 mt-0.5" />
                    <span className="text-sm">Post-approval implementation support</span>
                  </li>
                </ul>
                <Button 
                  asChild
                  className="bg-[hsl(var(--secondary))] hover:bg-[#0AA099] text-white"
                  data-testid="grants-cta-button"
                >
                  <Link to="/grants">Explore Grant Options <ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
              </div>
            </FadeUp>
            
            <FadeUp delay={0.2}>
              <Card className="p-8 rounded-xl shadow-[0_12px_40px_rgba(16,24,40,0.08)] border-0 bg-white">
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-full bg-[hsl(var(--accent))] flex items-center justify-center">
                      <Award className="h-8 w-8 text-[hsl(var(--secondary))]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-xl">Up to 50%</h3>
                      <p className="text-sm text-[#475467]">Funding Support</p>
                    </div>
                  </div>
                  <div className="border-t pt-6">
                    <h4 className="font-semibold mb-3">Eligible Projects:</h4>
                    <ul className="space-y-2 text-sm text-[#475467]">
                      <li>• Digital transformation initiatives</li>
                      <li>• AI & automation implementation</li>
                      <li>• Website & app development</li>
                      <li>• E-commerce platform setup</li>
                    </ul>
                  </div>
                </div>
              </Card>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* Portfolio Preview */}
      <section className="py-16 sm:py-20 lg:py-28 bg-white" data-testid="portfolio-section">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeUp>
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-semibold text-[hsl(var(--foreground))] mb-4">
                Recent Projects
              </h2>
              <p className="text-base text-[#475467] max-w-2xl mx-auto">
                Explore our portfolio of successful digital transformation projects for Singapore SMEs.
              </p>
            </div>
          </FadeUp>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project, index) => (
              <FadeUp key={project.name} delay={index * 0.1}>
                <Card 
                  className="group overflow-hidden rounded-xl cursor-pointer border-0 shadow-[0_6px_24px_rgba(16,24,40,0.06)] hover:shadow-[0_12px_40px_rgba(16,24,40,0.10)] transition-all duration-200"
                  data-testid="portfolio-item"
                >
                  <div className="overflow-hidden">
                    <img 
                      src={project.image}
                      alt={project.name}
                      className="w-full h-56 object-cover group-hover:scale-[1.02] transition-transform duration-300" 
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="font-semibold text-lg mb-2">{project.name}</h3>
                    <p className="text-sm text-[#475467]">{project.description}</p>
                  </div>
                </Card>
              </FadeUp>
            ))}
          </div>

          <FadeUp delay={0.3}>
            <div className="mt-12 text-center">
              <Button 
                asChild
                variant="outline"
                className="border-[hsl(var(--border))]"
                data-testid="portfolio-view-all-button"
              >
                <Link to="/portfolio">View All Projects <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-16 sm:py-20 bg-[hsl(var(--primary))] text-white" data-testid="cta-banner">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeUp>
            <div className="text-center">
              <h2 className="text-3xl sm:text-4xl font-semibold mb-4">
                Ready to Transform Your Business?
              </h2>
              <p className="text-lg text-[#EAF7F5] mb-8 max-w-2xl mx-auto">
                Let's discuss how we can help you modernize your operations with technology and AI.
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
                  data-testid="cta-services-button"
                >
                  <Link to="/services">Explore Services</Link>
                </Button>
              </div>
            </div>
          </FadeUp>
        </div>
      </section>
    </div>
  );
}