import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../components/ui/accordion';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Award, CheckCircle2, FileText, TrendingUp, Clock } from 'lucide-react';

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

export default function Grants() {
  const eligibilityCriteria = [
    'Registered and operating in Singapore',
    'At least 30% local shareholding',
    'Company in good financial standing',
    'Project aligns with business needs',
    'Measurable business outcomes'
  ];

  const faqs = [
    {
      question: 'What is the Enterprise Development Grant (EDG)?',
      answer: 'EDG supports projects that help companies upgrade and transform their business. It covers up to 50% of qualifying project costs for productivity improvement, market access, and innovation development initiatives.'
    },
    {
      question: 'What costs are covered under EDG?',
      answer: 'EDG covers costs including third-party consultancy fees, software/equipment, training and certification, and internal manpower costs. The maximum support level is 50% of qualifying costs.'
    },
    {
      question: 'How long does the application process take?',
      answer: 'The typical application process takes 6-8 weeks from submission to approval. CCC can help expedite this by ensuring all documentation is complete and accurate from the start.'
    },
    {
      question: 'What happens after grant approval?',
      answer: 'Once approved, you can begin project implementation. CCC provides ongoing support throughout the project lifecycle, including vendor management, milestone reporting, and claims submission.'
    },
    {
      question: 'Do I need to repay EDG funding?',
      answer: 'No, EDG is a grant, not a loan. You do not need to repay the approved funding amount. However, you must comply with the terms and conditions of the grant throughout the project period.'
    }
  ];

  return (
    <div className="flex flex-col" data-testid="grants-page">
      {/* Hero Section */}
      <section className="py-16 sm:py-20 lg:py-28 bg-gradient-to-br from-[#EAF7F5] via-white to-[#EAF7F5]">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeUp>
            <div className="max-w-3xl mx-auto text-center">
              <Badge className="mb-4 bg-[#12B76A] text-white hover:bg-[#12B76A]" data-testid="grants-badge">
                <Award className="mr-1 h-3 w-3" /> Government Funding Available
              </Badge>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-[hsl(var(--foreground))] mb-6">
                Grants & Funding Support
              </h1>
              <p className="text-lg text-[#475467] leading-relaxed">
                Access up to 50% funding from Enterprise Singapore for your digital transformation projects. We guide you through every step of the application process.
              </p>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* Grant Programs Overview */}
      <section className="py-16 sm:py-20 bg-white" data-testid="grant-programs">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeUp>
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-semibold text-[hsl(var(--foreground))] mb-4">
                Available Grant Programs
              </h2>
              <p className="text-base text-[#475467] max-w-2xl mx-auto">
                Choose the right funding program for your business needs
              </p>
            </div>
          </FadeUp>

          <div className="grid md:grid-cols-2 gap-8">
            <FadeUp>
              <Card className="p-8 rounded-xl shadow-[0_12px_40px_rgba(16,24,40,0.08)] border-0 h-full">
                <Badge className="mb-4 bg-[hsl(var(--secondary))] text-white">EDG</Badge>
                <h3 className="text-2xl font-semibold mb-4">Enterprise Development Grant</h3>
                <p className="text-base text-[#475467] mb-6">
                  Comprehensive support for business transformation and growth projects.
                </p>
                
                <div className="space-y-4 mb-6">
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-lg bg-[hsl(var(--accent))] flex items-center justify-center shrink-0">
                      <TrendingUp className="h-5 w-5 text-[hsl(var(--primary))]" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Up to 50% Funding</h4>
                      <p className="text-sm text-[#475467]">Maximum support for qualifying costs</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-lg bg-[hsl(var(--accent))] flex items-center justify-center shrink-0">
                      <FileText className="h-5 w-5 text-[hsl(var(--primary))]" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Flexible Project Scope</h4>
                      <p className="text-sm text-[#475467]">Customizable to your business needs</p>
                    </div>
                  </div>
                </div>

                <h4 className="font-semibold mb-3">Eligible Projects:</h4>
                <ul className="space-y-2 text-sm text-[#475467]">
                  <li>• Core capabilities development</li>
                  <li>• Innovation and productivity improvement</li>
                  <li>• Market access and expansion</li>
                  <li>• Digital transformation initiatives</li>
                </ul>
              </Card>
            </FadeUp>

            <FadeUp delay={0.1}>
              <Card className="p-8 rounded-xl shadow-[0_12px_40px_rgba(16,24,40,0.08)] border-0 h-full">
                <Badge className="mb-4 bg-[hsl(var(--secondary))] text-white">SFEC</Badge>
                <h3 className="text-2xl font-semibold mb-4">SMEs Go Digital (SFEC)</h3>
                <p className="text-base text-[#475467] mb-6">
                  Quick and easy access to pre-approved digital solutions.
                </p>
                
                <div className="space-y-4 mb-6">
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-lg bg-[hsl(var(--accent))] flex items-center justify-center shrink-0">
                      <Clock className="h-5 w-5 text-[hsl(var(--primary))]" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Fast Approval</h4>
                      <p className="text-sm text-[#475467]">Streamlined application process</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-lg bg-[hsl(var(--accent))] flex items-center justify-center shrink-0">
                      <Award className="h-5 w-5 text-[hsl(var(--primary))]" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Pre-Approved Solutions</h4>
                      <p className="text-sm text-[#475467]">Vetted digital tools and services</p>
                    </div>
                  </div>
                </div>

                <h4 className="font-semibold mb-3">Eligible Solutions:</h4>
                <ul className="space-y-2 text-sm text-[#475467]">
                  <li>• E-commerce platforms</li>
                  <li>• Customer relationship management</li>
                  <li>• Digital marketing tools</li>
                  <li>• Accounting and inventory systems</li>
                </ul>
              </Card>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-16 sm:py-20 bg-gradient-to-br from-[#EAF7F5] to-white">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeUp>
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-semibold text-[hsl(var(--foreground))] mb-4">
                Grant Comparison
              </h2>
              <p className="text-base text-[#475467]">
                Compare key features to choose the right grant for your business
              </p>
            </div>
          </FadeUp>

          <FadeUp delay={0.1}>
            <Card className="rounded-xl shadow-[0_12px_40px_rgba(16,24,40,0.08)] border-0 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-[hsl(var(--muted))]">
                    <TableHead className="font-semibold">Feature</TableHead>
                    <TableHead className="font-semibold">EDG</TableHead>
                    <TableHead className="font-semibold">SFEC</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Funding Support</TableCell>
                    <TableCell>Up to 50%</TableCell>
                    <TableCell>Up to 50%</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Application Time</TableCell>
                    <TableCell>6-8 weeks</TableCell>
                    <TableCell>2-4 weeks</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Project Flexibility</TableCell>
                    <TableCell>Highly customizable</TableCell>
                    <TableCell>Pre-approved solutions</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Best For</TableCell>
                    <TableCell>Large transformations</TableCell>
                    <TableCell>Quick digital adoption</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Project Duration</TableCell>
                    <TableCell>Up to 24 months</TableCell>
                    <TableCell>Up to 12 months</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Card>
          </FadeUp>
        </div>
      </section>

      {/* Eligibility Section */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-screen-lg mx-auto px-4 sm:px-6 lg:px-8">
          <FadeUp>
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-semibold text-[hsl(var(--foreground))] mb-4">
                Eligibility Criteria
              </h2>
              <p className="text-base text-[#475467]">
                Basic requirements for grant applications
              </p>
            </div>
          </FadeUp>

          <FadeUp delay={0.1}>
            <Card className="p-8 rounded-xl shadow-[0_12px_40px_rgba(16,24,40,0.08)] border-0">
              <ul className="space-y-4">
                {eligibilityCriteria.map((criterion, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle2 className="h-6 w-6 text-[#12B76A] shrink-0 mt-0.5" />
                    <span className="text-base text-[#475467]">{criterion}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-8 pt-8 border-t">
                <p className="text-sm text-[#475467] mb-4">
                  Not sure if you're eligible? We can help assess your project and recommend the best funding option.
                </p>
                <Button 
                  asChild
                  className="bg-[hsl(var(--secondary))] hover:bg-[#0AA099] text-white"
                  data-testid="eligibility-check-button"
                >
                  <Link to="/contact">Check Eligibility</Link>
                </Button>
              </div>
            </Card>
          </FadeUp>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 sm:py-20 bg-gradient-to-br from-[#EAF7F5] to-white" data-testid="grants-faq">
        <div className="max-w-screen-lg mx-auto px-4 sm:px-6 lg:px-8">
          <FadeUp>
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-semibold text-[hsl(var(--foreground))] mb-4">
                Frequently Asked Questions
              </h2>
              <p className="text-base text-[#475467]">
                Get answers to common questions about grant applications
              </p>
            </div>
          </FadeUp>

          <FadeUp delay={0.1}>
            <Accordion type="single" collapsible className="w-full" data-testid="grants-accordion">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                  <AccordionContent className="text-[#475467]">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </FadeUp>
        </div>
      </section>

      {/* How We Help Section */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeUp>
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-semibold text-[hsl(var(--foreground))] mb-4">
                How CCC Supports Your Grant Application
              </h2>
              <p className="text-base text-[#475467] max-w-2xl mx-auto">
                End-to-end support throughout the entire grant application process
              </p>
            </div>
          </FadeUp>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '1',
                title: 'Assessment & Planning',
                description: 'We evaluate your project, determine eligibility, and recommend the most suitable grant program.'
              },
              {
                step: '2',
                title: 'Application Preparation',
                description: 'Complete documentation, budget planning, and application submission with all required materials.'
              },
              {
                step: '3',
                title: 'Implementation & Claims',
                description: 'Ongoing support during project execution, milestone reporting, and grant claims submission.'
              }
            ].map((item, index) => (
              <FadeUp key={item.step} delay={index * 0.1}>
                <Card className="p-6 rounded-xl shadow-[0_12px_40px_rgba(16,24,40,0.08)] border-0 text-center">
                  <div className="h-12 w-12 rounded-full bg-[hsl(var(--secondary))] text-white flex items-center justify-center text-xl font-bold mx-auto mb-4">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                  <p className="text-sm text-[#475467]">{item.description}</p>
                </Card>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-20 bg-[hsl(var(--primary))] text-white">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeUp>
            <div className="text-center">
              <h2 className="text-3xl sm:text-4xl font-semibold mb-4">
                Ready to Apply for a Grant?
              </h2>
              <p className="text-lg text-[#EAF7F5] mb-8 max-w-2xl mx-auto">
                Let's discuss your project and help you access government funding for your digital transformation.
              </p>
              <Button 
                asChild
                className="bg-[hsl(var(--secondary))] hover:bg-[#0AA099] text-white shadow-[0_6px_18px_rgba(15,181,174,0.22)]"
                data-testid="grants-contact-cta"
              >
                <Link to="/contact">Schedule a Consultation</Link>
              </Button>
            </div>
          </FadeUp>
        </div>
      </section>
    </div>
  );
}
