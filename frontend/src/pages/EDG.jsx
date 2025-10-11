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
    // Find and click the chat widget button
    const chatButton = document.querySelector('[data-testid="chat-widget-button"]');
    if (chatButton) {
      chatButton.click();
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
      // Submit to backend (existing contact endpoint)
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: leadData.name,
          email: leadData.email,
          phone: leadData.phone,
          company: `${leadData.company} (UEN: ${leadData.uen || 'N/A'})`,
          message: `EDG Landing Page Lead - Project: ${leadData.projectType}\nGoal: ${leadData.goal}`
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
      question: 'Can all website or app projects qualify for EDG funding?',
      answer: 'Not all digital projects are eligible. Enterprise Singapore generally supports projects that demonstrate business transformation — for example, automation, AI integration, workflow redesign, or innovation. Standard website or e-commerce projects typically fall outside the scope unless tied to broader process improvement.'
    },
    {
      question: 'Will CCC help with the EDG application process?',
      answer: 'Yes, we assist in structuring your proposal and documentation to align with EDG\'s requirements. However, all funding decisions rest solely with Enterprise Singapore, and approval is not guaranteed.'
    },
    {
      question: 'What if my business isn\'t eligible for EDG?',
      answer: 'CCC can still help you achieve your digital goals through flexible, affordable project options — from AI chatbots and automation tools to full website builds and CRM integrations.'
    },
    {
      question: 'What types of projects align with EDG transformation requirements?',
      answer: 'EDG typically supports projects involving AI automation, workflow redesign, process digitization, or measurable productivity improvements. The project must demonstrate clear business transformation beyond basic website development.'
    },
    {
      question: 'How long does the EDG application process take?',
      answer: 'The typical application process takes 6-8 weeks from submission to approval. CCC helps ensure documentation is complete and aligned with EDG requirements, but approval timelines depend on Enterprise Singapore\'s review process.'
    },
    {
      question: 'What happens if our EDG application is not approved?',
      answer: 'CCC still delivers your digital transformation project through our commercial packages. We work with you to find alternative funding or payment arrangements to ensure your business goals are achieved.'
    },
    {
      question: 'Does CCC guarantee EDG approval?',
      answer: 'No, CCC cannot guarantee EDG approval as all funding decisions are made independently by Enterprise Singapore. We provide advisory support to align your project with EDG requirements and improve your application\'s prospects.'
    },
    {
      question: 'What is CCC\'s role in the EDG process?',
      answer: 'CCC serves as your digital transformation consultant and project implementer. We help structure proposals, provide technical specifications, and ensure deliverables meet both your business needs and EDG requirements.'
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
      {/* Hero Section - Updated for Compliance */}
      <section className="relative overflow-hidden bg-white">
        <div className="absolute inset-0 bg-gradient-to-br from-[#EAF7F5] via-white to-[#EAF7F5] opacity-60" />
        <div className="relative max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <FadeUp>
              <div>
                {/* CCC Logo */}
                <div className="mb-6">
                  <img 
                    src="https://customer-assets.emergentagent.com/job_smartbiz-portal/artifacts/p67oqb1l_Screenshot%202025-10-11%20at%204.38.29%20PM.png" 
                    alt="Cognition & Competence Consultancy" 
                    className="h-12 w-auto object-contain"
                    style={{ 
                      background: 'transparent',
                      filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
                    }}
                  />
                </div>
                <Badge className="mb-4 bg-[#12B76A] text-white hover:bg-[#12B76A]" data-testid="hero-badge">
                  <Award className="mr-1 h-3 w-3" /> Strategic Guidance
                </Badge>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-[hsl(var(--foreground))] mb-6">
                  Empowering SMEs Through Digital Transformation
                </h1>
                <p className="text-base text-[#1F2A37] max-w-prose leading-relaxed mb-6">
                  CCC helps Singapore businesses modernize their operations with AI automation, intelligent web systems, and digital workflows.
                </p>
                <p className="text-base text-[#475467] max-w-prose leading-relaxed mb-6">
                  For eligible SMEs, portions of these transformation projects may qualify for support under Enterprise Singapore's Enterprise Development Grant (EDG).
                </p>
                <p className="text-sm text-[#6B7280] mb-8">
                  CCC assists with project documentation and alignment to ensure your proposal meets transformation-focused requirements — but final funding approval is determined solely by Enterprise Singapore.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button 
                    onClick={() => handleChatOpen('edg-hero')}
                    className="bg-[hsl(var(--secondary))] hover:bg-[#0AA099] text-white shadow-[0_6px_18px_rgba(15,181,174,0.22)]"
                    data-testid="hero-primary-cta-button"
                  >
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Check EDG Alignment Advisory
                  </Button>
                  <Button 
                    onClick={() => document.getElementById('lead-form')?.scrollIntoView({ behavior: 'smooth' })}
                    variant="outline"
                    className="border-[hsl(var(--border))]"
                    data-testid="hero-secondary-cta-button"
                  >
                    Request Project Assessment <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </FadeUp>
            
            <FadeUp delay={0.1}>
              <Card className="rounded-xl overflow-hidden shadow-[0_12px_40px_rgba(16,24,40,0.08)] border-0">
                <img 
                  alt="Singapore business transformation and digital modernization" 
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
                Request Project Assessment & EDG Alignment Review
              </h2>
              <p className="text-base text-[#475467]">
                Share your project details and we'll assess potential EDG alignment and provide recommendations.
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
                  <h3 className="text-xl font-semibold mb-2">Assessment Submitted!</h3>
                  <p className="text-[#475467]">
                    We'll review your project for potential EDG alignment and contact you within 1 business day with our recommendations and next steps.
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
                    {isFormLoading ? 'Submitting...' : 'Request Project Assessment'}
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