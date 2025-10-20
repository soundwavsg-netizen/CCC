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
            style={{ backgroundColor: '#293889', color: 'white' }}
            className="hover:bg-[#1e2c6b] font-medium text-lg px-8 py-3"
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
              { name: 'AI Executive Assistant', description: 'Schedule meetings, reminders, draft emails', tools: ['Google Calendar', 'Gmail', 'Slack'], icon: Calendar, color: '#3B82F6' },
              { name: 'AI Project Manager', description: 'Tracks deliverables, deadlines, stand-ups', tools: ['Trello', 'Notion', 'Slack'], icon: Briefcase, color: '#10B981' },
              { name: 'AI Operations Assistant', description: 'Updates Sheets, monitors workflows', tools: ['Google Sheets', 'Notion'], icon: BarChart3, color: '#F59E0B' },
              { name: 'AI Customer Support Rep', description: 'Handles FAQ and ticket replies', tools: ['Docs DB', 'Email', 'Slack'], icon: MessageSquare, color: '#8B5CF6' },
              { name: 'AI Marketing Writer', description: 'Creates blogs and social captions', tools: ['Notion', 'Google Docs'], icon: FileText, color: '#EF4444' },
              { name: 'AI Digital Marketing Assistant', description: 'Plans & schedules posts, simple videos', tools: ['Facebook', 'Instagram', 'LinkedIn', 'Canva'], icon: TrendingUp, color: '#06B6D4' },
              { name: 'AI Trainer / Tutor', description: 'Creates lessons, quizzes, and feedback', tools: ['Google Docs', 'Notion'], icon: GraduationCap, color: '#84CC16' },
              { name: 'AI HR Assistant', description: 'Screens CVs, drafts job posts, reminders', tools: ['Google Sheets', 'Calendar'], icon: Users, color: '#F97316' },
              { name: 'AI Copy & Design Assistant', description: 'Creates visuals & ads', tools: ['Canva API', 'Pexels'], icon: Palette, color: '#EC4899' },
              { name: 'AI Data Analyst', description: 'Generates charts & reports', tools: ['Google Sheets', 'Charts API'], icon: BarChart3, color: '#6366F1' }
            ].map((employee, index) => (
              <Card key={index} className="p-6 rounded-xl hover:shadow-[0_12px_40px_rgba(16,24,40,0.08)] transition-all duration-300 border border-[#E5E7EB] h-full">
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
              </Card>
            ))}
          </div>
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