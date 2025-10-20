import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import PageHeader from '../components/PageHeader';
import { 
  Bot, 
  Users, 
  Calendar,
  MessageSquare,
  TrendingUp,
  FileText,
  Briefcase,
  GraduationCap,
  BarChart3,
  Palette,
  CheckCircle2,
  ArrowRight,
  Play,
  Sparkles
} from 'lucide-react';

export default function AIEmployees() {
  return (
    <div className="flex flex-col" data-testid="ai-employees-page">
      {/* Logo Header */}
      <PageHeader>
        <Badge className="mb-4 bg-[#293889] text-white" data-testid="ai-employees-badge">
          <Bot className="mr-1 h-3 w-3" /> C³ AI Employees Platform
        </Badge>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-[hsl(var(--foreground))] mb-6">
          Hire Your Next AI Employee
        </h1>
        <p className="text-lg text-[#475467] leading-relaxed mb-8">
          A complete platform to train, deploy, and manage AI Employees for your business. 
          No coding required — just upload, train, and deploy intelligent digital staff.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            asChild
            className="bg-[#293889] hover:bg-[#1e2c6b] text-white font-medium text-lg px-8 py-3"
            data-testid="launch-demo-cta"
          >
            <Link to="#pricing">
              <Play className="mr-2 h-5 w-5" />
              Launch Platform Demo
            </Link>
          </Button>
          <Button 
            asChild
            variant="outline"
            className="border-[hsl(var(--border))] text-lg px-8 py-3"
            data-testid="early-access-cta"
          >
            <Link to="/contact">
              <Sparkles className="mr-2 h-5 w-5" />
              Get Early Access
            </Link>
          </Button>
        </div>
      </PageHeader>

      {/* AI Employee Templates Section */}
      <section id="templates" className="py-16 sm:py-20 bg-white">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeUp>
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-[hsl(var(--foreground))] mb-4">
                Choose from 10 Ready AI Employee Templates
              </h2>
              <p className="text-base text-[#475467] max-w-2xl mx-auto">
                Each AI Employee comes pre-trained with specialized skills and can be customized to your business needs.
              </p>
            </div>
          </FadeUp>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {aiEmployeeTemplates.map((employee, index) => (
              <FadeUp key={employee.id} delay={index * 0.1}>
                <Card className="p-6 rounded-xl hover:shadow-[0_12px_40px_rgba(16,24,40,0.08)] transition-all duration-300 border border-[#E5E7EB] h-full">
                  <div 
                    className="h-12 w-12 rounded-lg flex items-center justify-center text-white mb-4"
                    style={{ backgroundColor: employee.color }}
                  >
                    <employee.icon size={24} />
                  </div>
                  
                  <h3 className="text-lg font-bold mb-2">{employee.name}</h3>
                  <p className="text-sm text-[#6B7280] mb-4">{employee.description}</p>
                  
                  <div className="mb-4">
                    <h4 className="text-xs font-semibold text-[#374151] mb-2">Core Tools:</h4>
                    <div className="flex flex-wrap gap-1">
                      {employee.tools.map((tool, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {tool}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="mt-auto">
                    <h4 className="text-xs font-semibold text-[#374151] mb-2">Key Features:</h4>
                    <ul className="space-y-1">
                      {employee.features.slice(0, 3).map((feature, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <CheckCircle2 className="h-3 w-3 text-green-500" />
                          <span className="text-xs text-[#6B7280]">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </Card>
              </FadeUp>
            ))}
          </div>

          <FadeUp>
            <div className="text-center">
              <p className="text-[#6B7280] mb-4">Ready to hire your AI workforce?</p>
              <Button 
                asChild
                className="bg-[#E91F2C] hover:bg-[#d1171e] text-white font-medium"
              >
                <Link to="#pricing">
                  <Users className="mr-2 h-4 w-4" />
                  View Pricing Plans
                </Link>
              </Button>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* Training & Management Interface */}
      <section className="py-16 sm:py-20 bg-gradient-to-br from-[#F9FAFB] to-white">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <FadeUp>
              <div>
                <Badge className="mb-4 bg-[#8B5CF6] text-white">
                  <Bot className="mr-1 h-3 w-3" /> Training System
                </Badge>
                <h2 className="text-3xl sm:text-4xl font-bold text-[hsl(var(--foreground))] mb-4">
                  Intuitive Training Dashboard
                </h2>
                <p className="text-base text-[#475467] mb-6 leading-relaxed">
                  Train your AI Employees like you would onboard human staff. Upload documents, set goals, and watch them learn your business processes.
                </p>
                
                <div className="space-y-4 mb-8">
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-lg bg-[#8B5CF6] flex items-center justify-center text-white shrink-0">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Upload & Train</h3>
                      <p className="text-sm text-[#6B7280]">Upload PDFs, docs, and data. AI learns your processes automatically.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-lg bg-[#8B5CF6] flex items-center justify-center text-white shrink-0">
                      <Settings className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Personality Tuning</h3>
                      <p className="text-sm text-[#6B7280]">Customize communication style and decision-making patterns.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-lg bg-[#8B5CF6] flex items-center justify-center text-white shrink-0">
                      <Zap className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Deploy & Monitor</h3>
                      <p className="text-sm text-[#6B7280]">Deploy instantly and monitor performance with real-time analytics.</p>
                    </div>
                  </div>
                </div>
              </div>
            </FadeUp>
            
            <FadeUp delay={0.2}>
              <Card className="p-6 rounded-xl shadow-[0_12px_40px_rgba(16,24,40,0.08)] border-0 bg-gradient-to-br from-[#8B5CF6]/10 to-white">
                <h3 className="text-lg font-bold mb-4">Training Dashboard Preview</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-blue-500 flex items-center justify-center text-white">
                        <Calendar className="h-4 w-4" />
                      </div>
                      <span className="font-medium text-sm">Executive Assistant</span>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Training 95%</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-purple-500 flex items-center justify-center text-white">
                        <MessageSquare className="h-4 w-4" />
                      </div>
                      <span className="font-medium text-sm">Support Rep</span>
                    </div>
                    <Badge className="bg-blue-100 text-blue-800">Ready</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-green-500 flex items-center justify-center text-white">
                        <Briefcase className="h-4 w-4" />
                      </div>
                      <span className="font-medium text-sm">Project Manager</span>
                    </div>
                    <Badge className="bg-yellow-100 text-yellow-800">Training 60%</Badge>
                  </div>
                </div>
                
                <div className="mt-4 p-3 bg-gradient-to-r from-[#8B5CF6] to-[#A78BFA] rounded-lg text-white text-center">
                  <p className="text-sm font-medium">Credits Remaining: 3,247</p>
                </div>
              </Card>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* Custom AI Creation */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <FadeUp>
            <Badge className="mb-4 bg-[#E91F2C] text-white">
              <Star className="mr-1 h-3 w-3" /> Enterprise Exclusive
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-[hsl(var(--foreground))] mb-4">
              Custom AI Employee Creation
            </h2>
            <p className="text-base text-[#475467] leading-relaxed mb-8">
              Need something unique? Our team builds custom AI employees tailored specifically to your organization — 
              like EduAI for education or VocaFlow Coach for workflow automation.
            </p>
            
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <Card className="p-6 rounded-xl shadow-[0_12px_40px_rgba(16,24,40,0.08)] border-0 text-left">
                <h3 className="text-lg font-bold mb-3">What We Build For You:</h3>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Fully customized AI personality</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Your brand colors and domain</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Trained on your specific data</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Custom integrations and workflows</span>
                  </li>
                </ul>
              </Card>
              
              <Card className="p-6 rounded-xl shadow-[0_12px_40px_rgba(16,24,40,0.08)] border-0 text-left">
                <h3 className="text-lg font-bold mb-3">Success Examples:</h3>
                <div className="space-y-3">
                  <div className="p-3 bg-[#EAF7F5] rounded-lg">
                    <h4 className="font-semibold text-sm">EduAI for ABC Academy</h4>
                    <p className="text-xs text-[#6B7280]">AI Academic Advisor trained on lesson materials</p>
                  </div>
                  <div className="p-3 bg-[#FEF3C7] rounded-lg">
                    <h4 className="font-semibold text-sm">VocaFlow Coach</h4>
                    <p className="text-xs text-[#6B7280]">Workflow automation specialist</p>
                  </div>
                </div>
              </Card>
            </div>
            
            <Button 
              asChild
              className="bg-[#E91F2C] hover:bg-[#d1171e] text-white font-medium text-lg px-8 py-3"
              data-testid="enterprise-consultation-cta"
            >
              <Link to="/contact">
                <MessageSquare className="mr-2 h-5 w-5" />
                Book Enterprise Consultation
              </Link>
            </Button>
          </FadeUp>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-16 sm:py-20 bg-gradient-to-br from-[#F9FAFB] to-white">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeUp>
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-[hsl(var(--foreground))] mb-4">
                Choose Your AI Workforce Plan
              </h2>
              <p className="text-base text-[#475467] max-w-2xl mx-auto">
                Start with a free trial, then scale your AI team as your business grows.
              </p>
            </div>
          </FadeUp>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {pricingPlans.map((plan, index) => (
              <FadeUp key={plan.id} delay={index * 0.1}>
                <Card className={`p-6 rounded-xl transition-all duration-300 border-2 h-full ${
                  plan.popular 
                    ? 'border-[#E91F2C] shadow-[0_20px_50px_rgba(233,31,44,0.15)] ring-2 ring-[#E91F2C]/20' 
                    : 'border-[#E5E7EB] shadow-[0_12px_40px_rgba(16,24,40,0.08)] hover:border-[#293889]'
                }`}>
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-[#E91F2C] text-white">
                        <Star className="mr-1 h-3 w-3" /> Most Popular
                      </Badge>
                    </div>
                  )}
                  
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                    <div className="mb-2">
                      <span className="text-3xl font-bold text-[hsl(var(--foreground))]">{plan.price}</span>
                      {plan.duration && <span className="text-[#6B7280]">/{plan.duration}</span>}
                    </div>
                    <p className="text-sm text-[#6B7280]">{plan.useCase}</p>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-sm">
                      <span>AI Employees:</span>
                      <span className="font-medium">{plan.employees}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Monthly Credits:</span>
                      <span className="font-medium">{plan.credits}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Integrations:</span>
                      <span className="font-medium">{plan.integrations}</span>
                    </div>
                  </div>

                  <ul className="space-y-2 mb-6">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        <span className="text-sm text-[#6B7280]">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button 
                    className={`w-full font-medium ${
                      plan.popular 
                        ? 'bg-[#E91F2C] hover:bg-[#d1171e] text-white' 
                        : 'bg-[#293889] hover:bg-[#1e2c6b] text-white'
                    }`}
                    data-testid={`select-plan-${plan.id}`}
                  >
                    {plan.cta}
                  </Button>
                </Card>
              </FadeUp>
            ))}
          </div>

          <FadeUp delay={0.4}>
            <div className="text-center mt-12">
              <p className="text-sm text-[#6B7280] mb-4">
                💳 Credits renew monthly • $20 = 1,000 additional credits • Enterprise gets unlimited
              </p>
              <Button 
                asChild
                variant="outline" 
                className="border-[hsl(var(--border))]"
              >
                <Link to="/contact">
                  Need Enterprise? Contact Us <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-20 bg-[#293889] text-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <FadeUp>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Ready to Hire Your First AI Employee?
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Join forward-thinking companies already scaling with AI workforce.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                asChild
                size="lg"
                className="bg-white text-[#293889] hover:bg-white/90 font-medium text-lg px-8 py-4"
              >
                <Link to="#pricing">
                  Try Free for 14 Days
                </Link>
              </Button>
              <Button 
                asChild
                size="lg"
                variant="outline"
                className="border-white/30 text-white hover:bg-white hover:text-[#293889] text-lg px-8 py-4"
              >
                <Link to="/contact">
                  Talk to Our Team <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </FadeUp>
        </div>
      </section>
    </div>
  );
}