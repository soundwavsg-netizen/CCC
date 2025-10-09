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
import { 
  trackHeroView, 
  trackChatOpen, 
  trackFormViewed, 
  trackFormSubmitted, 
  trackBookConsultClick 
} from '../utils/analytics';
import { 
  getOrganizationSchema, 
  getFAQSchema, 
  getWebPageSchema, 
  injectSchema, 
  setPageMeta, 
  pageMetaData 
} from '../utils/seo';

// Analytics helper functions - use centralized analytics
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
  const [isFormSubmitted, setIsFormSubmitted] = useState(false);
  const [isFormLoading, setIsFormLoading] = useState(false);

  // Define FAQ items for schema
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

  // Track hero view on component mount and set SEO
  useEffect(() => {
    trackHeroView('homepage');
    
    // Set page meta tags
    setPageMeta(pageMetaData.home);
    
    // Inject schemas
    injectSchema(getOrganizationSchema());
    injectSchema(getWebPageSchema({
      title: pageMetaData.home.title,
      description: pageMetaData.home.description,
      url: pageMetaData.home.ogUrl
    }));
    injectSchema(getFAQSchema(faqItems));
  }, []);

  const handleChatOpen = (source = 'hero') => {
    trackChatOpen(source);
    // Find and click the chat widget button
    const chatButton = document.querySelector('[data-testid="chat-widget-button"]');
    if (chatButton) {
      chatButton.click();
    }
  };

  const handleBookConsultClick = () => {
    trackBookConsultClick('hero');
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
      // Submit to backend (existing contact endpoint)
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/contact`, {
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
        trackFormSubmitted({ ...leadData, source: 'homepage' });
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

      {/* Lead Form Section */}
      <section id="lead-form" className="py-16 sm:py-20 bg-gradient-to-br from-[#F9FAFB] to-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeUp>
            <div className="text-center mb-8">
              <h2 className="text-3xl sm:text-4xl font-semibold text-[hsl(var(--foreground))] mb-4">
                Request EDG Review
              </h2>
              <p className="text-base text-[#475467]">
                Get a quick assessment of your project's EDG eligibility and funding potential.
              </p>
            </div>
          </FadeUp>

          <FadeUp delay={0.1}>
            <Card className="p-8 rounded-xl shadow-[0_12px_40px_rgba(16,24,40,0.08)] border-0">
              {isFormSubmitted ? (
                <div className="text-center py-8">
                  <div className="h-16 w-16 rounded-full bg-[#12B76A] flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Thanks!</h3>
                  <p className="text-[#475467]">
                    We'll review your EDG eligibility and reply within 1 business day via your preferred contact.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleFormSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name *</Label>
                      <Input 
                        id="name" 
                        name="name" 
                        required 
                        placeholder="Your full name"
                        data-testid="lead-form-name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="company">Company *</Label>
                      <Input 
                        id="company" 
                        name="company" 
                        required 
                        placeholder="Company name"
                        data-testid="lead-form-company"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="uen">UEN (Optional)</Label>
                      <Input 
                        id="uen" 
                        name="uen" 
                        placeholder="201234567A"
                        data-testid="lead-form-uen"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input 
                        id="email" 
                        name="email" 
                        type="email" 
                        required 
                        placeholder="you@company.com"
                        data-testid="lead-form-email"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone (WhatsApp)</Label>
                      <Input 
                        id="phone" 
                        name="phone" 
                        placeholder="+65 9123 4567"
                        data-testid="lead-form-phone"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="projectType">Project Type *</Label>
                      <Select name="projectType" required>
                        <SelectTrigger data-testid="lead-form-project-type">
                          <SelectValue placeholder="Select project type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Website">Website</SelectItem>
                          <SelectItem value="Web App">Web App</SelectItem>
                          <SelectItem value="E-commerce">E-commerce</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="goal">Short Goal *</Label>
                    <Textarea 
                      id="goal" 
                      name="goal" 
                      required 
                      placeholder="Briefly describe what you want to achieve with this project..."
                      className="min-h-[100px]"
                      data-testid="lead-form-goal"
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-[hsl(var(--secondary))] hover:bg-[#0AA099] text-white"
                    disabled={isFormLoading}
                    data-testid="lead-form-submit"
                  >
                    {isFormLoading ? 'Submitting...' : 'Request EDG Review'}
                  </Button>
                </form>
              )}
            </Card>
          </FadeUp>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeUp>
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-semibold text-[hsl(var(--foreground))] mb-4">
                How It Works
              </h2>
              <p className="text-base text-[#475467] max-w-2xl mx-auto">
                Get your digital project built with EDG support in three simple steps.
              </p>
            </div>
          </FadeUp>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '1',
                icon: MessageCircle,
                title: 'Chat with our AI to scope your project',
                description: 'Our AI consultant will help qualify your requirements and assess EDG eligibility.'
              },
              {
                step: '2',
                icon: CheckCircle2,
                title: 'Get a quick EDG eligibility review',
                description: 'Receive a detailed assessment of funding potential and project scope within 1 business day.'
              },
              {
                step: '3',
                icon: Zap,
                title: 'We build & submit your project with grant support',
                description: 'Complete development and EDG documentation handled by our team.'
              }
            ].map((item, index) => (
              <FadeUp key={index} delay={index * 0.1}>
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[hsl(var(--accent))] text-[hsl(var(--primary))] font-semibold text-xl mb-4">
                    {item.step}
                  </div>
                  <div className="h-10 w-10 rounded-lg bg-[hsl(var(--secondary))] flex items-center justify-center text-white mx-auto mb-4">
                    <item.icon size={20} />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                  <p className="text-sm text-[#475467]">{item.description}</p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* Services Strip */}
      <section className="py-16 sm:py-20 bg-gradient-to-br from-[#F9FAFB] to-white">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeUp>
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-semibold text-[hsl(var(--foreground))] mb-4">
                EDG-Eligible Digital Solutions
              </h2>
              <p className="text-base text-[#475467] max-w-2xl mx-auto">
                Choose from our range of services that qualify for EDG funding support.
              </p>
            </div>
          </FadeUp>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.slice(0, 5).map((service, index) => (
              <FadeUp key={service.title} delay={index * 0.1}>
                <Card className="p-6 rounded-xl hover:shadow-[0_12px_40px_rgba(16,24,40,0.08)] transition-shadow duration-200 border border-[#EAECF0] h-full">
                  <div className="h-10 w-10 rounded-lg bg-[hsl(var(--secondary))] flex items-center justify-center text-white mb-4">
                    <service.icon size={20} />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{service.title}</h3>
                  <p className="text-sm text-[#475467] mb-4 flex-grow">{service.description}</p>
                  <Button 
                    onClick={() => {
                      // Scroll to services section on services-solutions page
                      window.location.href = '/services-solutions#services';
                    }}
                    variant="ghost" 
                    className="p-0 h-auto hover:bg-transparent text-[hsl(var(--secondary))] hover:text-[#0AA099]"
                    data-testid={`service-learn-more-${index}`}
                  >
                    Learn More <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                </Card>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeUp>
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-semibold text-[hsl(var(--foreground))] mb-4">
                Frequently Asked Questions
              </h2>
              <p className="text-base text-[#475467]">
                Common questions about EDG funding and our services.
              </p>
            </div>
          </FadeUp>

          <FadeUp delay={0.1}>
            <Accordion type="single" collapsible className="w-full">
              {faqItems.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                  <AccordionContent className="text-[#475467]">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </FadeUp>

          <FadeUp delay={0.2}>
            <div className="text-center mt-8">
              <Button 
                onClick={() => handleChatOpen('faq')}
                className="bg-[hsl(var(--secondary))] hover:bg-[#0AA099] text-white"
                data-testid="faq-chat-cta"
              >
                <MessageCircle className="mr-2 h-4 w-4" />
                Ask More Questions
              </Button>
            </div>
          </FadeUp>
        </div>
      </section>
    </div>
  );
}