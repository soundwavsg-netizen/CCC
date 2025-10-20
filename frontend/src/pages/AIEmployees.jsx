import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import PageHeader from '../components/PageHeader';
import { 
  Bot, 
  Users, 
  Calendar,
  MessageSquare,
  MessageCircle,
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
      {/* Modern AI Employees Hero */}
      <PageHeader theme="ai">
        <Badge className="ai-badge mb-6">
          <Bot className="mr-2 h-5 w-5" /> C³ AI Employees Platform
        </Badge>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6" style={{ fontFamily: 'Plus Jakarta Sans' }}>
          Hire Your Next AI Employee
        </h1>
        <p className="text-xl leading-relaxed opacity-90 mb-8">
          A complete platform to train, deploy, and manage AI Employees for your business. 
          No coding required — just upload, train, and deploy intelligent digital staff.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            asChild
            className="btn-ai-primary text-white text-lg px-8 py-3"
            data-testid="launch-demo-cta"
          >
            <Link to="#pricing">
              <Play className="mr-2 h-5 w-5" />
              <span className="text-white">Launch Platform Demo</span>
            </Link>
          </Button>
          <Button 
            asChild
            className="border-white/30 text-white hover:bg-white hover:text-[#293889] text-lg px-8 py-3 backdrop-blur-sm rounded-2xl"
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
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-[hsl(var(--foreground))] mb-4">
              Choose from 10 Ready AI Employee Templates
            </h2>
            <p className="text-base text-[#475467] max-w-2xl mx-auto">
              Each AI Employee comes pre-trained with specialized skills and can be customized to your business needs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {[
              { 
                name: 'AI Executive Assistant', 
                cuteName: 'Assi 🤖', 
                description: 'Schedule meetings, reminders, draft emails', 
                tools: ['Google Calendar', 'Gmail', 'Slack'], 
                robotColor: '#3B82F6',
                gradient: 'from-[#3B82F6] to-[#1D4ED8]'
              },
              { 
                name: 'AI Project Manager', 
                cuteName: 'Proji 🚀', 
                description: 'Tracks deliverables, deadlines, stand-ups', 
                tools: ['Trello', 'Notion', 'Slack'], 
                robotColor: '#10B981',
                gradient: 'from-[#10B981] to-[#059669]'
              },
              { 
                name: 'AI Operations Assistant', 
                cuteName: 'Opie ⚡', 
                description: 'Updates Sheets, monitors workflows', 
                tools: ['Google Sheets', 'Notion'], 
                robotColor: '#F59E0B',
                gradient: 'from-[#F59E0B] to-[#D97706]'
              },
              { 
                name: 'AI Customer Support Rep', 
                cuteName: 'Supie 💬', 
                description: 'Handles FAQ and ticket replies', 
                tools: ['Docs DB', 'Email', 'Slack'], 
                robotColor: '#8B5CF6',
                gradient: 'from-[#8B5CF6] to-[#7C3AED]'
              },
              { 
                name: 'AI Marketing Writer', 
                cuteName: 'Writey ✍️', 
                description: 'Creates blogs and social captions', 
                tools: ['Notion', 'Google Docs'], 
                robotColor: '#EF4444',
                gradient: 'from-[#EF4444] to-[#DC2626]'
              },
              { 
                name: 'AI Digital Marketing Assistant', 
                cuteName: 'Markie 📈', 
                description: 'Plans & schedules posts, simple videos', 
                tools: ['Facebook', 'Instagram', 'LinkedIn', 'Canva'], 
                robotColor: '#06B6D4',
                gradient: 'from-[#06B6D4] to-[#0891B2]'
              },
              { 
                name: 'AI Trainer / Tutor', 
                cuteName: 'Tutie 🎓', 
                description: 'Creates lessons, quizzes, and feedback', 
                tools: ['Google Docs', 'Notion'], 
                robotColor: '#84CC16',
                gradient: 'from-[#84CC16] to-[#65A30D]'
              },
              { 
                name: 'AI HR Assistant', 
                cuteName: 'Hrie 👥', 
                description: 'Screens CVs, drafts job posts, reminders', 
                tools: ['Google Sheets', 'Calendar'], 
                robotColor: '#F97316',
                gradient: 'from-[#F97316] to-[#EA580C]'
              },
              { 
                name: 'AI Copy & Design Assistant', 
                cuteName: 'Dezzie 🎨', 
                description: 'Creates visuals & ads', 
                tools: ['Canva API', 'Pexels'], 
                robotColor: '#EC4899',
                gradient: 'from-[#EC4899] to-[#DB2777]'
              },
              { 
                name: 'AI Data Analyst', 
                cuteName: 'Datie 📊', 
                description: 'Generates charts & reports', 
                tools: ['Google Sheets', 'Charts API'], 
                robotColor: '#6366F1',
                gradient: 'from-[#6366F1] to-[#4F46E5]'
              }
            ].map((employee, index) => (
              <div key={index} className="interactive-card ai-card h-full">
                <Card className="p-6 border-0 bg-white/90 backdrop-blur-md h-full">
                  {/* Cute Animated Robot */}
                  <div className="text-center mb-6">
                    <div 
                      className={`h-20 w-20 rounded-full bg-gradient-to-br ${employee.gradient} flex items-center justify-center text-white mx-auto mb-3 ai-breathe relative overflow-hidden`}
                    >
                      {/* Robot Face */}
                      <div className="relative">
                        {/* Robot Head */}
                        <div className="w-8 h-8 bg-white/20 rounded-lg relative">
                          {/* Eyes */}
                          <div className="absolute top-1 left-1 w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
                          <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                          {/* Smile */}
                          <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-3 h-1 border-b-2 border-white rounded-full"></div>
                        </div>
                        {/* Antenna */}
                        <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-0.5 h-2 bg-white/60 rounded-full"></div>
                        <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-white/80 rounded-full animate-ping"></div>
                      </div>
                      
                      {/* Shimmer Effect */}
                      <div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                        style={{
                          animation: `shimmer 3s ease-in-out infinite ${index * 0.5}s`
                        }}
                      />
                    </div>
                    
                    {/* Cute Name */}
                    <h4 className="text-sm font-bold text-[#8B5CF6] mb-1" style={{ fontFamily: 'Plus Jakarta Sans' }}>
                      {employee.cuteName}
                    </h4>
                  </div>
                  
                  <h3 className="text-lg font-bold mb-2" style={{ fontFamily: 'Plus Jakarta Sans' }}>{employee.name}</h3>
                  <p className="text-sm text-[#6B7280] mb-4">{employee.description}</p>
                  
                  <div className="mb-4">
                    <h4 className="text-xs font-semibold text-[#374151] mb-2">Core Tools:</h4>
                    <div className="flex flex-wrap gap-1">
                      {employee.tools.map((tool, i) => (
                        <Badge key={i} variant="outline" className="text-xs rounded-full">
                          {tool}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-20 bg-[#293889] text-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
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
              <Link to="/contact">
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
        </div>
      </section>
    </div>
  );
}