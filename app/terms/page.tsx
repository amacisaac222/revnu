import Link from "next/link";

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-revnu-dark">
      {/* Header */}
      <header className="bg-revnu-darker/80 backdrop-blur-sm border-b border-revnu-slate/50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-5 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="4" y="20" width="5" height="12" rx="1" fill="#4ade80"/>
              <rect x="11" y="14" width="5" height="18" rx="1" fill="#4ade80"/>
              <rect x="18" y="8" width="5" height="24" rx="1" fill="#4ade80"/>
              <path d="M28 18L32 10L24 10L28 18Z" fill="#86efac" opacity="0.9"/>
              <path d="M25 16C25 16 27 12 30 8" stroke="#86efac" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
            <span className="text-2xl font-black tracking-tight text-white">
              REV<span className="text-revnu-green">NU</span>
            </span>
          </Link>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-black text-white mb-4">Terms of Service</h1>
        <p className="text-revnu-gray mb-8">Last Updated: January 6, 2026</p>

        <div className="prose prose-invert prose-green max-w-none space-y-8">
          {/* 1. Agreement to Terms */}
          <section className="bg-revnu-dark/50 p-6 rounded-xl border border-revnu-green/20">
            <h2 className="text-2xl font-bold text-white mb-4">1. Agreement to Terms</h2>
            <div className="text-revnu-gray space-y-4">
              <p>
                By accessing or using REVNU (&quot;Service&quot;, &quot;Platform&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;), you agree to be bound by these Terms of Service (&quot;Terms&quot;). If you do not agree to these Terms, do not use the Service.
              </p>
              <p>
                REVNU reserves the right to modify these Terms at any time. Continued use of the Service after changes constitutes acceptance of the modified Terms.
              </p>
            </div>
          </section>

          {/* 2. Service Description */}
          <section className="bg-revnu-dark/50 p-6 rounded-xl border border-revnu-green/20">
            <h2 className="text-2xl font-bold text-white mb-4">2. Service Description</h2>
            <div className="text-revnu-gray space-y-4">
              <p className="font-bold text-revnu-green">
                REVNU provides software that enables businesses to send automated payment reminder messages via SMS and email. REVNU is a technology platform only and is NOT a debt collection agency.
              </p>
              <p>
                You are solely responsible for collecting your own debts and complying with all applicable laws. REVNU does not collect debts on behalf of customers, nor does it provide debt collection services.
              </p>
            </div>
          </section>

          {/* 3. Customer Responsibilities */}
          <section className="bg-revnu-dark/50 p-6 rounded-xl border border-revnu-green/20">
            <h2 className="text-2xl font-bold text-white mb-4">3. Customer Responsibilities & Certifications</h2>
            <div className="text-revnu-gray space-y-4">
              <p>By using REVNU, you represent, warrant, and certify that:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong className="text-white">First-Party Collection Only:</strong> You are using the Service only to collect debts owed directly to you (first-party collection), not on behalf of third parties.</li>
                <li><strong className="text-white">TCPA Compliance:</strong> You have obtained or will obtain prior express written consent from all recipients before sending automated messages, as required by the Telephone Consumer Protection Act (TCPA).</li>
                <li><strong className="text-white">Consent Documentation:</strong> You maintain proper records of consent, including the date, method, and scope of consent obtained from each recipient.</li>
                <li><strong className="text-white">Time Restrictions:</strong> You will only send messages between 8:00 AM and 9:00 PM in the recipient&apos;s local timezone.</li>
                <li><strong className="text-white">Opt-Out Compliance:</strong> You will immediately honor all opt-out requests and cease communication with individuals who revoke consent.</li>
                <li><strong className="text-white">Truthful Communications:</strong> All messages sent through the Service will be truthful, accurate, and not misleading.</li>
                <li><strong className="text-white">Legal Compliance:</strong> You will comply with all applicable federal, state, and local laws, including but not limited to TCPA, Fair Debt Collection Practices Act (FDCPA) if applicable, and state consumer protection laws.</li>
              </ul>
            </div>
          </section>

          {/* 4. Prohibited Uses */}
          <section className="bg-revnu-dark/50 p-6 rounded-xl border border-revnu-green/20">
            <h2 className="text-2xl font-bold text-white mb-4">4. Prohibited Uses</h2>
            <div className="text-revnu-gray space-y-4">
              <p>You may NOT use REVNU to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Collect debts on behalf of third parties (debt collection agency activities)</li>
                <li>Send unsolicited marketing, promotional, or spam messages</li>
                <li>Contact individuals who have not given proper consent</li>
                <li>Harass, abuse, threaten, or intimidate recipients</li>
                <li>Send messages before 8:00 AM or after 9:00 PM recipient&apos;s time</li>
                <li>Continue contacting individuals who have opted out</li>
                <li>Violate TCPA, FDCPA, or any other applicable law or regulation</li>
                <li>Impersonate another person or entity</li>
                <li>Transmit viruses, malware, or other harmful code</li>
                <li>Interfere with or disrupt the Service or servers</li>
              </ul>
              <p className="font-bold text-yellow-400">
                Violation of these prohibited uses may result in immediate account suspension or termination without refund.
              </p>
            </div>
          </section>

          {/* 5. TCPA Compliance Requirements */}
          <section className="bg-revnu-dark/50 p-6 rounded-xl border border-revnu-green/20">
            <h2 className="text-2xl font-bold text-white mb-4">5. TCPA Compliance Requirements</h2>
            <div className="text-revnu-gray space-y-4">
              <p className="font-bold text-revnu-green">
                The Telephone Consumer Protection Act (TCPA) requires prior express written consent before sending automated text messages to mobile phones.
              </p>
              <p>You acknowledge and agree that:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>You are responsible for obtaining and maintaining proper TCPA consent</li>
                <li>Consent must be in writing and include specific disclosures</li>
                <li>You must provide clear opt-out mechanisms in all messages</li>
                <li>Violations of TCPA carry penalties of $500-$1,500 per message</li>
                <li>You are the &quot;sender&quot; under TCPA, not REVNU</li>
              </ul>
            </div>
          </section>

          {/* 6. Indemnification */}
          <section className="bg-revnu-dark/50 p-6 rounded-xl border border-revnu-green/20">
            <h2 className="text-2xl font-bold text-white mb-4">6. Indemnification</h2>
            <div className="text-revnu-gray space-y-4">
              <p className="font-bold text-white">
                You agree to indemnify, defend, and hold harmless REVNU and its officers, directors, employees, contractors, agents, licensors, and suppliers from and against any and all claims, demands, damages, losses, liabilities, costs, and expenses (including reasonable attorneys&apos; fees) arising from or related to:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Your use or misuse of the Service</li>
                <li>Your violation of these Terms</li>
                <li>Your violation of any law or regulation, including but not limited to TCPA, FDCPA, or state consumer protection laws</li>
                <li>Any claim that your use of the Service violated a third party&apos;s rights</li>
                <li>Your failure to obtain proper consent from message recipients</li>
                <li>Any damages or penalties arising from your communications sent through the Service</li>
              </ul>
              <p className="text-yellow-400">
                This indemnification obligation will survive termination of your account and these Terms.
              </p>
            </div>
          </section>

          {/* 7. Disclaimer of Warranties */}
          <section className="bg-revnu-dark/50 p-6 rounded-xl border border-revnu-green/20">
            <h2 className="text-2xl font-bold text-white mb-4">7. Disclaimer of Warranties</h2>
            <div className="text-revnu-gray space-y-4">
              <p className="uppercase font-bold">
                THE SERVICE IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
              </p>
              <p className="font-bold text-yellow-400">
                REVNU DOES NOT WARRANT THAT USE OF THE SERVICE WILL ENSURE LEGAL COMPLIANCE. YOU ARE SOLELY RESPONSIBLE FOR ENSURING YOUR ACTIVITIES COMPLY WITH APPLICABLE LAWS.
              </p>
              <p>
                REVNU does not guarantee the Service will be uninterrupted, timely, secure, or error-free. We do not warrant the accuracy, reliability, or completeness of any content or information provided through the Service.
              </p>
            </div>
          </section>

          {/* 8. Limitation of Liability */}
          <section className="bg-revnu-dark/50 p-6 rounded-xl border border-revnu-green/20">
            <h2 className="text-2xl font-bold text-white mb-4">8. Limitation of Liability</h2>
            <div className="text-revnu-gray space-y-4">
              <p className="uppercase font-bold">
                TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL REVNU BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS, REVENUE, DATA, OR BUSINESS OPPORTUNITIES ARISING OUT OF OR RELATED TO THESE TERMS OR THE SERVICE.
              </p>
              <p className="font-bold text-white">
                REVNU&apos;S TOTAL LIABILITY TO YOU FOR ALL CLAIMS ARISING FROM OR RELATED TO THE SERVICE SHALL NOT EXCEED THE AMOUNT YOU PAID TO REVNU IN THE TWELVE (12) MONTHS PRECEDING THE CLAIM.
              </p>
              <p>
                Some jurisdictions do not allow the exclusion or limitation of certain damages, so some of the above limitations may not apply to you.
              </p>
            </div>
          </section>

          {/* 9. Arbitration and Class Action Waiver */}
          <section className="bg-revnu-dark/50 p-6 rounded-xl border border-revnu-green/20">
            <h2 className="text-2xl font-bold text-white mb-4">9. Arbitration and Class Action Waiver</h2>
            <div className="text-revnu-gray space-y-4">
              <p className="font-bold text-white">
                YOU AND REVNU AGREE THAT ANY DISPUTE, CLAIM, OR CONTROVERSY ARISING OUT OF OR RELATING TO THESE TERMS OR THE SERVICE SHALL BE RESOLVED THROUGH BINDING INDIVIDUAL ARBITRATION.
              </p>
              <p><strong className="text-white">Arbitration Agreement:</strong></p>
              <ul className="list-disc pl-6 space-y-2">
                <li>All disputes shall be resolved by binding arbitration administered by the American Arbitration Association (AAA)</li>
                <li>The arbitration shall be conducted in accordance with AAA&apos;s Commercial Arbitration Rules</li>
                <li>The arbitrator&apos;s decision shall be final and binding</li>
                <li>Judgment on the award may be entered in any court having jurisdiction</li>
              </ul>
              <p className="font-bold text-yellow-400 uppercase">
                CLASS ACTION WAIVER: YOU AND REVNU AGREE THAT EACH MAY BRING CLAIMS AGAINST THE OTHER ONLY IN YOUR OR ITS INDIVIDUAL CAPACITY, AND NOT AS A PLAINTIFF OR CLASS MEMBER IN ANY PURPORTED CLASS OR REPRESENTATIVE PROCEEDING.
              </p>
              <p>
                You waive your right to participate in a class action lawsuit or class-wide arbitration.
              </p>
            </div>
          </section>

          {/* 10. Termination */}
          <section className="bg-revnu-dark/50 p-6 rounded-xl border border-revnu-green/20">
            <h2 className="text-2xl font-bold text-white mb-4">10. Termination</h2>
            <div className="text-revnu-gray space-y-4">
              <p>
                REVNU may suspend or terminate your access to the Service immediately, without prior notice or liability, for any reason, including but not limited to:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Violation of these Terms</li>
                <li>Violation of TCPA or other applicable laws</li>
                <li>Receipt of complaints about your use of the Service</li>
                <li>Evidence of abuse, harassment, or spam</li>
                <li>Non-payment of fees</li>
              </ul>
              <p>
                Upon termination, your right to use the Service will immediately cease. Sections 6 (Indemnification), 7 (Disclaimer), 8 (Limitation of Liability), and 9 (Arbitration) shall survive termination.
              </p>
            </div>
          </section>

          {/* 11. Governing Law */}
          <section className="bg-revnu-dark/50 p-6 rounded-xl border border-revnu-green/20">
            <h2 className="text-2xl font-bold text-white mb-4">11. Governing Law</h2>
            <div className="text-revnu-gray space-y-4">
              <p>
                These Terms shall be governed by and construed in accordance with the laws of the United States and the State of [Your State], without regard to conflict of law principles.
              </p>
            </div>
          </section>

          {/* 12. Contact Information */}
          <section className="bg-revnu-dark/50 p-6 rounded-xl border border-revnu-green/20">
            <h2 className="text-2xl font-bold text-white mb-4">12. Contact Information</h2>
            <div className="text-revnu-gray space-y-4">
              <p>If you have questions about these Terms, please contact us at:</p>
              <p className="text-white">
                Email: legal@revnu.com<br />
                Address: [Your Business Address]
              </p>
            </div>
          </section>

          {/* Acknowledgment */}
          <section className="bg-revnu-green/10 p-6 rounded-xl border-2 border-revnu-green/30">
            <p className="text-white font-bold">
              BY USING REVNU, YOU ACKNOWLEDGE THAT YOU HAVE READ, UNDERSTOOD, AND AGREE TO BE BOUND BY THESE TERMS OF SERVICE.
            </p>
          </section>
        </div>

        {/* Back to Home */}
        <div className="mt-12 text-center">
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-gradient-to-r from-revnu-green to-revnu-greenDark text-revnu-dark font-black rounded-lg hover:from-revnu-greenLight hover:to-revnu-green transition"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
