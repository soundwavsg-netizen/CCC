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

      {/* AI Employee Templates Section - Final 10 Lineup */}
      <section id="templates" className="section-spacing bg-gradient-to-br from-white to-[#f8fafc]">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl sm:text-5xl font-bold text-[hsl(var(--foreground))] mb-6 tracking-tight" style={{ fontFamily: 'Plus Jakarta Sans' }}>
              Meet Your C³ AI Employees
            </h2>
            <p className="text-xl text-[#6B7280] max-w-3xl mx-auto leading-relaxed">
              Your all-in-one digital workforce — ready to train, deploy, and grow with you.
            </p>
          </div>

          {/* Desktop: 2 rows × 5 cards, Mobile: 1 per row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-16">
            {[
              { 
                role: 'Project Manager', 
                name: 'Pam', 
                color: 'robot-pam',
                icon: '📋',
                tagline: 'Keeps every project on time and on track.',
                tools: ['Trello', 'Notion', 'Slack'],
                gradientFrom: '#87CEEB',
                gradientTo: '#4682B4'
              },
              { 
                role: 'Executive Assistant', 
                name: 'Ela', 
                color: 'robot-ela',
                icon: '🗓️',
                tagline: 'Plans, reminds, and streamlines your day.',
                tools: ['Google Calendar', 'Gmail', 'Slack'],
                gradientFrom: '#DDA0DD',
                gradientTo: '#9370DB'
              },
              { 
                role: 'Operations Assistant', 
                name: 'Ora', 
                color: 'robot-ora',
                icon: '⚙️',
                tagline: 'Runs daily ops smoothly behind the scenes.',
                tools: ['Google Sheets', 'Notion'],
                gradientFrom: '#7FFFD4',
                gradientTo: '#20B2AA'
              },
              { 
                role: 'HR Assistant', 
                name: 'Hurla', 
                color: 'robot-hurla',
                icon: '🧑‍🤝‍🧑',
                tagline: 'Understands people and simplifies HR.',
                tools: ['Google Sheets', 'Calendar'],
                gradientFrom: '#FFDAB9',
                gradientTo: '#FF7F50'
              },
              { 
                role: 'Sales Executive', 
                name: 'Sile', 
                color: 'robot-sile',
                icon: '💬',
                tagline: 'Drives leads and closes deals.',
                tools: ['CRM', 'Email', 'WhatsApp'],
                gradientFrom: '#FF7F7F',
                gradientTo: '#DC143C'
              },
              { 
                role: 'Marketing Assistant', 
                name: 'Miles', 
                color: 'robot-miles',
                icon: '🚀',
                tagline: 'Builds smart campaigns that convert.',
                tools: ['Facebook', 'Instagram', 'Canva', 'Notion'],
                expandedFeatures: [
                  'Plan and schedule posts across channels',
                  'Draft copy for blogs, emails, ads, and captions', 
                  'Generate campaign ideas and content calendars',
                  'Create A/B headline variants and CTA suggestions',
                  'Summarize analytics and recommend next actions'
                ],
                gradientFrom: '#DA70D6',
                gradientTo: '#8B008B'
              },
              { 
                role: 'Customer Support', 
                name: 'Cais', 
                color: 'robot-cais',
                icon: '🎧',
                tagline: 'Answers instantly with a human touch.',
                tools: ['Docs DB', 'Email', 'Slack'],
                gradientFrom: '#40E0D0',
                gradientTo: '#008B8B'
              },
              { 
                role: 'Data Analyst', 
                name: 'Dena', 
                color: 'robot-dena',
                icon: '📊',
                tagline: 'Finds insight in every metric.',
                tools: ['Google Sheets', 'Charts API'],
                gradientFrom: '#5F9EA0',
                gradientTo: '#2F4F4F'
              },
              { 
                role: 'Finance Assistant', 
                name: 'Fina', 
                color: 'robot-fina',
                icon: '💰',
                tagline: 'Keeps your books balanced.',
                tools: ['QuickBooks', 'Google Sheets'],
                gradientFrom: '#98FB98',
                gradientTo: '#32CD32'
              },
              { 
                role: 'Tutor / Trainer', 
                name: 'Torr', 
                color: 'robot-torr',
                icon: '🎓',
                tagline: 'Explains clearly and adapts to learners.',
                tools: ['Google Docs', 'Notion'],
                gradientFrom: '#FFD700',
                gradientTo: '#FFA500'
              }
            ].map((employee, index) => (
              <motion.div 
                key={index} 
                className="ai-employee-card robot-hover p-6 h-full"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                onViewportEnter={() => {
                  // Analytics tracking
                  if (window.dataLayer) {
                    window.dataLayer.push({
                      event: 'template_card_view',
                      role: employee.role,
                      name: employee.name
                    });
                  }
                }}
              >
                {/* Cuter Animated Robot Character */}
                <div className="text-center mb-6">
                  <div 
                    className={`robot-avatar h-24 w-24 rounded-full flex items-center justify-center mx-auto mb-4 robot-breathe relative overflow-hidden`}
                    style={{
                      background: `linear-gradient(135deg, ${employee.gradientFrom}, ${employee.gradientTo})`
                    }}
                  >
                    {/* Enhanced Robot Face */}
                    <div className="relative">
                      {/* Robot Head with Personality */}
                      <div className="w-10 h-10 bg-white/25 rounded-xl relative backdrop-blur-sm">
                        {/* Animated Eyes */}
                        <div className="robot-eyes">
                          <div className="robot-eye w-2 h-2 bg-white rounded-full"></div>
                          <div className="robot-eye w-2 h-2 bg-white rounded-full" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                        
                        {/* Happy Mouth */}
                        <div className="robot-mouth"></div>
                        
                        {/* Cheeks */}
                        <div className="absolute top-3 left-1 w-1 h-1 bg-white/50 rounded-full animate-pulse"></div>
                        <div className="absolute top-3 right-1 w-1 h-1 bg-white/50 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                      </div>
                      
                      {/* Animated Antenna */}
                      <div className="robot-antenna"></div>
                      <div className="robot-antenna-tip antenna-ping"></div>
                      
                      {/* Robot Body Indicator */}
                      <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 text-white text-xs">
                        {employee.icon}
                      </div>
                    </div>
                    
                    {/* Shimmer Effect */}
                    <div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                      style={{
                        animation: `shimmer 4s ease-in-out infinite ${index * 0.7}s`
                      }}
                    />
                  </div>
                  
                  {/* Role First, Name Second Hierarchy */}
                  <h3 className="role-title">{employee.role}</h3>
                  <h4 className="ai-name">{employee.name}</h4>
                </div>
                
                {/* Tagline */}
                <p className="tagline text-center mb-6">"{employee.tagline}"</p>
                
                {/* Core Tools */}
                <div className="mb-6">
                  <h4 className="text-xs font-semibold text-[#374151] mb-3 text-center">Core Tools:</h4>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {employee.tools.map((tool, i) => (
                      <Badge key={i} variant="outline" className="text-xs rounded-full bg-white/60 backdrop-blur-sm">
                        {tool}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Learn More Button */}
                <div className="text-center mt-auto">
                  <Button 
                    onClick={() => {
                      // Analytics tracking
                      if (window.dataLayer) {
                        window.dataLayer.push({
                          event: 'template_card_click',
                          role: employee.role,
                          name: employee.name
                        });
                      }
                      // Navigate to detail (for now, show more info)
                      window.location.href = `/ai-employees#${employee.name.toLowerCase()}`;
                    }}
                    variant="ghost" 
                    className="text-[#8B5CF6] hover:text-[#7C3AED] font-medium text-sm group"
                  >
                    Learn more 
                    <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>

          {/* CTA Section */}
          <div className="text-center">
            <div className="space-y-6">
              <p className="text-lg text-[#6B7280]">Ready to hire your AI workforce?</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  asChild
                  className="btn-ai-primary text-white font-medium text-lg px-10 py-4"
                  onClick={() => {
                    if (window.dataLayer) {
                      window.dataLayer.push({
                        event: 'cta_click',
                        placement: 'grid',
                        action: 'explore_templates'
                      });
                    }
                  }}
                >
                  <Link to="#pricing">
                    <Bot className="mr-2 h-5 w-5" />
                    <span className="text-white">Explore Templates</span>
                  </Link>
                </Button>
                <Button 
                  asChild
                  variant="outline"
                  className="border-[#8B5CF6] text-[#8B5CF6] hover:bg-[#8B5CF6] hover:text-white font-medium text-lg px-10 py-4"
                  onClick={() => {
                    if (window.dataLayer) {
                      window.dataLayer.push({
                        event: 'cta_click',
                        placement: 'grid', 
                        action: 'book_demo'
                      });
                    }
                  }}
                >
                  <Link to="/contact?utm_source=site&utm_medium=cta&utm_campaign=c3_launch">
                    <MessageCircle className="mr-2 h-5 w-5" />
                    Book a 15-min Demo
                  </Link>
                </Button>
              </div>
            </div>
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