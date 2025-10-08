import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Badge } from '../components/ui/badge';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from '../components/ui/breadcrumb';

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

export default function PDPA() {
  return (
    <div className="flex flex-col" data-testid="pdpa-page">
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-screen-lg mx-auto px-4 sm:px-6 lg:px-8">
          <FadeUp>
            <Breadcrumb className="mb-8">
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to="/">Home</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <span>PDPA Policy</span>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>

            <Badge className="mb-4 bg-[hsl(var(--accent))] text-[hsl(var(--primary))] hover:bg-[hsl(var(--accent))]">
              Legal
            </Badge>
            <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-[hsl(var(--foreground))] mb-6">
              Personal Data Protection Act (PDPA) Policy
            </h1>
            <p className="text-sm text-[#475467] mb-12">
              Last Updated: {new Date().toLocaleDateString('en-SG', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>

            <div className="prose max-w-none space-y-6 text-[#475467]">
              <section>
                <h2 className="text-2xl font-semibold text-[hsl(var(--foreground))] mb-4">1. Introduction</h2>
                <p>
                  Cognition & Competence Consultancy Pte Ltd (UEN: 201208916K) ("CCC", "we", "us", or "our") is committed to protecting the privacy and personal data of our clients, partners, and website visitors in accordance with the Personal Data Protection Act 2012 of Singapore ("PDPA").
                </p>
                <p>
                  This policy outlines how we collect, use, disclose, and protect your personal data.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-[hsl(var(--foreground))] mb-4">2. Personal Data We Collect</h2>
                <p>We may collect the following types of personal data:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Name and contact information (email address, phone number, mailing address)</li>
                  <li>Company name and business information</li>
                  <li>Project details and requirements</li>
                  <li>Payment and billing information</li>
                  <li>Communication records and correspondence</li>
                  <li>Technical data (IP address, browser type, device information)</li>
                  <li>Usage data (website analytics, user behavior)</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-[hsl(var(--foreground))] mb-4">3. How We Collect Personal Data</h2>
                <p>We collect personal data through:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Contact forms and inquiry submissions on our website</li>
                  <li>Email correspondence and phone communications</li>
                  <li>Project consultation and service agreements</li>
                  <li>Grant application assistance processes</li>
                  <li>Website cookies and tracking technologies</li>
                  <li>Business meetings and networking events</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-[hsl(var(--foreground))] mb-4">4. Purpose of Data Collection</h2>
                <p>We collect and use your personal data for the following purposes:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Providing our digital transformation and consultancy services</li>
                  <li>Responding to inquiries and communication requests</li>
                  <li>Processing project proposals and service agreements</li>
                  <li>Facilitating grant applications (EDG, SFEC)</li>
                  <li>Billing and payment processing</li>
                  <li>Improving our services and website functionality</li>
                  <li>Sending marketing communications (with your consent)</li>
                  <li>Complying with legal and regulatory requirements</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-[hsl(var(--foreground))] mb-4">5. Disclosure of Personal Data</h2>
                <p>We may disclose your personal data to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Service providers and subcontractors who assist in project delivery</li>
                  <li>Government agencies for grant applications and regulatory compliance</li>
                  <li>Payment processors and financial institutions</li>
                  <li>Professional advisors (lawyers, accountants, auditors)</li>
                  <li>Law enforcement or regulatory authorities when required by law</li>
                </ul>
                <p className="mt-4">
                  We do not sell, rent, or trade your personal data to third parties for marketing purposes.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-[hsl(var(--foreground))] mb-4">6. Data Protection and Security</h2>
                <p>
                  We implement appropriate security measures to protect your personal data from unauthorized access, disclosure, alteration, or destruction. These measures include:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Encryption of data in transit and at rest</li>
                  <li>Access controls and authentication mechanisms</li>
                  <li>Regular security audits and updates</li>
                  <li>Staff training on data protection practices</li>
                  <li>Secure data storage and backup systems</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-[hsl(var(--foreground))] mb-4">7. Data Retention</h2>
                <p>
                  We retain your personal data only for as long as necessary to fulfill the purposes for which it was collected, or as required by law. Typical retention periods include:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Client project data: Duration of project plus 7 years</li>
                  <li>Financial records: 7 years from end of financial year</li>
                  <li>Marketing consent data: Until consent is withdrawn</li>
                  <li>Website analytics: 26 months</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-[hsl(var(--foreground))] mb-4">8. Your Rights</h2>
                <p>Under the PDPA, you have the right to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Request access to your personal data</li>
                  <li>Request correction of inaccurate or incomplete data</li>
                  <li>Withdraw consent for data processing (where applicable)</li>
                  <li>Request deletion of your personal data (subject to legal requirements)</li>
                  <li>Object to certain types of data processing</li>
                </ul>
                <p className="mt-4">
                  To exercise these rights, please contact us using the details provided below.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-[hsl(var(--foreground))] mb-4">9. Cookies and Tracking</h2>
                <p>
                  Our website uses cookies and similar tracking technologies to enhance user experience and analyze website traffic. You can control cookie preferences through your browser settings.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-[hsl(var(--foreground))] mb-4">10. Third-Party Links</h2>
                <p>
                  Our website may contain links to third-party websites. We are not responsible for the privacy practices of these external sites and encourage you to review their privacy policies.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-[hsl(var(--foreground))] mb-4">11. Changes to This Policy</h2>
                <p>
                  We may update this PDPA policy from time to time. Any changes will be posted on this page with an updated "Last Updated" date. We encourage you to review this policy periodically.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-[hsl(var(--foreground))] mb-4">12. Contact Us</h2>
                <p>
                  If you have any questions, concerns, or requests regarding this PDPA policy or our data protection practices, please contact us:
                </p>
                <div className="mt-4 p-6 bg-[hsl(var(--muted))] rounded-lg">
                  <p><strong>Cognition & Competence Consultancy Pte Ltd</strong></p>
                  <p>Blk 347 Woodlands Ave 3 #07-105</p>
                  <p>Singapore 730347</p>
                  <p className="mt-2">
                    Email: <a href="mailto:glor-yeo@hotmail.com" className="text-[hsl(var(--secondary))] hover:underline">glor-yeo@hotmail.com</a>
                  </p>
                  <p>Phone: <a href="tel:+6585008888" className="text-[hsl(var(--secondary))] hover:underline">+65 8500 8888</a></p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-[hsl(var(--foreground))] mb-4">13. Consent</h2>
                <p>
                  By using our website and services, you consent to the collection, use, and disclosure of your personal data as described in this policy. If you do not agree with this policy, please do not use our services.
                </p>
              </section>
            </div>
          </FadeUp>
        </div>
      </section>
    </div>
  );
}