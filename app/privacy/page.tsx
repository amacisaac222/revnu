import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPolicyPage() {
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
        <h1 className="text-4xl font-bold text-white mb-2">Privacy Policy</h1>
        <p className="text-gray-400 mb-8">Last Updated: January 6, 2026</p>

        <div className="space-y-8 text-gray-300">
          {/* Section 1 */}
          <section className="border-l-2 border-revnu-green/30 pl-6">
            <h2 className="text-2xl font-semibold text-white mb-4">
              1. Introduction
            </h2>
            <p className="mb-4">
              REVNU (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our payment reminder software platform (the &quot;Service&quot;).
            </p>
            <p>
              By using the Service, you agree to the collection and use of information in accordance with this Privacy Policy. If you do not agree with our policies and practices, please do not use the Service.
            </p>
          </section>

          {/* Section 2 */}
          <section className="border-l-2 border-revnu-green/30 pl-6">
            <h2 className="text-2xl font-semibold text-white mb-4">
              2. Information We Collect
            </h2>

            <h3 className="text-xl font-semibold text-white mb-3 mt-4">
              2.1 Information You Provide to Us
            </h3>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>Account Information:</strong> Name, email address, phone number, company name, billing address</li>
              <li><strong>Payment Information:</strong> Credit card details (processed securely through third-party payment processors)</li>
              <li><strong>Customer Data:</strong> Information about your customers including names, phone numbers, email addresses, and invoice details that you upload to the Service</li>
              <li><strong>Communication Content:</strong> SMS and email message content, templates, and sending history</li>
              <li><strong>Support Communications:</strong> Information you provide when contacting customer support</li>
            </ul>

            <h3 className="text-xl font-semibold text-white mb-3 mt-4">
              2.2 Information Automatically Collected
            </h3>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>Usage Data:</strong> Pages visited, features used, time spent on the Service, click patterns</li>
              <li><strong>Device Information:</strong> IP address, browser type, operating system, device identifiers</li>
              <li><strong>Cookies and Tracking:</strong> We use cookies and similar technologies to track activity and store preferences</li>
              <li><strong>Message Delivery Data:</strong> Delivery status, open rates, response rates for SMS and email messages</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="border-l-2 border-revnu-green/30 pl-6">
            <h2 className="text-2xl font-semibold text-white mb-4">
              3. How We Use Your Information
            </h2>
            <p className="mb-3">We use the information we collect to:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Provide, operate, and maintain the Service</li>
              <li>Process your transactions and send you related information</li>
              <li>Send you technical notices, updates, security alerts, and support messages</li>
              <li>Respond to your comments, questions, and customer service requests</li>
              <li>Send SMS and email messages on your behalf to your customers</li>
              <li>Monitor and analyze usage and trends to improve the Service</li>
              <li>Detect, prevent, and address technical issues and security vulnerabilities</li>
              <li>Comply with legal obligations and enforce our Terms of Service</li>
              <li>Provide customer support and troubleshooting</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="border-l-2 border-revnu-green/30 pl-6">
            <h2 className="text-2xl font-semibold text-white mb-4">
              4. How We Share Your Information
            </h2>
            <p className="mb-3">We may share your information in the following situations:</p>

            <h3 className="text-xl font-semibold text-white mb-3 mt-4">
              4.1 Service Providers
            </h3>
            <p className="mb-3">
              We share information with third-party vendors who perform services on our behalf:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>SMS Providers:</strong> To deliver text messages to your customers</li>
              <li><strong>Email Providers:</strong> To deliver email messages to your customers</li>
              <li><strong>Payment Processors:</strong> To process your subscription payments</li>
              <li><strong>Cloud Hosting:</strong> To store and process data securely</li>
              <li><strong>Analytics Providers:</strong> To understand Service usage patterns</li>
            </ul>

            <h3 className="text-xl font-semibold text-white mb-3 mt-4">
              4.2 Legal Requirements
            </h3>
            <p className="mb-3">
              We may disclose your information if required to do so by law or in response to:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Valid legal processes (subpoenas, court orders, search warrants)</li>
              <li>Government or regulatory investigations</li>
              <li>Requests from law enforcement</li>
              <li>Protection of our legal rights or those of others</li>
            </ul>

            <h3 className="text-xl font-semibold text-white mb-3 mt-4">
              4.3 Business Transfers
            </h3>
            <p>
              In the event of a merger, acquisition, or sale of assets, your information may be transferred to the acquiring entity.
            </p>

            <h3 className="text-xl font-semibold text-white mb-3 mt-4">
              4.4 With Your Consent
            </h3>
            <p>
              We may share your information for any other purpose with your explicit consent.
            </p>
          </section>

          {/* Section 5 */}
          <section className="border-l-2 border-revnu-green/30 pl-6">
            <h2 className="text-2xl font-semibold text-white mb-4">
              5. TCPA Compliance and Message Recipient Data
            </h2>
            <div className="bg-revnu-green/10 border border-revnu-green/30 rounded-lg p-4 mb-4">
              <p className="text-revnu-green font-semibold mb-2">IMPORTANT NOTICE:</p>
              <p className="text-sm">
                You are solely responsible for ensuring you have proper consent before sending SMS or email messages to recipients through our Service. We do not verify consent on your behalf.
              </p>
            </div>
            <p className="mb-3">
              Regarding message recipients (your customers who receive messages through REVNU):
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>We act as your service provider and process recipient data on your instructions</li>
              <li>You are the data controller responsible for obtaining proper consent</li>
              <li>Recipients have the right to opt-out by replying STOP to any message</li>
              <li>We automatically process opt-out requests and cease messaging</li>
              <li>You must maintain records of consent for all message recipients</li>
              <li>We do not use recipient phone numbers or emails for any purpose other than delivering your messages</li>
            </ul>
          </section>

          {/* Section 6 */}
          <section className="border-l-2 border-revnu-green/30 pl-6">
            <h2 className="text-2xl font-semibold text-white mb-4">
              6. Data Retention
            </h2>
            <p className="mb-3">
              We retain your information for as long as your account is active or as needed to provide you the Service. Specific retention periods:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>Account Data:</strong> Retained while your account is active, plus 90 days after cancellation</li>
              <li><strong>Message History:</strong> Retained for 7 years to comply with TCPA recordkeeping requirements</li>
              <li><strong>Payment Records:</strong> Retained for 7 years to comply with tax and accounting regulations</li>
              <li><strong>Audit Logs:</strong> Retained for 3 years for security and compliance purposes</li>
            </ul>
            <p className="mt-4">
              You may request deletion of your data by contacting us at privacy@revnu.com. Note that some data may be retained as required by law.
            </p>
          </section>

          {/* Section 7 */}
          <section className="border-l-2 border-revnu-green/30 pl-6">
            <h2 className="text-2xl font-semibold text-white mb-4">
              7. Data Security
            </h2>
            <p className="mb-3">
              We implement appropriate technical and organizational security measures to protect your information:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Encryption of data in transit using TLS/SSL</li>
              <li>Encryption of sensitive data at rest</li>
              <li>Regular security assessments and penetration testing</li>
              <li>Access controls and authentication requirements</li>
              <li>Employee training on data security and privacy</li>
              <li>Incident response and breach notification procedures</li>
            </ul>
            <p className="mt-4">
              However, no method of transmission over the Internet or electronic storage is 100% secure. While we strive to protect your information, we cannot guarantee absolute security.
            </p>
          </section>

          {/* Section 8 */}
          <section className="border-l-2 border-revnu-green/30 pl-6">
            <h2 className="text-2xl font-semibold text-white mb-4">
              8. Your Privacy Rights
            </h2>
            <p className="mb-3">
              Depending on your location, you may have the following rights regarding your personal information:
            </p>

            <h3 className="text-xl font-semibold text-white mb-3 mt-4">
              8.1 General Rights
            </h3>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>Access:</strong> Request a copy of the personal information we hold about you</li>
              <li><strong>Correction:</strong> Request correction of inaccurate or incomplete information</li>
              <li><strong>Deletion:</strong> Request deletion of your personal information (subject to legal retention requirements)</li>
              <li><strong>Data Portability:</strong> Request a copy of your data in a structured, machine-readable format</li>
              <li><strong>Objection:</strong> Object to our processing of your personal information</li>
              <li><strong>Restriction:</strong> Request restriction of processing in certain circumstances</li>
            </ul>

            <h3 className="text-xl font-semibold text-white mb-3 mt-4">
              8.2 California Privacy Rights (CCPA)
            </h3>
            <p className="mb-3">
              If you are a California resident, you have additional rights under the California Consumer Privacy Act:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Right to know what personal information is collected, used, shared, or sold</li>
              <li>Right to delete personal information held by us</li>
              <li>Right to opt-out of the sale of personal information (we do not sell personal information)</li>
              <li>Right to non-discrimination for exercising your privacy rights</li>
            </ul>

            <h3 className="text-xl font-semibold text-white mb-3 mt-4">
              8.3 European Privacy Rights (GDPR)
            </h3>
            <p className="mb-3">
              If you are in the European Economic Area, you have rights under the General Data Protection Regulation including the rights listed above plus:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Right to lodge a complaint with a supervisory authority</li>
              <li>Right to withdraw consent at any time (where processing is based on consent)</li>
            </ul>

            <p className="mt-4">
              To exercise any of these rights, contact us at privacy@revnu.com. We will respond within 30 days.
            </p>
          </section>

          {/* Section 9 */}
          <section className="border-l-2 border-revnu-green/30 pl-6">
            <h2 className="text-2xl font-semibold text-white mb-4">
              9. Cookies and Tracking Technologies
            </h2>
            <p className="mb-3">
              We use cookies and similar tracking technologies to track activity on our Service:
            </p>

            <h3 className="text-xl font-semibold text-white mb-3 mt-4">
              Types of Cookies We Use:
            </h3>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>Essential Cookies:</strong> Required for the Service to function (authentication, security)</li>
              <li><strong>Performance Cookies:</strong> Collect information about how you use the Service</li>
              <li><strong>Functional Cookies:</strong> Remember your preferences and settings</li>
              <li><strong>Analytics Cookies:</strong> Help us understand usage patterns and improve the Service</li>
            </ul>

            <p className="mt-4">
              You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use some portions of the Service.
            </p>
          </section>

          {/* Section 10 */}
          <section className="border-l-2 border-revnu-green/30 pl-6">
            <h2 className="text-2xl font-semibold text-white mb-4">
              10. Third-Party Links and Services
            </h2>
            <p className="mb-3">
              Our Service may contain links to third-party websites or integrate with third-party services. We are not responsible for the privacy practices of these third parties. We encourage you to read the privacy policies of every website you visit and service you use.
            </p>
            <p>
              Third-party services we integrate with include payment processors, SMS providers, email providers, and analytics services. Each has their own privacy policy governing their use of your information.
            </p>
          </section>

          {/* Section 11 */}
          <section className="border-l-2 border-revnu-green/30 pl-6">
            <h2 className="text-2xl font-semibold text-white mb-4">
              11. Children&apos;s Privacy
            </h2>
            <p className="mb-3">
              Our Service is not intended for individuals under the age of 18. We do not knowingly collect personal information from children under 18. If you are a parent or guardian and believe your child has provided us with personal information, please contact us at privacy@revnu.com.
            </p>
            <p>
              If we become aware that we have collected personal information from children without verification of parental consent, we will take steps to remove that information from our servers.
            </p>
          </section>

          {/* Section 12 */}
          <section className="border-l-2 border-revnu-green/30 pl-6">
            <h2 className="text-2xl font-semibold text-white mb-4">
              12. International Data Transfers
            </h2>
            <p className="mb-3">
              Your information may be transferred to and maintained on computers located outside of your state, province, country, or other governmental jurisdiction where data protection laws may differ.
            </p>
            <p className="mb-3">
              If you are located outside the United States and choose to provide information to us, please note that we transfer the data, including personal information, to the United States and process it there.
            </p>
            <p>
              By using the Service, you consent to the transfer of your information to the United States and the processing of your information in accordance with this Privacy Policy.
            </p>
          </section>

          {/* Section 13 */}
          <section className="border-l-2 border-revnu-green/30 pl-6">
            <h2 className="text-2xl font-semibold text-white mb-4">
              13. Changes to This Privacy Policy
            </h2>
            <p className="mb-3">
              We may update our Privacy Policy from time to time. We will notify you of any changes by:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Posting the new Privacy Policy on this page</li>
              <li>Updating the &quot;Last Updated&quot; date at the top of this Privacy Policy</li>
              <li>Sending you an email notification for material changes</li>
            </ul>
            <p className="mt-4">
              You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they are posted on this page.
            </p>
          </section>

          {/* Section 14 */}
          <section className="border-l-2 border-revnu-green/30 pl-6">
            <h2 className="text-2xl font-semibold text-white mb-4">
              14. Do Not Track Signals
            </h2>
            <p>
              We do not currently respond to Do Not Track (DNT) signals from web browsers. We may adopt a DNT standard in the future if one is established and becomes industry standard.
            </p>
          </section>

          {/* Section 15 */}
          <section className="border-l-2 border-revnu-green/30 pl-6">
            <h2 className="text-2xl font-semibold text-white mb-4">
              15. Contact Us
            </h2>
            <p className="mb-4">
              If you have any questions about this Privacy Policy, please contact us:
            </p>
            <div className="bg-revnu-darker border border-revnu-green/20 rounded-lg p-6">
              <p className="mb-2">
                <strong className="text-white">Email:</strong>{" "}
                <a
                  href="mailto:privacy@revnu.com"
                  className="text-revnu-green hover:underline"
                >
                  privacy@revnu.com
                </a>
              </p>
              <p className="mb-2">
                <strong className="text-white">Data Protection Officer:</strong>{" "}
                <a
                  href="mailto:dpo@revnu.com"
                  className="text-revnu-green hover:underline"
                >
                  dpo@revnu.com
                </a>
              </p>
              <p>
                <strong className="text-white">Support:</strong>{" "}
                <a
                  href="mailto:support@revnu.com"
                  className="text-revnu-green hover:underline"
                >
                  support@revnu.com
                </a>
              </p>
            </div>
          </section>

          {/* Footer notice */}
          <div className="mt-12 pt-8 border-t border-revnu-green/20">
            <p className="text-sm text-gray-500 text-center">
              This Privacy Policy was last updated on January 6, 2026. By continuing to use the Service after changes are posted, you accept the updated Privacy Policy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
