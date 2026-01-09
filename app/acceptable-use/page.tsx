import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function AcceptableUsePolicyPage() {
  return (
    <div className="min-h-screen bg-revnu-dark">
      {/* Header */}
      <header className="border-b border-revnu-green/20 bg-revnu-darker">
        <div className="mx-auto max-w-4xl px-4 py-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-revnu-green transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </header>

      {/* Content */}
      <div className="mx-auto max-w-4xl px-4 py-12">
        <h1 className="text-4xl font-bold text-white mb-2">
          Acceptable Use Policy
        </h1>
        <p className="text-gray-400 mb-8">Last Updated: January 6, 2026</p>

        <div className="space-y-8 text-gray-300">
          {/* Section 1 */}
          <section className="border-l-2 border-revnu-green/30 pl-6">
            <h2 className="text-2xl font-semibold text-white mb-4">
              1. Purpose and Scope
            </h2>
            <p className="mb-4">
              This Acceptable Use Policy (&quot;AUP&quot;) governs your use of REVNU&apos;s payment reminder software platform (the &quot;Service&quot;). This AUP is incorporated into and forms part of our Terms of Service.
            </p>
            <p className="mb-4">
              By using the Service, you agree to comply with this AUP. Violation of this AUP may result in immediate suspension or termination of your account without refund.
            </p>
            <div className="bg-revnu-green/10 border border-revnu-green/30 rounded-lg p-4">
              <p className="text-revnu-green font-semibold mb-2">
                CORE PRINCIPLE:
              </p>
              <p className="text-sm">
                REVNU is designed for legitimate business-to-business and business-to-consumer payment collection. Use of the Service for harassment, spam, fraud, or violation of consumer protection laws is strictly prohibited.
              </p>
            </div>
          </section>

          {/* Section 2 */}
          <section className="border-l-2 border-revnu-green/30 pl-6">
            <h2 className="text-2xl font-semibold text-white mb-4">
              2. Prohibited Uses
            </h2>
            <p className="mb-4">
              You may NOT use the Service for any of the following purposes:
            </p>

            <h3 className="text-xl font-semibold text-white mb-3 mt-4">
              2.1 Illegal Activities
            </h3>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Any activity that violates local, state, federal, or international law</li>
              <li>Collection of debts that you do not have a legal right to collect</li>
              <li>Fraudulent or deceptive practices of any kind</li>
              <li>Money laundering or terrorist financing</li>
              <li>Collection of gambling debts or debts related to illegal activities</li>
              <li>Extortion, threats, or blackmail</li>
            </ul>

            <h3 className="text-xl font-semibold text-white mb-3 mt-4">
              2.2 TCPA and Consent Violations
            </h3>
            <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 mb-4">
              <p className="text-red-400 font-semibold mb-2">
                CRITICAL REQUIREMENT:
              </p>
              <p className="text-sm">
                You MUST have prior express written consent before sending SMS messages to any recipient. Violations carry penalties of $500-$1,500 per message.
              </p>
            </div>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Sending SMS messages without prior express written consent from recipients</li>
              <li>Sending messages to numbers obtained through scraping, purchasing lists, or guessing</li>
              <li>Continuing to message recipients who have opted out or requested to stop receiving messages</li>
              <li>Using auto-dialers or automated systems without proper consent</li>
              <li>Sending messages to phone numbers on the National Do Not Call Registry without a pre-existing business relationship</li>
              <li>Failing to honor opt-out requests within 10 business days</li>
              <li>Sending messages outside of 8 AM - 9 PM recipient&apos;s local time</li>
            </ul>

            <h3 className="text-xl font-semibold text-white mb-3 mt-4">
              2.3 Harassment and Abuse
            </h3>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Harassing, threatening, or abusing message recipients</li>
              <li>Sending excessive or repetitive messages that constitute harassment</li>
              <li>Using profane, obscene, or abusive language</li>
              <li>Making false or misleading statements about debts owed</li>
              <li>Threatening actions you cannot legally take or do not intend to take</li>
              <li>Disclosing debt information to third parties without authorization</li>
              <li>Continuing contact after recipient requests communication through attorney only</li>
            </ul>

            <h3 className="text-xl font-semibold text-white mb-3 mt-4">
              2.4 Spam and Unsolicited Messages
            </h3>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Sending unsolicited commercial messages or marketing content</li>
              <li>Bulk messaging to recipients who have not consented to receive messages from you</li>
              <li>Using the Service for general marketing purposes unrelated to payment collection</li>
              <li>Sending phishing messages or messages containing malware</li>
              <li>Using misleading sender information or subject lines</li>
              <li>Failing to include required opt-out instructions in messages</li>
            </ul>

            <h3 className="text-xl font-semibold text-white mb-3 mt-4">
              2.5 Third-Party Debt Collection
            </h3>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Acting as a third-party debt collector without proper licensing</li>
              <li>Collecting debts on behalf of others if you are not the original creditor</li>
              <li>Violating the Fair Debt Collection Practices Act (FDCPA) or state debt collection laws</li>
              <li>Making contact attempts that exceed legal limits</li>
              <li>Failing to provide required debt validation notices</li>
            </ul>

            <h3 className="text-xl font-semibold text-white mb-3 mt-4">
              2.6 Service Abuse
            </h3>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Attempting to circumvent Service limitations or restrictions</li>
              <li>Using the Service to harm, interfere with, or disrupt REVNU or third parties</li>
              <li>Reverse engineering, decompiling, or attempting to extract source code</li>
              <li>Sharing your account credentials with unauthorized users</li>
              <li>Reselling or white-labeling the Service without authorization</li>
              <li>Using the Service to send test messages or frivolous content</li>
              <li>Overloading our systems with excessive API calls or requests</li>
            </ul>

            <h3 className="text-xl font-semibold text-white mb-3 mt-4">
              2.7 Data Misuse
            </h3>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Uploading or storing personal information you do not have rights to use</li>
              <li>Violating the privacy rights of message recipients</li>
              <li>Failing to maintain proper security of customer data</li>
              <li>Selling, sharing, or disclosing recipient data to third parties</li>
              <li>Using recipient data for purposes other than payment collection</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="border-l-2 border-revnu-green/30 pl-6">
            <h2 className="text-2xl font-semibold text-white mb-4">
              3. Required Practices
            </h2>
            <p className="mb-4">
              When using the Service, you MUST:
            </p>

            <h3 className="text-xl font-semibold text-white mb-3 mt-4">
              3.1 Consent Management
            </h3>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Obtain and maintain documented prior express written consent for SMS messages</li>
              <li>Keep records of all consent for at least 4 years</li>
              <li>Include clear opt-out instructions in every message</li>
              <li>Honor all opt-out requests immediately and maintain do-not-contact lists</li>
              <li>Verify consent is still valid before resuming messages to inactive recipients</li>
            </ul>

            <h3 className="text-xl font-semibold text-white mb-3 mt-4">
              3.2 Message Content Requirements
            </h3>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Clearly identify yourself and your company in messages</li>
              <li>Accurately state the amount owed and nature of the debt</li>
              <li>Include opt-out instructions (e.g., &quot;Reply STOP to opt out&quot;)</li>
              <li>Provide contact information for questions or disputes</li>
              <li>Use professional, respectful language at all times</li>
              <li>Include required disclosures per applicable law</li>
            </ul>

            <h3 className="text-xl font-semibold text-white mb-3 mt-4">
              3.3 Timing and Frequency
            </h3>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Send messages only between 8 AM and 9 PM in the recipient&apos;s time zone</li>
              <li>Implement reasonable frequency limits to avoid harassment</li>
              <li>Respect recipient requests to limit contact frequency</li>
              <li>Stop all contact if recipient is represented by an attorney</li>
            </ul>

            <h3 className="text-xl font-semibold text-white mb-3 mt-4">
              3.4 Recordkeeping
            </h3>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Maintain records of all messages sent for at least 4 years</li>
              <li>Keep documentation of consent for at least 4 years</li>
              <li>Record and honor all opt-out requests</li>
              <li>Document all disputes and their resolutions</li>
              <li>Maintain audit logs of system access and changes</li>
            </ul>

            <h3 className="text-xl font-semibold text-white mb-3 mt-4">
              3.5 Data Security
            </h3>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Use strong passwords and enable two-factor authentication</li>
              <li>Limit account access to authorized personnel only</li>
              <li>Report any security incidents or data breaches immediately</li>
              <li>Comply with applicable data protection regulations (GDPR, CCPA, etc.)</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="border-l-2 border-revnu-green/30 pl-6">
            <h2 className="text-2xl font-semibold text-white mb-4">
              4. Industry-Specific Restrictions
            </h2>

            <h3 className="text-xl font-semibold text-white mb-3 mt-4">
              4.1 Prohibited Industries
            </h3>
            <p className="mb-3">The Service may NOT be used for collection related to:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Illegal goods or services</li>
              <li>Adult content or services</li>
              <li>Gambling or betting debts</li>
              <li>Payday loans or high-interest lending</li>
              <li>Cryptocurrency or speculative investments</li>
              <li>Pyramid schemes or multi-level marketing</li>
              <li>Tobacco or vaping products</li>
              <li>Weapons or explosives</li>
            </ul>

            <h3 className="text-xl font-semibold text-white mb-3 mt-4">
              4.2 Regulated Industries
            </h3>
            <p className="mb-3">
              If you operate in a regulated industry (healthcare, finance, legal), you are responsible for:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Complying with all industry-specific regulations</li>
              <li>Obtaining all necessary licenses and certifications</li>
              <li>Meeting additional consent and disclosure requirements</li>
              <li>Protecting sensitive information (HIPAA, GLBA, etc.)</li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="border-l-2 border-revnu-green/30 pl-6">
            <h2 className="text-2xl font-semibold text-white mb-4">
              5. Monitoring and Enforcement
            </h2>

            <h3 className="text-xl font-semibold text-white mb-3 mt-4">
              5.1 Our Rights
            </h3>
            <p className="mb-3">REVNU reserves the right to:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Monitor your use of the Service for compliance with this AUP</li>
              <li>Review message content and sending patterns</li>
              <li>Investigate complaints from message recipients</li>
              <li>Request documentation of consent or business relationships</li>
              <li>Suspend or terminate accounts that violate this AUP</li>
              <li>Report violations to law enforcement or regulatory authorities</li>
              <li>Refuse service to any user at our discretion</li>
            </ul>

            <h3 className="text-xl font-semibold text-white mb-3 mt-4">
              5.2 Enforcement Actions
            </h3>
            <p className="mb-3">
              Violations of this AUP may result in:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>Warning:</strong> First-time or minor violations may receive a warning</li>
              <li><strong>Temporary Suspension:</strong> Serious violations may result in account suspension pending investigation</li>
              <li><strong>Permanent Termination:</strong> Severe or repeated violations will result in immediate termination without refund</li>
              <li><strong>Legal Action:</strong> We may pursue legal remedies for damages caused by your violations</li>
              <li><strong>Regulatory Reporting:</strong> We may report violations to FTC, FCC, state attorneys general, or other authorities</li>
            </ul>

            <h3 className="text-xl font-semibold text-white mb-3 mt-4">
              5.3 User Reporting
            </h3>
            <p className="mb-3">
              If you believe another user is violating this AUP, please report it to:
            </p>
            <div className="bg-revnu-darker border border-revnu-green/20 rounded-lg p-4">
              <p>
                <strong className="text-white">Email:</strong>{" "}
                <a
                  href="mailto:abuse@revnu.com"
                  className="text-revnu-green hover:underline"
                >
                  abuse@revnu.com
                </a>
              </p>
            </div>
          </section>

          {/* Section 6 */}
          <section className="border-l-2 border-revnu-green/30 pl-6">
            <h2 className="text-2xl font-semibold text-white mb-4">
              6. Compliance Assistance
            </h2>
            <p className="mb-4">
              REVNU provides tools and features to help you comply with this AUP and applicable laws:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Automatic opt-out processing for STOP keywords</li>
              <li>Time zone-based sending restrictions (8 AM - 9 PM)</li>
              <li>Message delivery tracking and audit logs</li>
              <li>Consent status tracking per contact</li>
              <li>Templates with required disclosures and opt-out language</li>
              <li>Documentation and best practices guides</li>
            </ul>
            <p className="mt-4">
              However, YOU are ultimately responsible for ensuring your use of the Service complies with all applicable laws. These tools are provided as a convenience and do not guarantee compliance.
            </p>
          </section>

          {/* Section 7 */}
          <section className="border-l-2 border-revnu-green/30 pl-6">
            <h2 className="text-2xl font-semibold text-white mb-4">
              7. Your Responsibilities
            </h2>
            <div className="bg-revnu-green/10 border border-revnu-green/30 rounded-lg p-4 mb-4">
              <p className="text-revnu-green font-semibold mb-2">
                KEY RESPONSIBILITY:
              </p>
              <p className="text-sm">
                You are solely responsible for your use of the Service and any legal consequences that arise from your messaging practices. REVNU is a technology provider only.
              </p>
            </div>
            <p className="mb-3">You acknowledge and agree that:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>You are responsible for obtaining and documenting all necessary consents</li>
              <li>You will comply with TCPA, FDCPA, and all applicable laws</li>
              <li>You will maintain accurate records as required by law</li>
              <li>You will immediately cease contact upon receiving opt-out requests</li>
              <li>You will only message recipients with whom you have a legitimate business relationship</li>
              <li>You will indemnify REVNU for any claims arising from your use of the Service</li>
              <li>You are responsible for ensuring your message content is truthful and compliant</li>
              <li>You will cooperate with REVNU investigations into potential violations</li>
            </ul>
          </section>

          {/* Section 8 */}
          <section className="border-l-2 border-revnu-green/30 pl-6">
            <h2 className="text-2xl font-semibold text-white mb-4">
              8. Changes to This Policy
            </h2>
            <p className="mb-3">
              We may update this Acceptable Use Policy from time to time. When we make material changes:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>We will post the updated AUP on this page</li>
              <li>We will update the &quot;Last Updated&quot; date</li>
              <li>We will notify you via email for significant changes</li>
              <li>Continued use of the Service after changes constitutes acceptance</li>
            </ul>
            <p className="mt-4">
              It is your responsibility to review this AUP periodically. If you do not agree with any changes, you must stop using the Service.
            </p>
          </section>

          {/* Section 9 */}
          <section className="border-l-2 border-revnu-green/30 pl-6">
            <h2 className="text-2xl font-semibold text-white mb-4">
              9. Questions and Guidance
            </h2>
            <p className="mb-4">
              If you have questions about this Acceptable Use Policy or need guidance on compliance:
            </p>
            <div className="bg-revnu-darker border border-revnu-green/20 rounded-lg p-6">
              <p className="mb-2">
                <strong className="text-white">General Questions:</strong>{" "}
                <a
                  href="mailto:support@revnu.com"
                  className="text-revnu-green hover:underline"
                >
                  support@revnu.com
                </a>
              </p>
              <p className="mb-2">
                <strong className="text-white">Compliance Questions:</strong>{" "}
                <a
                  href="mailto:compliance@revnu.com"
                  className="text-revnu-green hover:underline"
                >
                  compliance@revnu.com
                </a>
              </p>
              <p>
                <strong className="text-white">Report Abuse:</strong>{" "}
                <a
                  href="mailto:abuse@revnu.com"
                  className="text-revnu-green hover:underline"
                >
                  abuse@revnu.com
                </a>
              </p>
            </div>
            <p className="mt-4 text-sm text-gray-400">
              <strong>Important:</strong> REVNU cannot provide legal advice. For questions about TCPA, FDCPA, or other legal requirements, consult with a qualified attorney.
            </p>
          </section>

          {/* Footer notice */}
          <div className="mt-12 pt-8 border-t border-revnu-green/20">
            <p className="text-sm text-gray-500 text-center">
              This Acceptable Use Policy was last updated on January 6, 2026. Violations may result in immediate account termination.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
