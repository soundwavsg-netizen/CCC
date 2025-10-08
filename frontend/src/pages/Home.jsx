import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../components/ui/accordion';
import { 
  ArrowRight, 
  MessageCircle, 
  CheckCircle2, 
  Globe, 
  ShoppingCart, 
  Smartphone, 
  Bot, 
  Award,
  Phone,
  Mail,
  Users,
  Zap,
  Target
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

// Analytics helper functions
const trackEvent = (eventName, eventData = {}) => {
  if (window.dataLayer) {
    window.dataLayer.push({
      event: eventName,
      ...eventData
    });
  }
};

export default function Home() {
  const [isFormSubmitted, setIsFormSubmitted] = useState(false);
  const [isFormLoading, setIsFormLoading] = useState(false);

  // Track hero view on component mount
  useEffect(() => {
    trackEvent('view_hero_cta');
  }, []);

  const handleChatOpen = (source = 'hero') => {
    trackEvent('click_chat_open', { source });
    // This will be handled by ChatWidget component
    const chatWidget = document.querySelector('[data-testid="chat-widget"]');
    if (chatWidget) {
      chatWidget.click();
    }
  };

  const handleBookConsultClick = () => {
    trackEvent('book_consult_click');
    // Scroll to lead form
    document.getElementById('lead-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setIsFormLoading(true);
    
    const formData = new FormData(e.target);
    const leadData = {
      name: formData.get('name'),
      company: formData.get('company'),
      uen: formData.get('uen'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      projectType: formData.get('projectType'),
      goal: formData.get('goal')
    };

    try {
      // Submit to backend (existing contact form endpoint)
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/contact-form`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: leadData.name,
          email: leadData.email,
          company: `${leadData.company} (UEN: ${leadData.uen || 'N/A'})`,
          message: `EDG Review Request - Project: ${leadData.projectType}\nGoal: ${leadData.goal}\nPhone: ${leadData.phone}`
        }),
      });

      if (response.ok) {
        trackEvent('lead_form_submitted', leadData);
        setIsFormSubmitted(true);
      }
    } catch (error) {
      console.error('Form submission error:', error);
    }
    setIsFormLoading(false);
  };

  const services = [
    {
      icon: Globe,
      title: 'AI-Powered Websites',
      description: 'Responsive, fast websites with integrated AI chat and automation capabilities.'
    },
    {
      icon: ShoppingCart,
      title: 'E-commerce & Inventory',
      description: 'Complete online stores with payment processing and inventory management.'
    },
    {
      icon: Smartphone,
      title: 'Progressive Web Apps (PWA)',
      description: 'Mobile-app-like experiences that work across all devices without app stores.'
    },
    {
      icon: Bot,
      title: 'AI Agents & Automation',
      description: 'Custom AI assistants and workflow automation to boost productivity.'
    },
    {
      icon: Award,
      title: 'Grant Advisory & Documentation (EDG)',
      description: 'Complete support for EDG applications and documentation.'
    }
  ];

  const faqItems = [
    {
      question: 'Am I eligible for EDG?',
      answer: 'If you\'re a Singapore-registered company planning a project that improves business capability, you likely qualify.'
    },
    {
      question: 'What projects are supported?',
      answer: 'Custom websites, e-commerce, AI-powered web apps (PWAs), and digital transformation initiatives.'
    },
    {
      question: 'How long is approval?',
      answer: 'Typically 3–6 weeks after submission.'
    },
    {
      question: 'How much will I pay?',
      answer: 'EDG may support up to ~50% of qualifying costs. We\'ll estimate your net after a quick eligibility check.'
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
                <Badge className="mb-4 bg-[#12B76A] text-white hover:bg-[#12B76A]" data-testid="hero-badge">
                  <Award className="mr-1 h-3 w-3" /> EDG Funding Available
                </Badge>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-[hsl(var(--foreground))] mb-6">
                  Build Your Website or App with up to 50% EDG Funding
                </h1>
                <p className="text-base text-[#1F2A37] max-w-prose leading-relaxed mb-8">
                  We design, build, and handle the EDG paperwork—so you get results in weeks, not months.
                </p>
                <p className="text-sm text-[#475467] mb-8">
                  EDG supports custom web/app projects that improve your business capability. We handle scope, paperwork, and development.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button 
                    onClick={() => handleChatOpen('hero')}
                    className="bg-[hsl(var(--secondary))] hover:bg-[#0AA099] text-white shadow-[0_6px_18px_rgba(15,181,174,0.22)]"
                    data-testid="hero-primary-cta-button"
                  >
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Check EDG Eligibility — Chat Now
                  </Button>
                  <Button 
                    onClick={handleBookConsultClick}
                    variant="outline"
                    className="border-[hsl(var(--border))]"
                    data-testid="hero-secondary-cta-button"
                  >
                    Book a Free Consult <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </FadeUp>
            
            <FadeUp delay={0.1}>
              <Card className="rounded-xl overflow-hidden shadow-[0_12px_40px_rgba(16,24,40,0.08)] border-0">
                <img 
                  alt="Singapore business technology and EDG funding" 
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