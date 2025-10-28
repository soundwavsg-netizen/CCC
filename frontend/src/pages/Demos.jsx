import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import PageHeader from '../components/PageHeader';
import { 
  Play, 
  ExternalLink, 
  MessageCircle,
  GraduationCap,
  ShoppingCart,
  Users,
  CheckCircle2,
  ArrowRight,
  Target,
  Zap,
  BarChart3
} from 'lucide-react';
import { trackEvent } from '../utils/analytics';

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

export default function Demos() {
  useEffect(() => {
    // Analytics tracking
    trackEvent('view_demo_page', { page: 'hub' });
    
    // Set SEO
    document.title = "AI Chatbot Demos – Tuition & E-commerce | CCC Digital";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.content = "Explore live AI chatbots for tuition centres and e-commerce. See real flows and lead capture.";
    }
  }, []);

  const handleDemoClick = (demoType, source = 'hub') => {
    trackEvent('click_open_demo', { 
      vertical: demoType,
      source: source
    });
  };

  const handleContactClick = (source) => {
    trackEvent('click_contact_from_demo', { 
      source: source
    });
  };

  const demoCategories = [
    {
      id: 'tuition',
      title: 'Tuition / Training School Chatbot',
      description: 'AI assistant for education centers with course information, pricing, schedules, and student authentication.',
      image: 'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?auto=format&fit=crop&q=85&w=800&h=400',
      features: [
        'Student FAQs & course information',
        'Class schedules & tutor assignments', 
        'Fees & pricing calculations',
        'Enrollment & intake prompts',
        'Academic calendar integration',
        'Lead capture & parent contact'
      ],
      tech: ['OpenAI GPT', 'Context Memory', 'MongoDB', 'Authentication'],
      route: '/demo/tuition',
      color: 'from-[#667eea] to-[#764ba2]',
      icon: GraduationCap,
      status: 'Live with RMSS',
      company: 'Raymond\'s Math & Science Studio'
    },
    {
      id: 'math-analysis',
      title: 'Math Results Analysis System',
      description: 'Track student performance, analyze topic-wise strengths/weaknesses, and generate AI-powered revision plans.',
      image: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&q=85&w=800&h=400',
      features: [
        'CSV/Excel batch upload',
        'Manual result entry',
        'Topic-wise performance analytics',
        'Trend comparison (WA1→EOY)',
        'Weak topic identification',
        'Auto-generated revision plans'
      ],
      tech: ['Firebase', 'Chart.js', 'FastAPI', 'React'],
      route: '/demo/math-analysis',
      color: 'from-[#f093fb] to-[#f5576c]',
      icon: BarChart3,
      status: 'Live Demo',
      company: 'CCC Digital Education Tools'
    },
    {
      id: 'ecommerce',
      title: 'E-commerce Chatbot',
      description: 'AI customer support for online stores with product guidance, order assistance, and intelligent recommendations.',
      image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&q=85&w=800&h=400',
      features: [
        'Product Q&A & sizing guidance',
        'Order support & tracking',
        'Delivery & shipping info',
        'Bulk pricing calculations',
        'Custom packaging consultation',
        'Lead capture & business inquiries'
      ],
      tech: ['AI Multi-Agent', 'E-commerce Integration', 'FastAPI', 'Promotion Engine'],
      route: '/demo/ecommerce',
      color: 'from-[#4facfe] to-[#00f2fe]',
      icon: ShoppingCart,
      status: 'Live with M Supplies',
      company: 'M Supplies Premium Packaging'
    }
  ];

  return (
    <div className="flex flex-col" data-testid="demos-page">
      {/* Modern Demos Hero */}
      <PageHeader theme="ai">
        <Badge className="ai-badge mb-6">
          <Target className="mr-2 h-5 w-5" /> Live Demos
        </Badge>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6" style={{ fontFamily: 'Plus Jakarta Sans' }}>
          Live AI Chatbot Demos
        </h1>
        <p className="text-xl leading-relaxed opacity-90 mb-8">
          See how CCC deploys vertical AI chat for real businesses. Experience our working implementations with live data and interactions.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button 
              asChild
              className="btn-ai-primary text-white text-lg px-8 py-4"
              onClick={() => handleDemoClick('tuition', 'hero')}
            >
              <Link to="/demo/tuition?utm_source=ccc&utm_medium=demo&utm_campaign=showcase">
                <GraduationCap className="mr-2 h-5 w-5" />
                <span className="text-white">View Tuition Demo</span>
              </Link>
            </Button>
          </motion.div>
          
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button 
              asChild
              className="btn-ai-secondary text-white text-lg px-8 py-4"
              onClick={() => handleDemoClick('ecommerce', 'hero')}
            >
              <Link to="/demo/ecommerce?utm_source=ccc&utm_medium=demo&utm_campaign=showcase">
                <ShoppingCart className="mr-2 h-5 w-5" />
                <span className="text-white">View E-commerce Demo</span>
              </Link>
            </Button>
          </motion.div>
        </div>
      </PageHeader>

      {/* Demo Categories */}
      <section className="section-spacing bg-gradient-to-br from-white to-[#f8fafc]">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            {demoCategories.map((demo, index) => (
              <FadeUp key={demo.id} delay={index * 0.2}>
                <motion.div
                  className="ai-employee-card h-full"
                  whileHover={{ y: -8 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Card className="p-8 h-full border-0 bg-white/90 backdrop-blur-md relative overflow-hidden">
                    {/* Live Demo Badge */}
                    <div className="absolute top-4 right-4">
                      <Badge className="ai-badge text-sm">
                        <Zap className="mr-1 h-3 w-3" /> Live Demo
                      </Badge>
                    </div>
                    
                    {/* Demo Image */}
                    <div className="mb-6 relative overflow-hidden rounded-2xl">
                      <img 
                        src={demo.image}
                        alt={`${demo.title} preview`}
                        className="w-full h-48 object-cover"
                      />
                      <div className={`absolute inset-0 bg-gradient-to-br ${demo.color} opacity-80 flex items-center justify-center`}>
                        <demo.icon className="h-16 w-16 text-white" />
                      </div>
                    </div>

                    {/* Demo Content */}
                    <div className="mb-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div 
                          className={`h-12 w-12 rounded-2xl bg-gradient-to-br ${demo.color} flex items-center justify-center text-white`}
                        >
                          <demo.icon size={24} />
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-[hsl(var(--foreground))]" style={{ fontFamily: 'Plus Jakarta Sans' }}>
                            {demo.title}
                          </h3>
                          <p className="text-sm text-[#8B5CF6] font-medium">
                            {demo.status} • {demo.company}
                          </p>
                        </div>
                      </div>
                      
                      <p className="text-[#6B7280] leading-relaxed mb-6">
                        {demo.description}
                      </p>
                      
                      {/* Features */}
                      <div className="mb-6">
                        <h4 className="text-sm font-semibold text-[#374151] mb-3">Key Features:</h4>
                        <div className="grid grid-cols-2 gap-2">
                          {demo.features.map((feature, i) => (
                            <div key={i} className="flex items-start gap-2">
                              <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                              <span className="text-xs text-[#6B7280]">{feature}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      {/* Tech Stack */}
                      <div className="mb-6">
                        <h4 className="text-sm font-semibold text-[#374151] mb-3">Technologies:</h4>
                        <div className="flex flex-wrap gap-2">
                          {demo.tech.map((tech, i) => (
                            <Badge key={i} variant="outline" className="text-xs rounded-full">
                              {tech}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* CTA */}
                    <div className="mt-auto">
                      <Button 
                        asChild
                        className={`w-full bg-gradient-to-r ${demo.color} text-white font-medium mb-3`}
                        onClick={() => handleDemoClick(demo.id)}
                      >
                        <Link to={`${demo.route}?utm_source=ccc&utm_medium=demo&utm_campaign=showcase`}>
                          <Play className="mr-2 h-4 w-4" />
                          Open Demo
                        </Link>
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* Lead Capture Strip */}
      <section className="py-16 bg-gradient-to-r from-[#8B5CF6] to-[#EC4899] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <FadeUp>
            <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: 'Plus Jakarta Sans' }}>
              Want Something Like This on Your Site?
            </h2>
            <p className="text-xl text-white/90 mb-8">
              CCC Digital builds custom AI chatbots for any industry. Let's discuss your specific needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  asChild
                  className="bg-white text-[#8B5CF6] hover:bg-white/90 font-bold text-lg px-10 py-4"
                  onClick={() => handleContactClick('demo_hub')}
                >
                  <Link to="/contact?source=demo&utm_source=ccc&utm_medium=demo&utm_campaign=showcase">
                    <MessageCircle className="mr-3 h-5 w-5" />
                    Request Quote
                  </Link>
                </Button>
              </motion.div>
              
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  asChild
                  className="border-2 border-white/40 text-white hover:bg-white hover:text-[#8B5CF6] backdrop-blur-sm text-lg px-10 py-4"
                  onClick={() => {
                    trackEvent('click_whatsapp_from_demo', { source: 'demo_hub' });
                  }}
                >
                  <a 
                    href="https://wa.me/6589821301?text=Hi%20CCC%2C%20I%27d%20like%20a%20chatbot%20like%20this&utm_source=ccc&utm_medium=demo&utm_campaign=showcase"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <MessageCircle className="mr-3 h-5 w-5" />
                    WhatsApp Us
                  </a>
                </Button>
              </motion.div>
            </div>
            
            {/* Disclaimer */}
            <p className="text-sm text-white/70 mt-6">
              Demos run on sample data and limited flows. Production setups are customised.
            </p>
          </FadeUp>
        </div>
      </section>
    </div>
  );
}