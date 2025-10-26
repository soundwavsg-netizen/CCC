import React, { useState } from 'react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
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
  Award
} from 'lucide-react';

const EnhancedAILibrary = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [activeCategory, setActiveCategory] = useState('generic');

  const trainingCategories = {
    generic: {
      title: "🔧 GENERIC AI Training",
      subtitle: "Universal patterns that work across all industries and clients",
      color: "blue",
      description: "Core conversation patterns, context memory, formatting - the foundation for all chatbots",
      successRate: "100% (Tuition Centre Proven)"
    },
    specialized: {
      title: "🎯 SPECIALIZED Training", 
      subtitle: "Domain-specific expertise for industries",
      color: "green",
      description: "Industry-specific conversation flows, terminology, and business logic patterns",
      successRate: "100% Education (Tuition Centre)"
    },
    businessSpecific: {
      title: "🏢 BUSINESS-SPECIFIC Training",
      subtitle: "Client-specific customizations and unique requirements", 
      color: "purple",
      description: "Custom implementations, unique business rules, and client-specific conversation patterns",
      successRate: "Tuition Centre + CCC Digital"
    },
    platform: {
      title: "📱 PLATFORM Training",
      subtitle: "Interface-specific optimization for web, WhatsApp, mobile",
      color: "orange", 
      description: "Platform-optimized conversation patterns for web widgets, WhatsApp, and mobile interfaces",
      successRate: "Both Platforms Active"
    },
    security: {
      title: "🛡️ SECURITY Training",
      subtitle: "Authentication, data protection, and compliance patterns",
      color: "red",
      description: "Security implementations, authentication flows, and data protection patterns", 
      successRate: "Tuition Centre Demo Ready"
    },
    performance: {
      title: "⚡ PERFORMANCE Training",
      subtitle: "Speed, efficiency, and user experience optimization",
      color: "yellow",
      description: "Performance optimization patterns, UX improvements, and efficiency enhancements",
      successRate: "Sub-2-Second Responses"
    }
  };

  const successMetrics = {
    tuition: {
      dataAccuracy: "100% - all 11 PDFs integrated correctly", 
      pricingAccuracy: "100% - P2 $261.60, P6 $357.52, J2 $444.72 exact",
      tutorMapping: "50+ tutors mapped to subjects and locations",
      calendarIntegration: "Complete 2026 holiday and fee settlement calendar",
      contextMemory: "100% conversation flow tracking",
      informationDumping: "0% - progressive disclosure implemented"
    },
    cccDigital: {
      businessRecognition: "E-commerce, retail, professional services recognition",
      promotionalIntegration: "Year-End campaign with package recommendations", 
      platformIntegration: "Website chat + WhatsApp + email notifications",
      edgCompliance: "Enterprise Singapore guidelines compliance"
    }
  };

  const pricingFramework = {
    servicePackages: [
      {
        tier: "BASIC",
        setup: "$3K-5K",
        monthly: "$300-500",
        features: ["Static FAQ responses", "Basic conversation flow", "Simple embedding"],
        bestFor: "Small businesses, simple inquiries"
      },
      {
        tier: "INTERMEDIATE", 
        setup: "$8K-12K",
        monthly: "$800-1,200",
        features: ["AI-powered responses (GPT-4o-mini)", "Context memory", "PDF knowledge base", "Professional UI"],
        bestFor: "Tuition Centre level - education centers, professional services",
        highlight: true
      },
      {
        tier: "ADVANCED",
        setup: "$12K-18K", 
        monthly: "$1,200-2,000",
        features: ["Everything + Authentication", "Personal data access", "Database integration", "Admin dashboard"],
        bestFor: "Healthcare, fintech, enterprise"
      }
    ],
    whatsappAddons: [
      {
        type: "Baileys (Simple)",
        setup: "+$2K-4K",
        monthly: "+$300-500", 
        pros: ["Cost-effective", "Quick setup", "Same AI backend"],
        cons: ["Risk of suspension", "Unofficial integration"],
        bestFor: "Testing, small volume, budget clients"
      },
      {
        type: "Business API (Official)",
        setup: "+$4K-8K",
        monthly: "+$500-1K",
        pros: ["Official API", "Enterprise reliability", "Rich media", "Analytics"],
        cons: ["Higher cost", "Meta approval required"],
        bestFor: "High volume, enterprise, regulated industries"
      }
    ]
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100" data-testid="ai-library-page">
      {/* Header */}
      <header className="bg-white shadow-md border-b-4 border-purple-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center gap-4">
              <img 
                src="https://customer-assets.emergentagent.com/job_smartbiz-portal/artifacts/p67oqb1l_Screenshot%202025-10-11%20at%204.38.29%20PM.png" 
                alt="CCC Logo" 
                className="h-8 w-auto object-contain"
              />
              <div>
                <h1 className="text-3xl font-bold text-purple-600">CCC Digital AI Library</h1>
                <p className="text-sm text-gray-800 font-medium">Comprehensive AI Training Framework & Industry Templates</p>
              </div>
            </div>
            <Button asChild className="bg-purple-600 hover:bg-purple-700 text-white">
              <a href="/">← Back to Main</a>
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Comprehensive AI Training <span className="text-purple-600">Knowledge Base</span>
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-4xl mx-auto">
            Complete AI training framework with 6 specialized categories. All patterns developed and proven
            through successful client implementations. Never rebuild the same solutions twice.
          </p>

          {/* Tuition Centre Success Story */}
          <Card className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-8 mb-8">
            <h3 className="text-2xl font-bold mb-4">🏆 Framework Success Story - Tuition Centre Implementation</h3>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h4 className="font-bold mb-3">✅ Problems Solved:</h4>
                <ul className="space-y-2 text-sm">
                  <li>• Context memory failures (AI forgetting previous questions)</li>
                  <li>• Information dumping (overwhelming users with all details)</li>
                  <li>• Poor mobile formatting (long paragraphs, no line breaks)</li>
                  <li>• Rigid conversations (not flexible or helpful)</li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold mb-3">📊 Results Achieved:</h4>
                <ul className="space-y-2 text-sm">
                  <li>• 100% context awareness across conversation turns</li>
                  <li>• Progressive disclosure with smart clarification</li>
                  <li>• Professional mobile-optimized responses</li>
                  <li>• Flexible, helpful conversation experience</li>
                </ul>
              </div>
            </div>
            <div className="mt-6 text-center">
              <div className="text-3xl font-bold">Development Time Reduced by 60-70%</div>
              <div className="text-green-100">All patterns documented and reusable</div>
            </div>
          </Card>
        </div>

        {/* Training Categories Overview */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {Object.entries(trainingCategories).map(([key, category]) => (
            <Card key={key} className="p-6 border-t-4 border-purple-500 hover:shadow-lg transition-shadow">
              <div className="text-center mb-4">
                <h3 className="text-lg font-bold text-gray-900">{category.title}</h3>
                <p className="text-sm text-gray-600">{category.subtitle}</p>
              </div>
              <p className="text-sm text-gray-700 mb-4">{category.description}</p>
              <div className="text-center">
                <Badge className="bg-green-100 text-green-800 mb-3">
                  {category.successRate}
                </Badge>
                <div>
                  <Button
                    onClick={() => {setActiveTab('training'); setActiveCategory(key);}}
                    className="bg-purple-600 text-white hover:bg-purple-700 text-sm"
                  >
                    Explore {category.title.split(' ')[1]}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* ROI Calculator */}
        <Card className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-8 mb-8">
          <h3 className="text-2xl font-bold mb-6">💰 ROI Calculator - Tuition Centre Success Example</h3>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h4 className="font-bold mb-3">Investment (Tuition Centre Complete Package):</h4>
              <ul className="space-y-2 text-sm">
                <li>• Intermediate Widget: $10,000 setup</li>
                <li>• Authentication System: $5,000 setup</li>
                <li>• WhatsApp Business: $6,000 setup</li>
                <li>• Total Setup: $21,000</li>
                <li>• Monthly Management: $2,700</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-3">Return (Tuition Centre Monthly Benefits):</h4>
              <ul className="space-y-2 text-sm">
                <li>• Staff time saved: $2,000-3,000</li>
                <li>• Increased enrollments: $2,000-4,000</li>
                <li>• Better conversion: $1,500-2,500</li>
                <li>• Reduced phone costs: $200-400</li>
                <li>• Total Monthly Return: $5,700-9,900</li>
                <li><strong>• Net Monthly Benefit: $3,000-7,200</strong></li>
              </ul>
            </div>
          </div>
          <div className="mt-6 text-center">
            <div className="text-3xl font-bold">ROI: 150-300% annually</div>
            <div className="text-blue-100">Investment pays back in 3-7 months</div>
          </div>
        </Card>

        {/* Quick Access Links */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">🚀 Quick Start for New Projects</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span className="text-sm">Copy CCC base conversation rules</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span className="text-sm">Apply industry-specific patterns</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span className="text-sm">Implement proven conversation fixes</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span className="text-sm">Test with Tuition Centre success patterns</span>
              </li>
            </ul>
          </Card>
          
          <Card className="p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">📊 Proven Success Metrics</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Context Memory Fixed:</span>
                <Badge className="bg-green-100 text-green-800">100%</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Information Dumping:</span>
                <Badge className="bg-green-100 text-green-800">0%</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Development Time Saved:</span>
                <Badge className="bg-blue-100 text-blue-800">60-70%</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Client Satisfaction:</span>
                <Badge className="bg-purple-100 text-purple-800">RMSS Approved</Badge>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EnhancedAILibrary;