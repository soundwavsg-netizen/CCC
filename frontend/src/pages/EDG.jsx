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
  Award,
  DollarSign,
  Clock,
  FileText,
  Users,
  Target,
  Lightbulb
} from 'lucide-react';
import { 
  trackHeroView, 
  trackChatOpen, 
  trackFormViewed, 
  trackFormSubmitted, 
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

export default function EDG() {
  const [isFormSubmitted, setIsFormSubmitted] = useState(false);
  const [isFormLoading, setIsFormLoading] = useState(false);

  // Track hero view on component mount
  useEffect(() => {
    trackHeroView('edg-landing');
  }, []);

  const handleChatOpen = (source = 'edg-hero') => {
    trackChatOpen(source);
    // This will be handled by ChatWidget component
    const chatWidget = document.querySelector('[data-testid="chat-widget"]');
    if (chatWidget) {
      chatWidget.click();
    }
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
          message: `EDG Landing Page Lead - Project: ${leadData.projectType}\nGoal: ${leadData.goal}\nPhone: ${leadData.phone}`
        }),
      });

      if (response.ok) {
        trackFormSubmitted({ ...leadData, source: 'edg-landing' });
        setIsFormSubmitted(true);
      }
    } catch (error) {
      console.error('Form submission error:', error);
    }
    setIsFormLoading(false);
  };

  const expandedFaqItems = [
    {
      question: 'Am I eligible for EDG?',
      answer: 'If you\'re a Singapore-registered company planning a project that improves business capability, you likely qualify. Companies must have been registered for at least 6 months and meet certain criteria including local shareholding requirements.'
    },
    {
      question: 'What projects are supported?',
      answer: 'Custom websites, e-commerce platforms, AI-powered web apps (PWAs), digital transformation initiatives, workflow automation, and business management systems that enhance operational efficiency.'
    },
    {
      question: 'How long is approval?',
      answer: 'Typically 3–6 weeks after submission. However, the timeline can vary depending on project complexity and current application volumes at Enterprise Singapore.'
    },
    {
      question: 'How much will I pay?',
      answer: 'EDG may support up to ~50% of qualifying costs for SMEs, and up to 70% for startups (less than 5 years old). The final support level depends on your company profile and project scope. We\'ll provide a detailed estimate after your eligibility assessment.'
    },
    {
      question: 'What happens after EDG approval?',
      answer: 'Once approved, we begin project development according to the agreed timeline. EDG funding is disbursed in milestones, and we handle all documentation and compliance requirements throughout the project.'
    },
    {
      question: 'Can I apply for multiple projects?',
      answer: 'Yes, companies can apply for multiple EDG projects, subject to overall funding caps. Each project is assessed independently, and we can help you prioritize projects for maximum impact.'
    },
    {
      question: 'What if my application is rejected?',
      answer: 'We work closely with you to address any concerns and can help resubmit applications with improvements. Our experience helps minimize rejection risks through proper preparation.'
    },
    {
      question: 'Do you handle the entire EDG process?',
      answer: 'Yes, we manage the complete process: eligibility assessment, application preparation, submission, project execution, milestone documentation, and final claim submission.'
    }
  ];

  const benefits = [
    {
      icon: DollarSign,
      title: 'Up to 50-70% Funding Support',
      description: 'Significantly reduce your out-of-pocket costs with substantial government support.'
    },
    {
      icon: Clock,
      title: 'Fast Application Process',
      description: 'We streamline the application process to get approval in 3-6 weeks.'
    },
    {
      icon: FileText,
      title: 'Complete Documentation',
      description: 'End-to-end paperwork handling from application to final claims submission.'
    },
    {
      icon: Target,
      title: 'Proven Track Record',
      description: 'High success rate with EDG applications and satisfied clients.'
    }
  ];

  return (
    <div className="flex flex-col" data-testid="edg-page">
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
                  Get Up to 50% EDG Funding for Your Digital Project
                </h1>
                <p className="text-base text-[#1F2A37] max-w-prose leading-relaxed mb-8">
                  Transform your business with a custom website, e-commerce platform, or web app. We handle both the development and the EDG paperwork—so you focus on growing your business.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button 
                    onClick={() => handleChatOpen('edg-hero')}
                    className="bg-[hsl(var(--secondary))] hover:bg-[#0AA099] text-white shadow-[0_6px_18px_rgba(15,181,174,0.22)]"
                    data-testid="hero-primary-cta-button"
                  >
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Check EDG Eligibility Now
                  </Button>
                  <Button 
                    onClick={() => document.getElementById('lead-form')?.scrollIntoView({ behavior: 'smooth' })}
                    variant="outline"
                    className="border-[hsl(var(--border))]"
                    data-testid="hero-secondary-cta-button"
                  >
                    Request Detailed Review <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </FadeUp>
            
            <FadeUp delay={0.1}>
              <Card className="rounded-xl overflow-hidden shadow-[0_12px_40px_rgba(16,24,40,0.08)] border-0">
                <img 
                  alt="Singapore EDG funding for digital transformation" 
                  src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=85&w=800&h=600" 
                  className="w-full h-[360px] object-cover" 
                  data-testid="hero-image"
                />
              </Card>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeUp>
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-semibold text-[hsl(var(--foreground))] mb-4">
                Why Choose CCC for EDG-Funded Projects?
              </h2>
              <p className="text-base text-[#475467] max-w-2xl mx-auto">
                We combine technical expertise with deep knowledge of the EDG application process.
              </p>
            </div>
          </FadeUp>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <FadeUp key={index} delay={index * 0.1}>
                <div className="text-center">
                  <div className="h-16 w-16 rounded-lg bg-[hsl(var(--secondary))] flex items-center justify-center text-white mx-auto mb-4">
                    <benefit.icon size={24} />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{benefit.title}</h3>
                  <p className="text-sm text-[#475467]">{benefit.description}</p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* Lead Form Section */}
      <section id="lead-form" className="py-16 sm:py-20 bg-gradient-to-br from-[#F9FAFB] to-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeUp>
            <div className="text-center mb-8">
              <h2 className="text-3xl sm:text-4xl font-semibold text-[hsl(var(--foreground))] mb-4">
                Get Your Free EDG Eligibility Assessment
              </h2>
              <p className="text-base text-[#475467]">
                Complete this form and we'll provide a detailed assessment of your project's EDG funding potential.
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
                  <h3 className="text-xl font-semibold mb-2">Assessment Requested!</h3>
                  <p className="text-[#475467]">
                    We'll review your EDG eligibility and send a detailed funding assessment within 1 business day.
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
                        data-testid="edg-form-name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="company">Company *</Label>
                      <Input 
                        id="company" 
                        name="company" 
                        required 
                        placeholder="Company name"
                        data-testid="edg-form-company"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="uen">UEN *</Label>
                      <Input 
                        id="uen" 
                        name="uen" 
                        required
                        placeholder="201234567A"
                        data-testid="edg-form-uen"
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
                        data-testid="edg-form-email"
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
                        data-testid="edg-form-phone"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="projectType">Project Type *</Label>
                      <Select name="projectType" required>
                        <SelectTrigger data-testid="edg-form-project-type">
                          <SelectValue placeholder="Select project type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Website">Website</SelectItem>
                          <SelectItem value="E-commerce">E-commerce</SelectItem>
                          <SelectItem value="Web App (PWA)">Web App (PWA)</SelectItem>
                          <SelectItem value="AI Automation">AI Automation</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="goal">Project Goals & Requirements *</Label>
                    <Textarea 
                      id="goal" 
                      name="goal" 
                      required 
                      placeholder="Describe what you want to achieve with this project and any specific requirements..."
                      className="min-h-[120px]"
                      data-testid="edg-form-goal"
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-[hsl(var(--secondary))] hover:bg-[#0AA099] text-white"
                    disabled={isFormLoading}
                    data-testid="edg-form-submit"
                  >
                    {isFormLoading ? 'Submitting...' : 'Get Free EDG Assessment'}
                  </Button>
                </form>
              )}
            </Card>
          </FadeUp>
        </div>
      </section>

      {/* Expanded FAQ Section */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeUp>
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-semibold text-[hsl(var(--foreground))] mb-4">
                EDG Funding - Complete Guide
              </h2>
              <p className="text-base text-[#475467]">
                Everything you need to know about Enterprise Development Grant funding for your digital project.
              </p>
            </div>
          </FadeUp>

          <FadeUp delay={0.1}>
            <Accordion type="single" collapsible className="w-full">
              {expandedFaqItems.map((faq, index) => (
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
            <div className="text-center mt-12">
              <p className="text-sm text-[#475467] mb-4">
                Still have questions about EDG funding?
              </p>
              <Button 
                onClick={() => handleChatOpen('edg-faq')}
                className="bg-[hsl(var(--secondary))] hover:bg-[#0AA099] text-white"
                data-testid="faq-chat-cta"
              >
                <MessageCircle className="mr-2 h-4 w-4" />
                Chat with Our EDG Specialist
              </Button>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-20 bg-gradient-to-br from-[#EAF7F5] to-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <FadeUp>
            <div className="mb-8">
              <h2 className="text-3xl sm:text-4xl font-semibold text-[hsl(var(--foreground))] mb-4">
                Ready to Start Your EDG-Funded Digital Project?
              </h2>
              <p className="text-base text-[#475467] mb-8">
                Let's discuss your project requirements and explore how EDG funding can help you achieve your business goals.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  onClick={() => handleChatOpen('edg-cta')}
                  className="bg-[hsl(var(--secondary))] hover:bg-[#0AA099] text-white shadow-[0_6px_18px_rgba(15,181,174,0.22)]"
                  data-testid="cta-primary-button"
                >
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Start EDG Assessment
                </Button>
                <Button 
                  asChild
                  variant="outline"
                  className="border-[hsl(var(--border))]"
                  data-testid="cta-secondary-button"
                >
                  <Link to="/contact">
                    Schedule a Consultation <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </FadeUp>
        </div>
      </section>
    </div>
  );
}