import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Target, Eye, Users, TrendingUp, Award, Shield } from 'lucide-react';

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

export default function About() {
  const values = [
    {
      icon: Target,
      title: 'Results-Driven',
      description: 'We focus on delivering measurable outcomes that drive business growth.'
    },
    {
      icon: Users,
      title: 'Client-Centric',
      description: 'Your success is our success. We work closely with you every step of the way.'
    },
    {
      icon: TrendingUp,
      title: 'Innovation-Focused',
      description: 'We stay ahead of technology trends to provide cutting-edge solutions.'
    },
    {
      icon: Shield,
      title: 'Trusted Partner',
      description: 'Built on transparency, reliability, and long-term relationships.'
    }
  ];

  return (
    <div className="flex flex-col" data-testid="about-page">
      {/* Hero Section */}
      <section className="py-16 sm:py-20 lg:py-28 bg-gradient-to-br from-[#EAF7F5] via-white to-[#EAF7F5]">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeUp>
            <div className="max-w-3xl mx-auto text-center">
              <Badge className="mb-4 bg-[hsl(var(--accent))] text-[hsl(var(--primary))] hover:bg-[hsl(var(--accent))]" data-testid="about-badge">
                About CCC
              </Badge>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-[hsl(var(--foreground))] mb-6">
                Your Digital Transformation Partner
              </h1>
              <p className="text-lg text-[#475467] leading-relaxed">
                Since 2012, Cognition & Competence Consultancy has been helping Singapore SMEs navigate the digital landscape with confidence and success.
              </p>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* Company Background */}
      <section className="py-16 sm:py-20 bg-white" data-testid="company-background">
        <div className="max-w-screen-lg mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            <FadeUp>
              <div>
                <h2 className="text-3xl sm:text-4xl font-semibold text-[hsl(var(--foreground))] mb-6">
                  Who We Are
                </h2>
                <div className="space-y-4 text-base text-[#475467] leading-relaxed">
                  <p>
                    Cognition & Competence Consultancy (CCC) is a Singapore-based digital transformation agency specializing in helping SMEs modernize through technology and AI.
                  </p>
                  <p>
                    We design and build websites, mobile apps, and intelligent systems — from e-commerce and booking platforms to AI-driven customer support. Our team combines technical expertise with business acumen to deliver solutions that truly make a difference.
                  </p>
                  <p>
                    CCC also assists clients in applying for Enterprise Singapore's EDG support, guiding them from consultation to deployment. Whether you're launching a new site, upgrading your digital infrastructure, or implementing AI automation, CCC delivers end-to-end digital solutions built for results.
                  </p>
                </div>
              </div>
            </FadeUp>
            
            <FadeUp delay={0.1}>
              <Card className="p-8 rounded-xl shadow-[0_12px_40px_rgba(16,24,40,0.08)] border-0 space-y-6">
                <div>
                  <h3 className="font-semibold text-xl mb-2">Company Details</h3>
                  <div className="space-y-2 text-sm text-[#475467]">
                    <p><span className="font-medium text-[hsl(var(--foreground))]">Registered Name:</span> Cognition & Competence Consultancy Pte Ltd</p>
                    <p><span className="font-medium text-[hsl(var(--foreground))]">UEN:</span> 201208916K</p>
                    <p><span className="font-medium text-[hsl(var(--foreground))]">Founded:</span> 2012</p>
                    <p><span className="font-medium text-[hsl(var(--foreground))]">Location:</span> Singapore</p>
                  </div>
                </div>
                <div className="border-t pt-6">
                  <h3 className="font-semibold text-xl mb-2">Contact Information</h3>
                  <div className="space-y-2 text-sm text-[#475467]">
                    <p><span className="font-medium text-[hsl(var(--foreground))]">Email:</span> glor-yeo@hotmail.com</p>
                    <p><span className="font-medium text-[hsl(var(--foreground))]">Phone:</span> 8982 1301</p>
                  </div>
                </div>
              </Card>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 sm:py-20 bg-gradient-to-br from-[#EAF7F5] to-white">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8">
            <FadeUp>
              <Card className="p-8 rounded-xl shadow-[0_12px_40px_rgba(16,24,40,0.08)] border-0 bg-white h-full">
                <div className="h-12 w-12 rounded-lg bg-[hsl(var(--accent))] flex items-center justify-center text-[hsl(var(--primary))] mb-6">
                  <Target size={24} />
                </div>
                <h3 className="text-2xl font-semibold mb-4">Our Mission</h3>
                <p className="text-base text-[#475467] leading-relaxed">
                  To empower Singapore SMEs with accessible, innovative digital solutions that drive growth, efficiency, and competitive advantage in an increasingly digital economy.
                </p>
              </Card>
            </FadeUp>
            
            <FadeUp delay={0.1}>
              <Card className="p-8 rounded-xl shadow-[0_12px_40px_rgba(16,24,40,0.08)] border-0 bg-white h-full">
                <div className="h-12 w-12 rounded-lg bg-[hsl(var(--accent))] flex items-center justify-center text-[hsl(var(--primary))] mb-6">
                  <Eye size={24} />
                </div>
                <h3 className="text-2xl font-semibold mb-4">Our Vision</h3>
                <p className="text-base text-[#475467] leading-relaxed">
                  To be the trusted digital transformation partner for SMEs across Singapore, recognized for delivering exceptional results and making advanced technology accessible to businesses of all sizes.
                </p>
              </Card>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-16 sm:py-20 bg-white" data-testid="values-section">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeUp>
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-semibold text-[hsl(var(--foreground))] mb-4">
                Our Core Values
              </h2>
              <p className="text-base text-[#475467] max-w-2xl mx-auto">
                The principles that guide everything we do
              </p>
            </div>
          </FadeUp>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <FadeUp key={value.title} delay={index * 0.1}>
                <Card 
                  className="p-6 rounded-xl hover:shadow-[0_12px_40px_rgba(16,24,40,0.08)] transition-shadow duration-200 border border-[#EAECF0] h-full"
                  data-testid="value-card"
                >
                  <div className="h-10 w-10 rounded-lg bg-[hsl(var(--accent))] flex items-center justify-center text-[hsl(var(--primary))] mb-4">
                    <value.icon size={20} />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{value.title}</h3>
                  <p className="text-sm text-[#475467]">{value.description}</p>
                </Card>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* Expertise Section */}
      <section className="py-16 sm:py-20 bg-gradient-to-br from-[#EAF7F5] to-white">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeUp>
            <div className="text-center mb-16">
              <Badge className="mb-4 bg-[hsl(var(--secondary))] text-white hover:bg-[hsl(var(--secondary))]" data-testid="expertise-badge">
                <Award className="mr-1 h-3 w-3" /> Our Expertise
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-semibold text-[hsl(var(--foreground))] mb-4">
                What We Do Best
              </h2>
              <p className="text-base text-[#475467] max-w-2xl mx-auto">
                Over a decade of experience helping businesses succeed in the digital era
              </p>
            </div>
          </FadeUp>

          <div className="grid md:grid-cols-2 gap-8">
            <FadeUp>
              <Card className="p-8 rounded-xl shadow-[0_12px_40px_rgba(16,24,40,0.08)] border-0 bg-white">
                <h3 className="text-xl font-semibold mb-4">Digital Consultancy</h3>
                <ul className="space-y-3 text-sm text-[#475467]">
                  <li className="flex items-start gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--secondary))] mt-2 shrink-0" />
                    <span>Technology strategy and roadmap planning</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--secondary))] mt-2 shrink-0" />
                    <span>Digital transformation assessments</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--secondary))] mt-2 shrink-0" />
                    <span>Process optimization and automation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--secondary))] mt-2 shrink-0" />
                    <span>Vendor selection and management</span>
                  </li>
                </ul>
              </Card>
            </FadeUp>

            <FadeUp delay={0.1}>
              <Card className="p-8 rounded-xl shadow-[0_12px_40px_rgba(16,24,40,0.08)] border-0 bg-white">
                <h3 className="text-xl font-semibold mb-4">AI Implementation</h3>
                <ul className="space-y-3 text-sm text-[#475467]">
                  <li className="flex items-start gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--secondary))] mt-2 shrink-0" />
                    <span>Custom AI chatbots and virtual assistants</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--secondary))] mt-2 shrink-0" />
                    <span>Workflow automation and RPA</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--secondary))] mt-2 shrink-0" />
                    <span>Data analytics and business intelligence</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--secondary))] mt-2 shrink-0" />
                    <span>Machine learning model integration</span>
                  </li>
                </ul>
              </Card>
            </FadeUp>

            <FadeUp delay={0.2}>
              <Card className="p-8 rounded-xl shadow-[0_12px_40px_rgba(16,24,40,0.08)] border-0 bg-white">
                <h3 className="text-xl font-semibold mb-4">Web & App Development</h3>
                <ul className="space-y-3 text-sm text-[#475467]">
                  <li className="flex items-start gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--secondary))] mt-2 shrink-0" />
                    <span>Responsive React frontends with modern UI/UX</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--secondary))] mt-2 shrink-0" />
                    <span>FastAPI backends with MongoDB/PostgreSQL</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--secondary))] mt-2 shrink-0" />
                    <span>Progressive Web Apps (PWA)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--secondary))] mt-2 shrink-0" />
                    <span>API development and integration</span>
                  </li>
                </ul>
              </Card>
            </FadeUp>

            <FadeUp delay={0.3}>
              <Card className="p-8 rounded-xl shadow-[0_12px_40px_rgba(16,24,40,0.08)] border-0 bg-white">
                <h3 className="text-xl font-semibold mb-4">Grant Support</h3>
                <ul className="space-y-3 text-sm text-[#475467]">
                  <li className="flex items-start gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--secondary))] mt-2 shrink-0" />
                    <span>EDG eligibility assessment and application support</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--secondary))] mt-2 shrink-0" />
                    <span>Application documentation and submission</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--secondary))] mt-2 shrink-0" />
                    <span>Project planning and budget preparation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--secondary))] mt-2 shrink-0" />
                    <span>Post-approval implementation and reporting</span>
                  </li>
                </ul>
              </Card>
            </FadeUp>
          </div>
        </div>
      </section>
    </div>
  );
}