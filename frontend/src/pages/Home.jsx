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
import PageHeader from '../components/PageHeader';
import { 
  ArrowRight, 
  MessageCircle, 
  CheckCircle2, 
  Globe, 
  ShoppingCart, 
  Smartphone, 
  Bot, 
  Award,
  Zap,
  BarChart3,
  Settings,
  Users,
  Rocket,
  Search,
  Target,
  TrendingUp,
  Sparkles
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

  // Track hero view on component mount and set SEO
  useEffect(() => {
    trackHeroView('homepage');
    
    // Set page meta tags for commercial positioning
    setPageMeta({
      title: "CCC Digital - Smart Websites, AI & Automation for Singapore SMEs",
      description: "We build smart websites, e-commerce platforms, AI chatbots and WhatsApp automation. Singapore digital consultancy helping SMEs grow with modern technology.",
      ogTitle: "Build Smarter Websites. Automate with AI. Engage Customers Instantly.",
      ogDescription: "CCC helps Singapore businesses create modern digital experiences — from responsive websites to AI chatbots and WhatsApp automation.",
      ogUrl: "https://smartbiz-portal.preview.emergentagent.com"
    });
    
    // Inject schemas
    injectSchema(getOrganizationSchema());
    injectSchema(getWebPageSchema({
      title: "CCC Digital - Smart Websites, AI & Automation",
      description: "Singapore digital consultancy specializing in websites, AI chatbots, and WhatsApp automation",
      url: "https://smartbiz-portal.preview.emergentagent.com"
    }));
  }, []);

  const handleChatOpen = (source = 'hero') => {
    trackChatOpen(source);
    const chatButton = document.querySelector('[data-testid="chat-widget-button"]');
    if (chatButton) {
      chatButton.click();
    }
  };

  const handleStartProject = () => {
    trackBookConsultClick('hero');
    document.getElementById('lead-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setIsFormLoading(true);
    
    const formData = new FormData(e.target);
    const leadData = {
      name: formData.get('name'),
      company: formData.get('company'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      projectType: formData.get('projectType'),
      goal: formData.get('goal'),
      edgInterest: formData.get('edgInterest') || false
    };

    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: leadData.name,
          email: leadData.email,
          phone: leadData.phone,
          company: leadData.company,
          message: `Commercial Lead - Project: ${leadData.projectType}\nGoal: ${leadData.goal}\nEDG Interest: ${leadData.edgInterest ? 'Yes' : 'No'}`
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
      id: 'website-ecommerce',
      icon: Globe,
      title: 'Website & E-Commerce Development',
      description: 'Fast, mobile-ready, and scalable websites built for growth. Includes integrated payment, inventory tracking, and SEO-optimised design.'
    },
    {
      id: 'ai-chatbots',
      icon: Bot,
      title: 'AI Chatbots & Workflow Automation',
      description: 'Automate repetitive processes, qualify leads instantly, and save time. Chatbots powered by AI integrated into your website or WhatsApp.'
    },
    {
      id: 'whatsapp-bot',
      icon: MessageCircle,
      title: 'WhatsApp AI Bot Integration',
      description: 'Engage customers directly on WhatsApp — your most powerful communication channel. Simple setup or Official Business API integration available.'
    },
    {
      id: 'crm-analytics',
      icon: BarChart3,
      title: 'CRM & Analytics Integration',
      description: 'Connect your website or chatbot to HubSpot, Google Sheets, or custom dashboards. Track leads, automate follow-ups, and visualise insights.'
    },
    {
      id: 'custom-systems',
      icon: Settings,
      title: 'Custom Web Systems / Portals',
      description: 'Tailored admin or client portals for booking, order management, analytics, or project tracking. Built to your specific needs.'
    }
  ];

  const processSteps = [
    {
      step: '1',
      icon: Search,
      title: 'Discovery',
      description: 'Understand your business goals and processes'
    },
    {
      step: '2',
      icon: Target,
      title: 'Design',
      description: 'Develop wireframes and user experience flow'
    },
    {
      step: '3',
      icon: Settings,
      title: 'Development',
      description: 'Build, integrate, and automate'
    },
    {
      step: '4',
      icon: Rocket,
      title: 'Launch & Support',
      description: 'Deploy with testing, handover, and long-term maintenance'
    }
  ];

  return (
    <div className="flex flex-col" data-testid="home-page">
      {/* Modern AI SaaS Hero Section */}
      <section className="relative min-h-screen bg-gradient-to-br from-[#667eea] via-[#764ba2] to-[#8B5CF6] overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 20% 50%, rgba(255,255,255,0.2) 1px, transparent 1px),
                             radial-gradient(circle at 80% 50%, rgba(255,255,255,0.15) 1px, transparent 1px),
                             radial-gradient(circle at 40% 20%, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '100px 100px, 80px 80px, 120px 120px',
            animation: 'float 20s ease-in-out infinite'
          }}></div>
        </div>
        
        {/* Floating AI Elements */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-4 h-4 bg-white/20 rounded-full blur-sm"
              animate={{
                x: [0, 100, 0],
                y: [0, -100, 0],
                opacity: [0.2, 0.8, 0.2],
                scale: [0.5, 1.2, 0.5]
              }}
              transition={{
                duration: 8 + i * 2,
                repeat: Infinity,
                delay: i * 1.5,
                ease: "easeInOut"
              }}
              style={{
                left: `${5 + i * 8}%`,
                top: `${10 + (i % 3) * 30}%`
              }}
            />
          ))}
        </div>

        {/* Glass Morphism Header */}
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
            
            {/* CCC Logo with AI Glow */}
            <motion.div 
              className="mb-8"
              animate={{ 
                boxShadow: [
                  '0 0 20px rgba(139, 92, 246, 0.3)',
                  '0 0 40px rgba(139, 92, 246, 0.6)',
                  '0 0 20px rgba(139, 92, 246, 0.3)'
                ]
              }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <img 
                src="https://customer-assets.emergentagent.com/job_smartbiz-portal/artifacts/p67oqb1l_Screenshot%202025-10-11%20at%204.38.29%20PM.png" 
                alt="Cognition & Competence Consultancy" 
                className="h-24 w-auto object-contain mx-auto rounded-2xl bg-white/10 backdrop-blur-sm p-4 border border-white/20"
                style={{ 
                  filter: 'drop-shadow(0 8px 32px rgba(139, 92, 246, 0.4))'
                }}
              />
            </motion.div>

            {/* AI Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <Badge className="ai-badge mb-8 text-lg px-8 py-3">
                <Bot className="mr-3 h-6 w-6" /> 
                C³ AI Employees Platform
              </Badge>
            </motion.div>
            
            {/* Hero Title with Gradient Text */}
            <motion.h1 
              className="text-5xl sm:text-6xl lg:text-8xl font-bold tracking-tight mb-8 leading-none"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.2 }}
            >
              <span className="text-white">Hire AI Employees —</span>
              <br />
              <span 
                className="bg-gradient-to-r from-[#f093fb] via-[#f5576c] to-[#4facfe] bg-clip-text text-transparent"
                style={{ fontFamily: 'Plus Jakarta Sans' }}
              >
                Not Human Staff.
              </span>
            </motion.h1>
            
            {/* Glass Morphism Description Box */}
            <motion.div 
              className="glass-card p-8 mb-12 max-w-4xl mx-auto border border-white/30"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <h2 className="text-2xl sm:text-3xl font-semibold text-white mb-4">
                Build your own team of intelligent AI employees that work 24/7.
              </h2>
              <p className="text-xl text-white/80 leading-relaxed">
                Schedule, manage, design, and train — all in one unified platform.
              </p>
            </motion.div>

            {/* Interactive CTA Buttons */}
            <motion.div 
              className="flex flex-col sm:flex-row gap-6 justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  asChild
                  size="lg"
                  className="btn-ai-primary text-white text-xl px-12 py-4 relative overflow-hidden group"
                >
                  <Link to="/ai-employees">
                    <Bot className="mr-3 h-6 w-6" />
                    <span className="relative z-10">Create Your AI Employee</span>
                  </Link>
                </Button>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  asChild
                  size="lg"
                  className="btn-ai-secondary text-white text-xl px-12 py-4"
                >
                  <Link to="/ai-employees#templates">
                    <Zap className="mr-3 h-6 w-6" />
                    Explore Templates
                  </Link>
                </Button>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  asChild
                  size="lg"
                  className="btn-ai-tertiary text-white text-xl px-12 py-4"
                >
                  <Link to="/contact">
                    <Sparkles className="mr-3 h-6 w-6" />
                    Customize for My Company
                  </Link>
                </Button>
              </motion.div>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div 
              className="mt-16 flex justify-center items-center gap-8 text-white/60"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-400" />
                <span>No Setup Fees</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-400" />
                <span>14-Day Free Trial</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-400" />
                <span>Singapore Based</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Hero Content Section */}
      <section className="relative overflow-hidden bg-white">
        <div className="relative max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex justify-center">
            <FadeUp delay={0.1}>
              <Card className="rounded-xl overflow-hidden shadow-[0_12px_40px_rgba(16,24,40,0.08)] border-0">
                <img 
                  alt="AI Employees dashboard showing multiple AI staff working together" 
                  src="https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&q=85&w=800&h=600" 
                  className="w-full h-[360px] object-cover" 
                  data-testid="hero-image"
                />
              </Card>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* C³ AI Employees Focus Section */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeUp>
            <div className="text-center mb-16">
              <h2 className="text-4xl sm:text-5xl font-bold text-[hsl(var(--foreground))] mb-4">
                The Future of <span className="text-[#E91F2C]">Digital Workforce</span>
              </h2>
              <p className="text-xl text-[#475467] max-w-3xl mx-auto">
                Transform your business with intelligent AI employees that never sleep, never call in sick, and continuously improve.
              </p>
            </div>
          </FadeUp>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
            <FadeUp delay={0.1}>
              <Card className="p-8 rounded-xl shadow-[0_12px_40px_rgba(16,24,40,0.08)] border-0 text-center h-full">
                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-[#293889] to-[#004C8A] flex items-center justify-center text-white mx-auto mb-6">
                  <Users className="h-8 w-8" />
                </div>
                <h3 className="text-2xl font-semibold mb-4">AI Workforce Platform</h3>
                <p className="text-[#475467] leading-relaxed">
                  Hire pre-built AI Employees instantly. No setup, no coding. Choose from 10 specialized roles including Executive Assistant, Project Manager, and Customer Support Rep.
                </p>
              </Card>
            </FadeUp>

            <FadeUp delay={0.2}>
              <Card className="p-8 rounded-xl shadow-[0_12px_40px_rgba(16,24,40,0.08)] border-0 text-center h-full border-2 border-[#E91F2C]">
                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-[#E91F2C] to-[#FF6B6B] flex items-center justify-center text-white mx-auto mb-6">
                  <Bot className="h-8 w-8" />
                </div>
                <Badge className="mb-4 bg-[#E91F2C] text-white">MOST POPULAR</Badge>
                <h3 className="text-2xl font-semibold mb-4">Self-Training System</h3>
                <p className="text-[#475467] leading-relaxed">
                  Teach your AI Employees by uploading files and data — just like onboarding real staff. Train them on your processes, knowledge, and company culture.
                </p>
              </Card>
            </FadeUp>

            <FadeUp delay={0.3}>
              <Card className="p-8 rounded-xl shadow-[0_12px_40px_rgba(16,24,40,0.08)] border-0 text-center h-full">
                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-[#8B5CF6] to-[#A78BFA] flex items-center justify-center text-white mx-auto mb-6">
                  <Settings className="h-8 w-8" />
                </div>
                <h3 className="text-2xl font-semibold mb-4">Custom Creation (Enterprise)</h3>
                <p className="text-[#475467] leading-relaxed">
                  CCC engineers can build EduAI-style clones customized to your organization. Fully branded AI employees tailored to your specific business needs.
                </p>
              </Card>
            </FadeUp>
          </div>

          {/* AI Employee Preview */}
          <FadeUp delay={0.4}>
            <Card className="p-8 rounded-2xl shadow-[0_20px_60px_rgba(16,24,40,0.12)] border border-[#E5E7EB] bg-gradient-to-br from-[#FAFBFC] to-white">
              <h3 className="text-2xl font-bold text-center text-[hsl(var(--foreground))] mb-8">
                Meet Your Future AI Employees
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { name: 'AI Executive Assistant', status: 'Scheduling meeting...', color: 'bg-blue-500' },
                  { name: 'AI Project Manager', status: 'Tracking deliverables...', color: 'bg-green-500' },
                  { name: 'AI Marketing Writer', status: 'Drafting campaign...', color: 'bg-purple-500' },
                  { name: 'AI Data Analyst', status: 'Generating report...', color: 'bg-orange-500' }
                ].map((employee, index) => (
                  <motion.div
                    key={index}
                    className="bg-white rounded-xl p-4 shadow-md border border-[#E5E7EB]"
                    animate={{
                      y: [0, -5, 0],
                      boxShadow: [
                        '0 4px 6px rgba(0,0,0,0.1)',
                        '0 8px 25px rgba(0,0,0,0.15)',
                        '0 4px 6px rgba(0,0,0,0.1)'
                      ]
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      delay: index * 0.5
                    }}
                  >
                    <div className={`h-12 w-12 ${employee.color} rounded-lg flex items-center justify-center text-white mb-3`}>
                      <Bot className="h-6 w-6" />
                    </div>
                    <h4 className="font-semibold text-sm mb-2">{employee.name}</h4>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-xs text-[#6B7280]">{employee.status}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
              
              <div className="text-center mt-8">
                <Button 
                  asChild
                  style={{ backgroundColor: '#293889', color: 'white' }}
                  className="hover:bg-[#1e2c6b] font-medium"
                >
                  <Link to="/ai-employees">
                    <ArrowRight className="mr-2 h-4 w-4" style={{ color: 'white' }} />
                    <span style={{ color: 'white' }}>See All 10 AI Employee Templates</span>
                  </Link>
                </Button>
              </div>
            </Card>
          </FadeUp>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <FadeUp>
              <div>
                <h2 className="text-3xl sm:text-4xl font-semibold text-[hsl(var(--foreground))] mb-6">
                  Who We Are
                </h2>
                <p className="text-base text-[#475467] mb-6 leading-relaxed">
                  CCC is a Singapore-based digital consultancy specialising in modern web systems, AI-powered automation, and intelligent chat solutions.
                </p>
                <p className="text-base text-[#475467] mb-8 leading-relaxed">
                  We combine creativity with smart technology to help SMEs streamline sales, engage customers, and scale operations efficiently — without complex tech setups.
                </p>
                <div className="flex flex-wrap gap-4 mb-8">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-[hsl(var(--secondary))]" />
                    <span className="text-sm font-medium">Singapore-based with deep SME experience</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-[hsl(var(--secondary))]" />
                    <span className="text-sm font-medium">Full in-house web, app, and AI expertise</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-[hsl(var(--secondary))]" />
                    <span className="text-sm font-medium">Real-time lead notifications</span>
                  </div>
                </div>
              </div>
            </FadeUp>
            
            <FadeUp delay={0.1}>
              <Card className="p-8 rounded-xl shadow-[0_12px_40px_rgba(16,24,40,0.08)] border-0 bg-gradient-to-br from-[#EAF7F5] to-white">
                <div className="text-center">
                  <div className="h-16 w-16 rounded-full bg-[hsl(var(--secondary))] flex items-center justify-center text-white mx-auto mb-4">
                    <TrendingUp className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Smart Digital Growth</h3>
                  <p className="text-[#475467] text-sm leading-relaxed">
                    From websites and e-commerce stores to WhatsApp automation and AI chat, CCC helps your business go digital fast — with optional EDG support for eligible projects.
                  </p>
                </div>
              </Card>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* Our Services */}
      <section className="py-16 sm:py-20 bg-gradient-to-br from-[#F9FAFB] to-white">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeUp>
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-semibold text-[hsl(var(--foreground))] mb-4">
                Our Services
              </h2>
              <p className="text-base text-[#475467] max-w-2xl mx-auto">
                Complete digital solutions designed to help your business grow and engage customers more effectively.
              </p>
            </div>
          </FadeUp>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <FadeUp key={service.id} delay={index * 0.1}>
                <Card className="p-8 rounded-xl hover:shadow-[0_12px_40px_rgba(16,24,40,0.08)] transition-shadow duration-200 border border-[#EAECF0] h-full">
                  <div className="h-12 w-12 rounded-lg bg-[hsl(var(--secondary))] flex items-center justify-center text-white mb-6">
                    <service.icon size={24} />
                  </div>
                  <h3 className="text-xl font-semibold mb-4">{service.title}</h3>
                  <p className="text-sm text-[#475467] mb-6 leading-relaxed">{service.description}</p>
                  <Button 
                    onClick={() => {
                      window.location.href = `/services-solutions#service-section-${service.id}`;
                    }}
                    variant="ghost" 
                    className="p-0 h-auto hover:bg-transparent text-white hover:text-white"
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

      {/* Our Process */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeUp>
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-semibold text-[hsl(var(--foreground))] mb-4">
                Our Process
              </h2>
              <p className="text-base text-[#475467] max-w-2xl mx-auto">
                Transparent workflow with milestone-based delivery for your peace of mind.
              </p>
            </div>
          </FadeUp>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {processSteps.map((step, index) => (
              <FadeUp key={index} delay={index * 0.1}>
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[hsl(var(--secondary))] text-white font-semibold text-xl mb-4">
                    {step.step}
                  </div>
                  <div className="h-10 w-10 rounded-lg bg-[hsl(var(--accent))] flex items-center justify-center text-[hsl(var(--primary))] mx-auto mb-4">
                    <step.icon size={20} />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                  <p className="text-sm text-[#475467]">{step.description}</p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* AI-Powered Support */}
      <section className="py-16 sm:py-20 bg-gradient-to-br from-[#EAF7F5] to-white">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <FadeUp>
              <div>
                <Badge className="mb-4 text-white font-medium" style={{ backgroundColor: '#293889' }} data-testid="ai-badge">
                  <Bot className="mr-1 h-3 w-3" /> AI-Powered
                </Badge>
                <h2 className="text-3xl sm:text-4xl font-semibold text-[hsl(var(--foreground))] mb-4">
                  Smart Digital Assistant
                </h2>
                <p className="text-base text-[#475467] mb-6">
                  Our AI Digital Consultant assists visitors and clients across website chat, WhatsApp automation, and email notifications.
                </p>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-[hsl(var(--secondary))] shrink-0 mt-0.5" />
                    <span className="text-sm">Collects project requirements automatically</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-[hsl(var(--secondary))] shrink-0 mt-0.5" />
                    <span className="text-sm">Provides instant pricing estimates</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-[hsl(var(--secondary))] shrink-0 mt-0.5" />
                    <span className="text-sm">Directs qualified leads to your team in real-time</span>
                  </li>
                </ul>
                <Button 
                  onClick={() => handleChatOpen('ai-section')}
                  className="bg-[#293889] hover:bg-[#1e2c6b] text-white font-medium"
                  data-testid="ai-section-cta-button"
                >
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Try Our AI Assistant
                </Button>
              </div>
            </FadeUp>
            
            <FadeUp delay={0.2}>
              <Card className="p-6 rounded-xl shadow-[0_12px_40px_rgba(16,24,40,0.08)] border-0 bg-white">
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-[hsl(var(--accent))] flex items-center justify-center">
                      <Globe className="h-6 w-6 text-[hsl(var(--primary))]" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Website Chat</h3>
                      <p className="text-[#475467] text-sm">Engage visitors instantly</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-[hsl(var(--accent))] flex items-center justify-center">
                      <MessageCircle className="h-6 w-6 text-[hsl(var(--primary))]" />
                    </div>
                    <div>
                      <h3 className="font-semibold">WhatsApp Automation</h3>
                      <p className="text-[#475467] text-sm">24/7 customer support</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-[hsl(var(--accent))] flex items-center justify-center">
                      <BarChart3 className="h-6 w-6 text-[hsl(var(--primary))]" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Lead Analytics</h3>
                      <p className="text-[#475467] text-sm">Real-time notifications</p>
                    </div>
                  </div>
                </div>
              </Card>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* Lead Form Section */}
      <section id="lead-form" className="py-16 sm:py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeUp>
            <div className="text-center mb-8">
              <h2 className="text-3xl sm:text-4xl font-semibold text-[hsl(var(--foreground))] mb-4">
                Start Your Digital Project
              </h2>
              <p className="text-base text-[#475467]">
                Tell us about your business goals and we'll recommend the perfect digital solution.
              </p>
            </div>
          </FadeUp>

          <FadeUp delay={0.1}>
            <Card className="p-8 rounded-xl shadow-[0_12px_40px_rgba(16,24,40,0.08)] border-0">
              {isFormSubmitted ? (
                <div className="text-center py-8">
                  <div className="h-16 w-16 rounded-full bg-[hsl(var(--secondary))] flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Project Request Received!</h3>
                  <p className="text-[#475467]">
                    Our team will review your requirements and contact you within 1 business day with recommendations and next steps.
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
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone (WhatsApp)</Label>
                      <Input 
                        id="phone" 
                        name="phone" 
                        placeholder="+65 9123 4567"
                        data-testid="lead-form-phone"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="projectType">Project Type *</Label>
                    <Select name="projectType" required>
                      <SelectTrigger data-testid="lead-form-project-type">
                        <SelectValue placeholder="What do you need help with?" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Website Development">Website Development</SelectItem>
                        <SelectItem value="E-commerce Platform">E-commerce Platform</SelectItem>
                        <SelectItem value="AI Chatbot">AI Chatbot</SelectItem>
                        <SelectItem value="WhatsApp Bot">WhatsApp Bot Integration</SelectItem>
                        <SelectItem value="CRM Integration">CRM & Analytics Integration</SelectItem>
                        <SelectItem value="Custom Portal">Custom Web Portal</SelectItem>
                        <SelectItem value="Complete Digital Transformation">Complete Digital Transformation</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="goal">Project Goals & Requirements *</Label>
                    <Textarea 
                      id="goal" 
                      name="goal" 
                      required 
                      placeholder="Tell us about your business and what you want to achieve with this project..."
                      className="min-h-[120px]"
                      data-testid="lead-form-goal"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <input 
                      type="checkbox" 
                      id="edgInterest" 
                      name="edgInterest" 
                      className="rounded border-gray-300"
                      data-testid="lead-form-edg-interest"
                    />
                    <Label htmlFor="edgInterest" className="text-sm font-normal">
                      ✅ I'm interested in learning about EDG funding eligibility (optional)
                    </Label>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-[#293889] hover:bg-[#1e2c6b] text-white font-medium"
                    disabled={isFormLoading}
                    data-testid="lead-form-submit"
                  >
                    {isFormLoading ? 'Submitting...' : 'Start My Project Request'}
                  </Button>
                </form>
              )}
            </Card>
          </FadeUp>
        </div>
      </section>

      {/* Optional EDG Support - Updated for Compliance */}
      <section className="py-16 sm:py-20 bg-gradient-to-br from-[#F9FAFB] to-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeUp>
            <Card className="p-8 rounded-xl shadow-[0_12px_40px_rgba(16,24,40,0.08)] border-0">
              <div className="grid lg:grid-cols-2 gap-8 items-center">
                <div>
                  <Badge className="mb-4 bg-[#12B76A] text-white" data-testid="edg-support-badge">
                    <Award className="mr-1 h-3 w-3" /> Potential Funding Support
                  </Badge>
                  <h2 className="text-2xl sm:text-3xl font-semibold text-[hsl(var(--foreground))] mb-4">
                    Potential EDG Support for Eligible Digital Projects
                  </h2>
                  <p className="text-base text-[#475467] mb-4">
                    Some companies may qualify for partial funding under Enterprise Singapore's Enterprise Development Grant (EDG).
                  </p>
                  <p className="text-base text-[#475467] mb-6">
                    CCC assists in aligning your digital transformation projects — such as AI automation, web systems, or process redesign — with EDG requirements, where applicable.
                  </p>
                  <div className="space-y-2 mb-6">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-[#12B76A]" />
                      <span className="text-sm">Transformation-focused project alignment</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-[#12B76A]" />
                      <span className="text-sm">Proposal documentation assistance</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-[#12B76A]" />
                      <span className="text-sm">Project scope advisory support</span>
                    </div>
                  </div>
                  <Button 
                    asChild
                    className="bg-[#12B76A] hover:bg-[#10A561] text-white mb-4"
                    data-testid="edg-eligibility-cta"
                  >
                    <Link to="/edg">Check EDG Eligibility (For Singapore SMEs)</Link>
                  </Button>
                  <p className="text-xs text-[#6B7280] leading-relaxed">
                    ⚠️ Note: EDG support is subject to Enterprise Singapore's approval. It generally applies to transformation-focused projects such as automation or AI-enabled workflows. Basic website creation alone typically does not qualify.
                  </p>
                </div>
                <div>
                  <div className="text-center">
                    <div className="h-20 w-20 rounded-full bg-[#12B76A] flex items-center justify-center text-white mx-auto mb-4">
                      <Award className="h-10 w-10" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Strategic Guidance</h3>
                    <p className="text-[#475467] text-sm mb-6">
                      Professional support for transformation-focused digital projects that may align with EDG requirements
                    </p>
                  </div>
                </div>
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
                onClick={handleStartProject}
                style={{ 
                  backgroundColor: '#293889',
                  color: 'white',
                  fontWeight: '500'
                }}
                className="hover:bg-[#1e2c6b] shadow-[0_6px_18px_rgba(41,56,137,0.22)]"
                data-testid="cta-primary-button"
              >
                <Rocket className="mr-2 h-4 w-4" />
                Start My Project
              </Button>
              <Button 
                onClick={() => handleChatOpen('cta')}
                variant="outline"
                className="border-[hsl(var(--border))]"
                data-testid="cta-secondary-button"
              >
                <MessageCircle className="mr-2 h-4 w-4" />
                Chat with AI Consultant <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </FadeUp>
        </div>
      </section>
    </div>
  );
}