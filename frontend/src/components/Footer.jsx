import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone } from 'lucide-react';

export const Footer = () => {
  return (
    <footer 
      className="border-t bg-[hsl(var(--background))] text-[#475467]"
      data-testid="main-footer"
    >
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Company Info */}
          <div className="space-y-4">
            {/* CCC Logo */}
            <div className="mb-4">
              <img 
                src="/ccc-logo-footer.svg" 
                alt="CCC - Cognition & Competence Consultancy" 
                className="h-12 w-auto"
              />
            </div>
            <p className="text-sm">
              Smart digital systems for modern businesses. We build websites, AI automation, and WhatsApp integration solutions.
            </p>
            <p className="text-xs mt-2">
              UEN: 201208916K
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-[hsl(var(--foreground))] mb-4">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link 
                  to="/about" 
                  className="text-sm hover:text-[hsl(var(--secondary))] transition-colors"
                  data-testid="footer-link-about"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link 
                  to="/services" 
                  className="text-sm hover:text-[hsl(var(--secondary))] transition-colors"
                  data-testid="footer-link-services"
                >
                  Services
                </Link>
              </li>
              <li>
                <Link 
                  to="/portfolio" 
                  className="text-sm hover:text-[hsl(var(--secondary))] transition-colors"
                  data-testid="footer-link-portfolio"
                >
                  Portfolio
                </Link>
              </li>
              <li>
                <Link 
                  to="/grants" 
                  className="text-sm hover:text-[hsl(var(--secondary))] transition-colors"
                  data-testid="footer-link-grants"
                >
                  Grants & Funding
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-semibold text-[hsl(var(--foreground))] mb-4">Services</h3>
            <ul className="space-y-3">
              <li><span className="text-sm">Website & E-Commerce Development</span></li>
              <li><span className="text-sm">AI Chatbots & Automation</span></li>
              <li><span className="text-sm">WhatsApp AI Bot Integration</span></li>
              <li><span className="text-sm">CRM & Analytics Integration</span></li>
              <li><span className="text-sm">Custom Web Systems</span></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-semibold text-[hsl(var(--foreground))] mb-4">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0" />
                <a 
                  href="tel:+6589821301" 
                  className="text-sm hover:text-[hsl(var(--secondary))] transition-colors"
                  data-testid="footer-phone-link"
                >
                  8982 1301
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0" />
                <a 
                  href="mailto:glor-yeo@hotmail.com" 
                  className="text-sm hover:text-[hsl(var(--secondary))] transition-colors"
                  data-testid="footer-email-link"
                >
                  glor-yeo@hotmail.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm">
            © {new Date().getFullYear()} Cognition & Competence Consultancy Pte Ltd. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link 
              to="/pdpa" 
              className="text-sm hover:text-[hsl(var(--secondary))] transition-colors"
              data-testid="footer-link-pdpa"
            >
              PDPA
            </Link>
            <Link 
              to="/terms" 
              className="text-sm hover:text-[hsl(var(--secondary))] transition-colors"
              data-testid="footer-link-terms"
            >
              Terms
            </Link>
            <Link 
              to="/contact" 
              className="text-sm hover:text-[hsl(var(--secondary))] transition-colors"
              data-testid="footer-link-contact"
            >
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;