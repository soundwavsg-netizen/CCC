import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import PageHeader from '../components/PageHeader';
import { Dialog, DialogContent, DialogTrigger } from '../components/ui/dialog';
import { ExternalLink, BarChart3 } from 'lucide-react';

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

export default function Portfolio() {
  const [filter, setFilter] = useState('All');

  const projects = [
    {
      id: 1,
      name: 'M Supplies Premium Packaging',
      category: 'E-Commerce',
      description: 'Complete e-commerce platform with AI chat and promotion system',
      longDescription: 'A comprehensive e-commerce solution for Singapore\'s premium packaging supplier featuring AI-powered customer support, intelligent promotion engine, multi-brand support (Rainbow Palace, M Supplies, Mossom), user profiles, and admin dashboard.',
      image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&q=85&w=800',
      technologies: ['React', 'FastAPI', 'MongoDB', 'AI Chat', 'SendGrid', 'Promotion Engine'],
      features: [
        'AI customer support with context awareness',
        'Multi-brand product management',
        'Smart promotion and gift tier system',
        'User profiles with address management',
        'Weight-based shipping calculations',
        'Real-time admin dashboard'
      ],
      demoLink: '/demo/ecommerce',
      isLiveDemo: true,
      liveUrl: 'https://www.msupplies.sg'
    },
    {
      id: 2,
      name: 'VocaFlow',
      category: 'AI',
      description: 'AI-powered workflow automation system for business processes',
      longDescription: 'An intelligent workflow automation platform that uses AI to streamline business operations. Features include document processing, task automation, and intelligent routing based on business rules and machine learning.',
      image: 'https://images.unsplash.com/photo-1551395722-0ac9e89cee11?auto=format&fit=crop&q=85&w=800',
      technologies: ['Python', 'OpenAI GPT', 'LangChain', 'FastAPI', 'React'],
      features: [
        'Automated document processing',
        'Intelligent task routing',
        'AI-powered decision making',
        'Integration with existing tools',
        'Real-time monitoring dashboard'
      ]
    },
    {
      id: 3,
      name: 'AISY Math',
      category: 'AI',
      description: 'Educational AI assistant for mathematics learning',
      longDescription: 'An AI-powered educational platform that provides personalized math tutoring. Uses natural language processing to understand student questions and provides step-by-step explanations with adaptive learning paths.',
      image: 'https://images.pexels.com/photos/14321795/pexels-photo-14321795.jpeg?auto=compress&w=800',
      technologies: ['React', 'OpenAI GPT', 'FastAPI', 'MongoDB', 'WebSocket'],
      features: [
        'Personalized learning paths',
        'Step-by-step problem solving',
        'Interactive practice exercises',
        'Progress tracking and analytics',
        'Real-time tutoring assistance'
      ]
    },
    {
      id: 4,
      name: 'Corporate Website Redesign',
      category: 'Web & App',
      description: 'Modern responsive website for Singapore-based consultancy',
      longDescription: 'Complete website redesign featuring modern UI/UX, responsive design, SEO optimization, and content management system. Built with performance and user experience as top priorities.',
      image: 'https://images.pexels.com/photos/18091875/pexels-photo-18091875.jpeg?auto=compress&w=800',
      technologies: ['React', 'Next.js', 'Tailwind CSS', 'Vercel', 'Contentful CMS'],
      features: [
        'Responsive design for all devices',
        'SEO optimized content',
        'Fast loading performance',
        'Content management system',
        'Analytics integration'
      ]
    },
    {
      id: 5,
      name: 'Project 62',
      category: 'Health & Fitness',
      description: 'Fitness & nutrition platform with meal-prep subscription and delivery system',
      longDescription: 'A comprehensive health and fitness platform built around the 60-20-20 philosophy (60% diet, 20% consistency, 20% movement). Features meal-prep subscriptions with tiered pricing, weekly delivery scheduling, customer portal for plan management, and admin dashboard for order tracking. Integrated with Stripe for payments and SendGrid for automated communications.',
      image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&q=85&w=800',
      technologies: ['React', 'FastAPI', 'Firebase', 'Stripe', 'SendGrid', 'JWT Auth'],
      features: [
        'Meal-prep subscription with dynamic pricing',
        'Weekly delivery scheduling system',
        'Customer authentication and portal',
        'Admin dashboard with order management',
        'Automated email campaigns',
        'Lead capture with PDF delivery',
        'Payment processing with Stripe',
        'Real-time order tracking'
      ],
      demoLink: '/project62',
      isLiveDemo: true
    },
    {
      id: 6,
      name: 'Booking Management System',
      category: 'Web & App',
      description: 'Real-time booking and scheduling system for service businesses',
      longDescription: 'A flexible booking management system with calendar integration, automated reminders, payment processing, and customer management. Designed for service-based businesses to streamline their operations.',
      image: 'https://images.unsplash.com/photo-1746430132022-9a9d5f84ebec?auto=format&fit=crop&q=85&w=800',
      technologies: ['React', 'FastAPI', 'MongoDB', 'Stripe', 'Twilio'],
      features: [
        'Real-time availability calendar',
        'Automated email/SMS reminders',
        'Online payment processing',
        'Customer database management',
        'Analytics and reporting'
      ]
    },
    {
      id: 7,
      name: 'RMSS AI Assistant (Live Demo)',
      category: 'AI',
      description: 'Interactive tuition centre AI chatbot with live RMSS integration',
      longDescription: 'A sophisticated AI assistant for education centers featuring complete course information, pricing, schedules, and student authentication. This live demo connects to our actual RMSS implementation.',
      image: 'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?auto=format&fit=crop&q=85&w=800',
      technologies: ['React', 'OpenAI GPT', 'FastAPI', 'MongoDB', 'Authentication'],
      features: [
        'Complete course and pricing database',
        'Context-aware conversation flow', 
        'Multi-location coordination',
        'Academic calendar integration',
        'Student authentication system',
        'Mobile-optimized responses'
      ],
      demoLink: '/demo/tuition',
      isLiveDemo: true
    }
  ];

  const categories = ['All', 'Web & App', 'AI', 'E-Commerce', 'Training/Grants'];

  const filteredProjects = filter === 'All' 
    ? projects 
    : projects.filter(project => project.category === filter);

  return (
    <div className="flex flex-col" data-testid="portfolio-page">
      {/* Modern Portfolio Hero */}
      <PageHeader theme="portfolio">
        <Badge className="ai-badge mb-6">
          <BarChart3 className="mr-2 h-5 w-5" /> Our Work
        </Badge>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6" style={{ fontFamily: 'Plus Jakarta Sans' }}>
          Project Portfolio
        </h1>
        <p className="text-xl leading-relaxed opacity-90">
          Discover how we've helped Singapore SMEs transform their businesses through innovative digital solutions.
        </p>
      </PageHeader>

      {/* Filter & Projects */}
      <section className="py-16 sm:py-20 bg-white" data-testid="portfolio-projects">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Filter Tabs */}
          <FadeUp>
            <div className="flex flex-wrap justify-center gap-2 mb-12">
              {categories.map((category) => (
                <Button
                  key={category}
                  onClick={() => setFilter(category)}
                  variant={filter === category ? 'default' : 'outline'}
                  className={filter === category 
                    ? 'bg-[hsl(var(--secondary))] hover:bg-[#0AA099] text-white' 
                    : 'border-[hsl(var(--border))]'}
                  data-testid={`filter-${category.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  {category}
                </Button>
              ))}
            </div>
          </FadeUp>

          {/* Projects Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProjects.map((project, index) => (
              <FadeUp key={project.id} delay={index * 0.1}>
                <Dialog>
                  <DialogTrigger asChild>
                    <Card 
                      className="group overflow-hidden rounded-xl cursor-pointer border-0 shadow-[0_6px_24px_rgba(16,24,40,0.06)] hover:shadow-[0_12px_40px_rgba(16,24,40,0.10)] transition-all duration-200"
                      data-testid="portfolio-item"
                    >
                      <div className="overflow-hidden">
                        <img 
                          src={project.image}
                          alt={project.name}
                          className="w-full h-56 object-cover group-hover:scale-[1.02] transition-transform duration-300" 
                        />
                      </div>
                      <div className="p-6">
                        <Badge 
                          className="mb-2 bg-[hsl(var(--accent))] text-[hsl(var(--primary))] hover:bg-[hsl(var(--accent))]"
                          data-testid="project-category-badge"
                        >
                          {project.category}
                        </Badge>
                        <h3 className="font-semibold text-lg mb-2">{project.name}</h3>
                        <p className="text-sm text-[#475467]">{project.description}</p>
                      </div>
                    </Card>
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <div className="space-y-6">
                      <img 
                        src={project.image}
                        alt={project.name}
                        className="w-full h-auto rounded-lg" 
                      />
                      <div>
                        <Badge className="mb-2">{project.category}</Badge>
                        <h2 className="text-2xl font-semibold mb-4">{project.name}</h2>
                        <p className="text-base text-[#475467] mb-6">{project.longDescription}</p>

                        <h3 className="font-semibold text-lg mb-3">Key Features:</h3>
                        <ul className="space-y-2 mb-6">
                          {project.features.map((feature, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-[#475467]">
                              <span className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--secondary))] mt-2 shrink-0" />
                              {feature}
                            </li>
                          ))}
                        </ul>

                        <h3 className="font-semibold text-lg mb-3">Technologies Used:</h3>
                        <div className="flex flex-wrap gap-2 mb-6">
                          {project.technologies.map((tech) => (
                            <Badge 
                              key={tech} 
                              variant="outline"
                              className="border-[hsl(var(--border))]"
                            >
                              {tech}
                            </Badge>
                          ))}
                        </div>
                        
                        {/* Live Demo CTA */}
                        {project.isLiveDemo && (
                          <div className="mt-6 p-6 bg-gradient-to-r from-[#667eea] to-[#764ba2] rounded-xl text-white text-center">
                            <h4 className="font-bold text-lg mb-2">🚀 Try the Live Demo!</h4>
                            <p className="text-white/90 mb-4">
                              {project.name.includes('RMSS') 
                                ? 'Experience this AI assistant in action with real RMSS data.'
                                : 'Explore the complete e-commerce platform with real products and AI chat.'
                              }
                            </p>
                            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                              <Button 
                                asChild 
                                className="bg-white text-[#667eea] hover:bg-white/90 font-bold"
                              >
                                <a href={project.demoLink}>
                                  Launch Interactive Demo
                                </a>
                              </Button>
                              {project.liveUrl && (
                                <Button 
                                  asChild 
                                  variant="outline"
                                  className="border-white/30 text-white hover:bg-white hover:text-[#667eea]"
                                >
                                  <a href={project.liveUrl} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="mr-2 h-4 w-4" />
                                    Visit Live Site
                                  </a>
                                </Button>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-20 bg-gradient-to-br from-[#EAF7F5] to-white">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeUp>
            <div className="text-center">
              <h2 className="text-3xl sm:text-4xl font-semibold text-[hsl(var(--foreground))] mb-4">
                Let's Build Something Great Together
              </h2>
              <p className="text-lg text-[#475467] mb-8 max-w-2xl mx-auto">
                Ready to start your digital transformation journey? Contact us to discuss your project.
              </p>
              <Button 
                asChild
                className="bg-[hsl(var(--secondary))] hover:bg-[#0AA099] text-white shadow-[0_6px_18px_rgba(15,181,174,0.22)]"
                data-testid="portfolio-contact-cta"
              >
                <a href="/contact">Get in Touch <ExternalLink className="ml-2 h-4 w-4" /></a>
              </Button>
            </div>
          </FadeUp>
        </div>
      </section>
    </div>
  );
}