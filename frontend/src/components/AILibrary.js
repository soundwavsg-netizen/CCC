// CCC Digital Enhanced AI Library Component
// Complete training framework with 6 categories and proven success patterns

import React, { useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  Bot, 
  BookOpen, 
  Building, 
  Smartphone, 
  Shield, 
  Zap,
  CheckCircle2,
  Star,
  TrendingUp,
  Award,
  Users,
  Target,
  Code,
  Database,
  MessageSquare
} from 'lucide-react';

const AILibrary = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [activeCategory, setActiveCategory] = useState('generic');

  // Success metrics from multiple implementations
  const successStories = {
    rmss: {
      name: "RMSS (Education)",
      status: "✅ 100% SUCCESS",
      achievements: [
        "Context memory: 100% fixed (was major user complaint)",
        "Information dumping: 0% (progressive disclosure implemented)", 
        "Data accuracy: 100% (all 11 PDFs integrated correctly)",
        "Mobile formatting: Professional with emojis and line breaks",
        "ROI: 150-300% annually, 3-7 month payback"
      ],
      metrics: {
        development_time: "35 hours (down from 115)",
        user_satisfaction: "RMSS management approved",
        technical_performance: "Sub-2-second responses"
      }
    },
    ccc_digital: {
      name: "CCC Digital (Consultancy)", 
      status: "✅ PRODUCTION READY",
      achievements: [
        "Business recognition: Smart e-commerce, retail, education detection",
        "Multi-platform: Website + WhatsApp + email integration",
        "Promotional campaigns: Year-End AI Automation with packages",
        "EDG compliance: Enterprise Singapore guidelines adherence",
        "Modern UX: Motion.ai-inspired design with cute robots"
      ],
      metrics: {
        conversion_rate: "Enhanced lead capture with full transcripts",
        user_experience: "Professional yet playful AI assistant",
        business_impact: "Commercial-first with EDG as optional"
      }
    },
    msupplies: {
      name: "M Supplies (E-commerce)",
      status: "✅ LIVE DEMO READY",
      achievements: [
        "Product intelligence: Complete polymailer catalog knowledge",
        "Business solutions: Bulk pricing, VIP programs, custom branding",
        "Multi-brand support: Rainbow Palace, M Supplies, Mossom",
        "Shipping expertise: Singapore & Malaysia delivery calculations",
        "AI customer support: Context-aware e-commerce assistance"
      ],
      metrics: {
        product_coverage: "100% catalog with pricing and specifications",
        business_intelligence: "Bulk pricing and VIP program automation",
        geographic_coverage: "Singapore + Malaysia shipping calculations"
      }
    }
  };

  const trainingCategories = {
    generic: {
      title: "🔧 GENERIC AI Training",
      subtitle: "Universal patterns that work across ALL industries",
      color: "blue",
      description: "Core conversation patterns, context memory, formatting - the foundation for all chatbots",
      successRate: "100% (Multi-Client Proven)",
      implementations: ["RMSS", "CCC Digital", "M Supplies"]
    },
    specialized: {
      title: "🎯 SPECIALIZED Training", 
      subtitle: "Domain-specific expertise for different industries",
      color: "green",
      description: "Industry-specific conversation flows, terminology, and business logic patterns",
      successRate: "100% Education, 95% E-commerce",
      implementations: ["Education (RMSS)", "E-commerce (M Supplies)", "Digital Services (CCC)"]
    },
    businessSpecific: {
      title: "🏢 BUSINESS-SPECIFIC Training",
      subtitle: "Client-specific customizations and unique requirements", 
      color: "purple",
      description: "Custom implementations, unique business rules, and client-specific conversation patterns",
      successRate: "RMSS + CCC + M Supplies",
      implementations: ["Singapore Education", "Digital Consultancy", "Premium Packaging"]
    },
    platform: {
      title: "📱 PLATFORM Training",
      subtitle: "Interface-specific optimization for web, WhatsApp, mobile",
      color: "orange", 
      description: "Platform-optimized conversation patterns for web widgets, WhatsApp, and mobile interfaces",
      successRate: "All Platforms Active",
      implementations: ["Website Widget", "WhatsApp Business", "Mobile Responsive"]
    },
    security: {
      title: "🛡️ SECURITY Training",
      subtitle: "Authentication, data protection, and compliance patterns",
      color: "red",
      description: "Security implementations, authentication flows, and data protection patterns", 
      successRate: "RMSS Demo Ready",
      implementations: ["JWT Authentication", "OTP Verification", "PDPA Compliance"]
    },
    performance: {
      title: "⚡ PERFORMANCE Training",
      subtitle: "Speed, efficiency, and user experience optimization",
      color: "yellow",
      description: "Performance optimization patterns, UX improvements, and efficiency enhancements",
      successRate: "Sub-2-Second Responses",
      implementations: ["Context Caching", "Response Optimization", "Mobile UX"]
    }
  };

  const quickStartTemplates = {
    education: {
      name: "Education Template (RMSS Proven)",
      description: "Complete education center solution with course management",
      features: ["Level/subject/location coordination", "Accurate pricing calculations", "Academic calendar integration", "Student authentication"],
      developmentTime: "20-35 hours",
      successRate: "100%",
      pricing: "$8K-12K setup + $800-1,200/month"
    },
    ecommerce: {
      name: "E-commerce Template (M Supplies Ready)", 
      description: "Product knowledge, pricing intelligence, delivery support",
      features: ["Product catalog integration", "Bulk pricing intelligence", "Shipping calculations", "Business solutions"],
      developmentTime: "25-40 hours", 
      successRate: "95%",
      pricing: "$6K-18K setup + $600-1,500/month"
    },
    digital_services: {
      name: "Digital Services Template (CCC Proven)",
      description: "Consultancy and service business solution", 
      features: ["Service recognition", "Package recommendations", "Promotional integration", "Lead capture"],
      developmentTime: "15-30 hours",
      successRate: "100%",
      pricing: "$3K-15K setup + $300-1,200/month"
    }
  };

  const frameworkBenefits = [
    {
      icon: Target,
      title: "Proven Success Patterns",
      description: "Every pattern tested and refined through real client implementations",
      metric: "100% Success Rate"
    },
    {
      icon: Zap,
      title: "60-70% Faster Development", 
      description: "Pre-built conversation flows and business logic reduce build time",
      metric: "20-35 hours vs 75-115 hours"
    },
    {
      icon: Shield,
      title: "Enterprise-Ready Security",
      description: "Authentication, data protection, and compliance patterns included",
      metric: "PDPA + JWT Ready"
    },
    {
      icon: TrendingUp,
      title: "ROI Optimization",
      description: "Proven pricing strategies and business models from successful implementations", 
      metric: "150-300% Annual ROI"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100" data-testid="ai-library-component">
      {/* Header */}
      <header className="bg-white shadow-lg border-b-4 border-purple-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <Bot className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-purple-600" style={{ fontFamily: 'Plus Jakarta Sans' }}>CCC Digital AI Library</h1>
                <p className="text-sm text-gray-600 font-medium">Comprehensive AI Training Framework & Industry Templates</p>
              </div>
            </div>
            <Button asChild className="bg-purple-600 hover:bg-purple-700 text-white">
              <a href="/">← Back to Home</a>
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <Badge className="ai-badge mb-6 text-lg px-6 py-3">
            <Award className="mr-2 h-5 w-5" /> v3.0 Enhanced
          </Badge>
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6" style={{ fontFamily: 'Plus Jakarta Sans' }}>
            Comprehensive AI Training <span className="text-purple-600">Knowledge Base</span>
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-4xl mx-auto">
            Complete AI training framework with 6 specialized categories. All patterns developed and proven
            through successful client implementations including RMSS, CCC Digital, and M Supplies.
          </p>

          {/* Success Stories Grid */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {Object.entries(successStories).map(([key, story]) => (
              <Card key={key} className="p-6 border-l-4 border-green-500 bg-green-50">
                <h3 className="font-bold text-lg text-green-800 mb-2">{story.name}</h3>
                <Badge className="bg-green-600 text-white mb-4">{story.status}</Badge>
                <ul className="text-sm text-green-700 space-y-1">
                  {story.achievements.slice(0, 3).map((achievement, i) => (
                    <li key={i}>• {achievement}</li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        </div>

        {/* Framework Benefits */}
        <div className="grid md:grid-cols-4 gap-6 mb-16">
          {frameworkBenefits.map((benefit, index) => (
            <Card key={index} className="p-6 text-center hover:shadow-lg transition-shadow">
              <div className="h-12 w-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <benefit.icon className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">{benefit.title}</h3>
              <p className="text-sm text-gray-600 mb-3">{benefit.description}</p>
              <Badge variant="outline" className="text-xs">{benefit.metric}</Badge>
            </Card>
          ))}
        </div>

        {/* Training Categories */}
        <div className="mb-12">
          <h3 className="text-3xl font-bold text-gray-900 text-center mb-8" style={{ fontFamily: 'Plus Jakarta Sans' }}>
            6 AI Training Categories
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            {Object.entries(trainingCategories).map(([key, category]) => (
              <Card key={key} className="p-6 border-t-4 border-purple-500 hover:shadow-lg transition-shadow">
                <div className="text-center mb-4">
                  <h4 className="text-lg font-bold text-gray-900">{category.title}</h4>
                  <p className="text-sm text-gray-600">{category.subtitle}</p>
                </div>
                <p className="text-sm text-gray-700 mb-4">{category.description}</p>
                
                <div className="space-y-2 mb-4">
                  <Badge className="bg-green-100 text-green-800 text-xs">
                    {category.successRate}
                  </Badge>
                  <div className="text-xs text-gray-500">
                    <strong>Proven with:</strong> {category.implementations.join(', ')}
                  </div>
                </div>
                
                <Button
                  onClick={() => {setActiveTab('training'); setActiveCategory(key);}}
                  className="w-full bg-purple-600 text-white hover:bg-purple-700 text-sm"
                >
                  Explore {category.title.split(' ')[1]}
                </Button>
              </Card>
            ))}
          </div>
        </div>

        {/* Quick Start Templates */}
        <div className="mb-12">
          <h3 className="text-3xl font-bold text-gray-900 text-center mb-8" style={{ fontFamily: 'Plus Jakarta Sans' }}>
            Ready-to-Use Templates
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            {Object.entries(quickStartTemplates).map(([key, template]) => (
              <Card key={key} className="p-6 hover:shadow-lg transition-shadow">
                <h4 className="text-xl font-bold text-gray-900 mb-3">{template.name}</h4>
                <p className="text-gray-600 mb-4">{template.description}</p>
                
                <div className="space-y-3 mb-6">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="font-medium">Development:</span><br/>
                      <span className="text-gray-600">{template.developmentTime}</span>
                    </div>
                    <div>
                      <span className="font-medium">Success Rate:</span><br/>
                      <span className="text-green-600 font-bold">{template.successRate}</span>
                    </div>
                  </div>
                  
                  <div className="text-sm">
                    <span className="font-medium">Investment:</span><br/>
                    <span className="text-purple-600">{template.pricing}</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h5 className="font-semibold text-sm">Key Features:</h5>
                  <ul className="text-xs text-gray-600 space-y-1">
                    {template.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-1">
                        <CheckCircle2 className="h-3 w-3 text-green-500 mt-0.5 shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* ROI Calculator */}
        <Card className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-8 mb-8">
          <h3 className="text-3xl font-bold mb-6 text-center" style={{ fontFamily: 'Plus Jakarta Sans' }}>
            📊 Proven ROI Calculator
          </h3>
          <div className="grid md:grid-cols-3 gap-8">
            {Object.entries(successStories).map(([key, story]) => (
              <div key={key} className="text-center">
                <h4 className="font-bold text-lg mb-3">{story.name}</h4>
                <div className="bg-white/20 rounded-lg p-4 backdrop-blur-sm">
                  {Object.entries(story.metrics).map(([metric, value]) => (
                    <div key={metric} className="mb-2">
                      <div className="text-xs text-green-200 capitalize">{metric.replace('_', ' ')}</div>
                      <div className="font-semibold text-sm">{value}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-6">
            <div className="text-2xl font-bold">Average ROI: 200-400% annually</div>
            <div className="text-green-100">Investment pays back in 3-8 months across all implementations</div>
          </div>
        </Card>

        {/* Implementation Guide */}
        <Card className="p-8 bg-gradient-to-br from-gray-50 to-purple-50">
          <h3 className="text-3xl font-bold text-gray-900 mb-6 text-center" style={{ fontFamily: 'Plus Jakarta Sans' }}>
            🚀 Implementation Framework
          </h3>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h4 className="text-xl font-bold text-gray-900 mb-4">Phase 1: Foundation (Week 1-2)</h4>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Copy CCC base conversation rules</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Implement context memory system</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Set up progressive disclosure patterns</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Apply professional formatting standards</span>
                </li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-xl font-bold text-gray-900 mb-4">Phase 2: Customization (Week 3-4)</h4>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-blue-500" />
                  <span className="text-sm">Adapt industry-specific patterns</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-blue-500" />
                  <span className="text-sm">Integrate client data and pricing</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-blue-500" />
                  <span className="text-sm">Customize branding and contact info</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-blue-500" />
                  <span className="text-sm">Set up authentication if needed</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="mt-8 p-6 bg-white rounded-lg border border-purple-200">
            <h5 className="font-bold text-gray-900 mb-3">🔑 Critical Success Factors:</h5>
            <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-700">
              <div className="space-y-1">
                <div>✅ Context memory prevents user frustration</div>
                <div>✅ Progressive disclosure eliminates information dumping</div>
                <div>✅ Mobile formatting critical for WhatsApp readability</div>
              </div>
              <div className="space-y-1">
                <div>✅ Business recognition enables targeted responses</div>
                <div>✅ Professional positioning builds trust</div>
                <div>✅ Analytics integration measures performance</div>
              </div>
            </div>
          </div>
        </Card>

        {/* Contact Integration */}
        <div className="text-center mt-12">
          <Card className="p-8 bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
            <h3 className="text-2xl font-bold mb-4" style={{ fontFamily: 'Plus Jakarta Sans' }}>Ready to Implement?</h3>
            <p className="text-lg mb-6">Use this proven framework for your next AI chatbot project</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild className="bg-white text-purple-600 hover:bg-white/90 font-bold">
                <a href="/contact">Discuss AI Project</a>
              </Button>
              <Button asChild variant="outline" className="border-white text-white hover:bg-white hover:text-purple-600">
                <a href="/demos">See Live Demos</a>
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AILibrary;