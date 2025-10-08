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

export default function Terms() {
  return (
    <div className="flex flex-col" data-testid="terms-page">
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
                  <span>Terms of Service</span>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>

            <Badge className="mb-4 bg-[hsl(var(--accent))] text-[hsl(var(--primary))] hover:bg-[hsl(var(--accent))]">
              Legal
            </Badge>
            <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-[hsl(var(--foreground))] mb-6">
              Terms of Service
            </h1>
            <p className="text-sm text-[#475467] mb-12">
              Last Updated: {new Date().toLocaleDateString('en-SG', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>

            <div className="prose max-w-none space-y-6 text-[#475467]">
              <section>
                <h2 className="text-2xl font-semibold text-[hsl(var(--foreground))] mb-4">1. Agreement to Terms</h2>
                <p>
                  By accessing or using the services provided by Cognition & Competence Consultancy Pte Ltd (UEN: 201208916K) ("CCC", "we", "us", or "our"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-[hsl(var(--foreground))] mb-4">2. Services Scope</h2>
                <p>CCC provides the following services:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Website and mobile application development</li>
                  <li>AI automation and implementation</li>
                  <li>E-commerce solutions and platforms</li>
                  <li>Business training and consultancy</li>
                  <li>Grant application support (EDG, SFEC)</li>
                  <li>Digital transformation consultancy</li>
                </ul>
                <p className="mt-4">
                  Specific services will be detailed in individual project agreements or statements of work.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-[hsl(var(--foreground))] mb-4">3. Client Obligations</h2>
                <p>As a client, you agree to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Provide accurate and complete information necessary for project execution</li>
                  <li>Respond to requests for information and feedback in a timely manner</li>
                  <li>Make timely payments according to agreed payment terms</li>
                  <li>Provide necessary access to systems, accounts, and resources</li>
                  <li>Review and approve deliverables within specified timeframes</li>
                  <li>Comply with all applicable laws and regulations</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-[hsl(var(--foreground))] mb-4">4. Intellectual Property</h2>
                <p>
                  <strong>4.1 Client-Owned IP:</strong> Upon full payment, all custom work product developed specifically for your project will be transferred to you, including source code, designs, and documentation.
                </p>
                <p>
                  <strong>4.2 CCC-Owned IP:</strong> We retain ownership of pre-existing intellectual property, frameworks, tools, and methodologies used in providing our services.
                </p>
                <p>
                  <strong>4.3 Third-Party IP:</strong> Some projects may utilize third-party software, libraries, or services subject to their respective licenses.
                </p>
                <p>
                  <strong>4.4 Portfolio Rights:</strong> Unless otherwise agreed in writing, we reserve the right to showcase completed projects in our portfolio and marketing materials.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-[hsl(var(--foreground))] mb-4">5. Payment Terms</h2>
                <p>
                  <strong>5.1 Fees:</strong> Service fees will be specified in individual project agreements. All fees are in Singapore Dollars (SGD) unless otherwise stated.
                </p>
                <p>
                  <strong>5.2 Payment Schedule:</strong> Typical payment structures include:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Initial deposit: 30-50% upon project commencement</li>
                  <li>Milestone payments: As specified in project agreement</li>
                  <li>Final payment: Upon project completion and delivery</li>
                </ul>
                <p>
                  <strong>5.3 Late Payment:</strong> Overdue payments may incur interest charges of 1.5% per month or the maximum allowed by law, whichever is lower.
                </p>
                <p>
                  <strong>5.4 Grant Projects:</strong> For grant-supported projects, payment terms will be structured to align with grant disbursement schedules.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-[hsl(var(--foreground))] mb-4">6. Project Timelines</h2>
                <p>
                  Project timelines are estimates based on information available at project commencement. Actual completion dates may vary due to factors including:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Client delays in providing information or approvals</li>
                  <li>Changes in project scope or requirements</li>
                  <li>Technical challenges or third-party dependencies</li>
                  <li>Force majeure events</li>
                </ul>
                <p className="mt-4">
                  We will communicate any anticipated delays promptly and work to minimize their impact.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-[hsl(var(--foreground))] mb-4">7. Warranties and Disclaimers</h2>
                <p>
                  <strong>7.1 Service Warranty:</strong> We warrant that services will be performed with reasonable skill and care consistent with industry standards.
                </p>
                <p>
                  <strong>7.2 Functionality Warranty:</strong> Custom-developed solutions will function substantially as specified in approved requirements documents for a period of 90 days post-delivery.
                </p>
                <p>
                  <strong>7.3 Disclaimer:</strong> Except as expressly stated, services are provided "as is" without warranties of any kind, whether express or implied, including but not limited to merchantability, fitness for a particular purpose, or non-infringement.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-[hsl(var(--foreground))] mb-4">8. Limitation of Liability</h2>
                <p>
                  To the maximum extent permitted by law, CCC's total liability for any claims arising from or related to our services shall not exceed the total fees paid by you for the specific project giving rise to the claim.
                </p>
                <p className="mt-4">
                  We shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of profits, data, or business opportunities.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-[hsl(var(--foreground))] mb-4">9. Confidentiality</h2>
                <p>
                  Both parties agree to maintain the confidentiality of proprietary information disclosed during the course of the engagement. This obligation survives the termination of our agreement.
                </p>
                <p className="mt-4">
                  Confidential information does not include information that:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Is or becomes publicly available through no breach of this agreement</li>
                  <li>Was rightfully known prior to disclosure</li>
                  <li>Is independently developed without use of confidential information</li>
                  <li>Must be disclosed by law or court order</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-[hsl(var(--foreground))] mb-4">10. Termination</h2>
                <p>
                  <strong>10.1 By Client:</strong> You may terminate a project with 30 days' written notice. You will be responsible for payment of all work completed and expenses incurred up to the termination date.
                </p>
                <p>
                  <strong>10.2 By CCC:</strong> We may terminate services immediately if you breach these terms, fail to make payments, or engage in conduct that impairs our ability to provide services.
                </p>
                <p>
                  <strong>10.3 Effect of Termination:</strong> Upon termination, we will deliver all completed work product and you will pay all outstanding fees.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-[hsl(var(--foreground))] mb-4">11. Changes and Scope Adjustments</h2>
                <p>
                  Changes to project scope, requirements, or deliverables must be documented in writing and may result in adjustments to fees and timelines. Significant changes may require a new project agreement.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-[hsl(var(--foreground))] mb-4">12. Support and Maintenance</h2>
                <p>
                  Post-launch support and maintenance services are available separately and are not included in initial development fees unless explicitly stated in the project agreement.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-[hsl(var(--foreground))] mb-4">13. Governing Law</h2>
                <p>
                  These Terms of Service are governed by the laws of the Republic of Singapore. Any disputes arising from these terms or our services shall be subject to the exclusive jurisdiction of the Singapore courts.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-[hsl(var(--foreground))] mb-4">14. Dispute Resolution</h2>
                <p>
                  In the event of a dispute, both parties agree to first attempt resolution through good-faith negotiation. If negotiation fails, disputes may be referred to mediation before pursuing legal action.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-[hsl(var(--foreground))] mb-4">15. Force Majeure</h2>
                <p>
                  Neither party shall be liable for delays or failures in performance resulting from circumstances beyond their reasonable control, including but not limited to natural disasters, government actions, pandemics, or telecommunications failures.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-[hsl(var(--foreground))] mb-4">16. Entire Agreement</h2>
                <p>
                  These Terms of Service, together with any project-specific agreements, constitute the entire agreement between the parties and supersede all prior communications, understandings, and agreements.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-[hsl(var(--foreground))] mb-4">17. Amendments</h2>
                <p>
                  We reserve the right to modify these terms at any time. Changes will be effective upon posting to our website. Continued use of our services after changes constitutes acceptance of the modified terms.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-[hsl(var(--foreground))] mb-4">18. Contact Information</h2>
                <p>
                  For questions regarding these Terms of Service, please contact us:
                </p>
                <div className="mt-4 p-6 bg-[hsl(var(--muted))] rounded-lg">
                  <p><strong>Cognition & Competence Consultancy Pte Ltd</strong></p>
                  <p>UEN: 201208916K</p>
                  <p>Blk 347 Woodlands Ave 3 #07-105</p>
                  <p>Singapore 730347</p>
                  <p className="mt-2">
                    Email: <a href="mailto:glor-yeo@hotmail.com" className="text-[hsl(var(--secondary))] hover:underline">glor-yeo@hotmail.com</a>
                  </p>
                  <p>Phone: <a href="tel:+6585008888" className="text-[hsl(var(--secondary))] hover:underline">+65 8500 8888</a></p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-[hsl(var(--foreground))] mb-4">19. Severability</h2>
                <p>
                  If any provision of these terms is found to be unenforceable or invalid, that provision will be limited or eliminated to the minimum extent necessary, and the remaining provisions will remain in full force and effect.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-[hsl(var(--foreground))] mb-4">20. Waiver</h2>
                <p>
                  Failure to enforce any provision of these terms shall not constitute a waiver of that or any other provision.
                </p>
              </section>
            </div>
          </FadeUp>
        </div>
      </section>
    </div>
  );
}
