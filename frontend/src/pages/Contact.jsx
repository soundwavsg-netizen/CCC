import React, { useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import { toast } from 'sonner';
import { Mail, Phone, MapPin, MessageSquare } from 'lucide-react';

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

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL || '';
      await axios.post(`${backendUrl}/api/contact`, formData);
      
      toast.success('Message sent successfully!', {
        description: 'We\'ll get back to you shortly.',
        className: 'bg-[hsl(var(--background))] border-[hsl(var(--border))]'
      });
      
      setFormData({
        name: '',
        email: '',
        company: '',
        message: ''
      });
    } catch (error) {
      toast.error('Failed to send message', {
        description: 'Please try again or contact us directly.',
        className: 'bg-[hsl(var(--background))] border-[hsl(var(--border))]'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col" data-testid="contact-page">
      {/* Hero Section */}
      <section className="py-16 sm:py-20 lg:py-28 bg-gradient-to-br from-[#EAF7F5] via-white to-[#EAF7F5]">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeUp>
            <div className="max-w-3xl mx-auto text-center">
              <Badge className="mb-4 bg-[hsl(var(--accent))] text-[hsl(var(--primary))] hover:bg-[hsl(var(--accent))]" data-testid="contact-badge">
                Get In Touch
              </Badge>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-[hsl(var(--foreground))] mb-6">
                Let's Talk About Your Project
              </h1>
              <p className="text-lg text-[#475467] leading-relaxed">
                Have a question or ready to start your digital transformation? We're here to help.
              </p>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* Contact Form & Info */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <FadeUp>
              <Card className="p-8 rounded-xl shadow-[0_12px_40px_rgba(16,24,40,0.08)] border-0">
                <h2 className="text-2xl font-semibold mb-6">Send Us a Message</h2>
                <form onSubmit={handleSubmit} className="space-y-6" data-testid="contact-form">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium mb-2">
                      Full Name *
                    </label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full"
                      data-testid="contact-name-input"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium mb-2">
                      Email Address *
                    </label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="john@company.com"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full"
                      data-testid="contact-email-input"
                    />
                  </div>

                  <div>
                    <label htmlFor="company" className="block text-sm font-medium mb-2">
                      Company
                    </label>
                    <Input
                      id="company"
                      name="company"
                      type="text"
                      placeholder="Your Company Name"
                      value={formData.company}
                      onChange={handleChange}
                      className="w-full"
                      data-testid="contact-company-input"
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium mb-2">
                      How can we help? *
                    </label>
                    <Textarea
                      id="message"
                      name="message"
                      rows={5}
                      placeholder="Tell us about your project..."
                      value={formData.message}
                      onChange={handleChange}
                      required
                      className="w-full"
                      data-testid="contact-message-textarea"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[hsl(var(--secondary))] hover:bg-[#0AA099] text-white"
                    data-testid="contact-form-submit-button"
                  >
                    {loading ? 'Sending...' : 'Send Message'}
                  </Button>
                </form>
              </Card>
            </FadeUp>

            {/* Contact Information */}
            <div className="space-y-6">
              <FadeUp delay={0.1}>
                <Card className="p-6 rounded-xl shadow-[0_12px_40px_rgba(16,24,40,0.08)] border-0">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-lg bg-[hsl(var(--accent))] flex items-center justify-center shrink-0">
                      <Mail className="h-6 w-6 text-[hsl(var(--primary))]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-2">Email Us</h3>
                      <p className="text-sm text-[#475467] mb-2">
                        Send us an email and we'll respond within 24 hours
                      </p>
                      <a 
                        href="mailto:glor-yeo@hotmail.com"
                        className="text-[hsl(var(--secondary))] hover:text-[#0AA099] font-medium"
                        data-testid="contact-email-link"
                      >
                        glor-yeo@hotmail.com
                      </a>
                    </div>
                  </div>
                </Card>
              </FadeUp>

              <FadeUp delay={0.2}>
                <Card className="p-6 rounded-xl shadow-[0_12px_40px_rgba(16,24,40,0.08)] border-0">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-lg bg-[hsl(var(--accent))] flex items-center justify-center shrink-0">
                      <Phone className="h-6 w-6 text-[hsl(var(--primary))]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-2">Call Us</h3>
                      <p className="text-sm text-[#475467] mb-2">
                        Mon-Fri from 9am to 6pm SGT
                      </p>
                      <a 
                        href="tel:+6585008888"
                        className="text-[hsl(var(--secondary))] hover:text-[#0AA099] font-medium"
                        data-testid="contact-phone-link"
                      >
                        +65 8500 8888
                      </a>
                    </div>
                  </div>
                </Card>
              </FadeUp>

              <FadeUp delay={0.3}>
                <Card className="p-6 rounded-xl shadow-[0_12px_40px_rgba(16,24,40,0.08)] border-0">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-lg bg-[hsl(var(--accent))] flex items-center justify-center shrink-0">
                      <MessageSquare className="h-6 w-6 text-[hsl(var(--primary))]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-2">WhatsApp</h3>
                      <p className="text-sm text-[#475467] mb-2">
                        Message us on WhatsApp for quick response
                      </p>
                      <a 
                        href="https://wa.me/6585008888"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[hsl(var(--secondary))] hover:text-[#0AA099] font-medium"
                        data-testid="contact-whatsapp-link"
                      >
                        Chat on WhatsApp
                      </a>
                    </div>
                  </div>
                </Card>
              </FadeUp>

              <FadeUp delay={0.4}>
                <Card className="p-6 rounded-xl shadow-[0_12px_40px_rgba(16,24,40,0.08)] border-0">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-lg bg-[hsl(var(--accent))] flex items-center justify-center shrink-0">
                      <MapPin className="h-6 w-6 text-[hsl(var(--primary))]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-2">Visit Us</h3>
                      <p className="text-sm text-[#475467]">
                        Blk 347 Woodlands Ave 3<br />
                        #07-105<br />
                        Singapore 730347
                      </p>
                    </div>
                  </div>
                </Card>
              </FadeUp>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-16 sm:py-20 bg-gradient-to-br from-[#EAF7F5] to-white">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeUp>
            <h2 className="text-3xl sm:text-4xl font-semibold text-[hsl(var(--foreground))] mb-8 text-center">
              Our Location
            </h2>
            <div className="rounded-xl overflow-hidden border shadow-[0_12px_40px_rgba(16,24,40,0.08)]">
              <iframe 
                title="CCC Location" 
                data-testid="contact-map-iframe"
                src="https://maps.google.com/maps?q=Blk+347+Woodlands+Ave+3+Singapore+730347&t=&z=15&ie=UTF8&iwloc=&output=embed" 
                width="100%" 
                height="480" 
                style={{ border: 0 }} 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </FadeUp>
        </div>
      </section>
    </div>
  );
}