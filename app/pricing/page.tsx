import Link from "next/link";
import { Check } from "lucide-react";

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-white text-revnu-darker">
      {/* Header */}
      <div className="border-b border-revnu-grayLight">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/" className="hover:opacity-90 transition">
            <img src="/logo.svg" alt="REVNU" className="h-10" />
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/sign-in"
              className="text-sm font-bold text-revnu-gray hover:text-revnu-dark transition"
            >
              Sign In
            </Link>
            <Link
              href="/sign-up"
              className="px-4 py-2 bg-revnu-green text-white font-black rounded-lg hover:bg-revnu-greenDark transition text-sm"
            >
              Get Started
            </Link>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6">
          Simple, Transparent Pricing
        </h1>
        <p className="text-xl text-revnu-gray max-w-3xl mx-auto mb-4">
          One plan. Everything included. No hidden fees.
        </p>
        <p className="text-lg text-revnu-green font-bold">
          14-day free trial • No credit card required
        </p>
      </div>

      {/* Main Pricing Card */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="relative bg-white border-2 border-revnu-green shadow-xl rounded-2xl p-12">
          <div className="absolute -top-4 left-1/2 -translate-x-1/2">
            <span className="bg-revnu-green text-white px-6 py-2 rounded-full text-sm font-black uppercase">
              Everything Included
            </span>
          </div>

          <div className="text-center mb-12">
            <div className="flex items-baseline justify-center gap-2 mb-4">
              <span className="text-7xl font-black text-revnu-darker">$99</span>
              <span className="text-2xl text-revnu-gray">/month</span>
            </div>
            <p className="text-lg text-revnu-gray">
              Unlimited customers, invoices, and reminders
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-x-12 gap-y-6 mb-12">
            {[
              "Unlimited customers & invoices",
              "Unlimited automated sequences",
              "500 SMS messages/month",
              "1,000 emails/month",
              "SMS & email reminders",
              "AI-powered message templates",
              "Payment link generation",
              "Custom payment URLs (QuickBooks, PayPal, etc.)",
              "QuickBooks integration",
              "Real-time analytics dashboard",
              "TCPA compliance tools",
              "Opt-out management",
              "Time-of-day restrictions",
              "Frequency limits (Regulation F)",
              "Complete audit logs",
              "Up to 5 team members",
              "Priority email support",
              "Mobile-optimized interface",
            ].map((feature) => (
              <div key={feature} className="flex items-start gap-3">
                <Check className="w-6 h-6 text-revnu-green flex-shrink-0 mt-0.5" />
                <span className="text-revnu-darker font-medium">{feature}</span>
              </div>
            ))}
          </div>

          <Link
            href="/sign-up"
            className="block w-full text-center px-8 py-5 bg-revnu-green text-white font-black text-xl rounded-lg hover:bg-revnu-greenDark shadow-lg hover:scale-105 transform transition-all"
          >
            Start Your Free 14-Day Trial
          </Link>

          <p className="text-center text-sm text-revnu-gray mt-6">
            No credit card required • Cancel anytime • No setup fees
          </p>
        </div>
      </div>

      {/* Value Props */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center p-8 bg-revnu-slate border border-revnu-grayLight rounded-xl">
            <div className="text-5xl mb-4">💳</div>
            <h3 className="text-xl font-bold text-revnu-darker mb-3">No Hidden Fees</h3>
            <p className="text-revnu-gray">
              $99/month flat rate. No per-message charges. No transaction fees (Stripe fees apply separately).
            </p>
          </div>

          <div className="text-center p-8 bg-revnu-slate border border-revnu-grayLight rounded-xl">
            <div className="text-5xl mb-4">⚡</div>
            <h3 className="text-xl font-bold text-revnu-darker mb-3">Setup in Minutes</h3>
            <p className="text-revnu-gray">
              Import your invoices via CSV or QuickBooks. Configure your first sequence. Start collecting.
            </p>
          </div>

          <div className="text-center p-8 bg-revnu-slate border border-revnu-grayLight rounded-xl">
            <div className="text-5xl mb-4">🛡️</div>
            <h3 className="text-xl font-bold text-revnu-darker mb-3">TCPA Compliant</h3>
            <p className="text-revnu-gray">
              Built-in compliance tools. Automatic opt-outs. Quiet hours enforced. Frequency limits.
            </p>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <h2 className="text-3xl font-black text-center mb-12">
          Frequently Asked Questions
        </h2>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-revnu-grayLight">
            <h3 className="font-bold text-revnu-darker mb-2">Do I need a credit card for the free trial?</h3>
            <p className="text-sm text-revnu-gray">
              No! Start your 14-day free trial with no credit card required. You'll only be charged
              when you choose to continue after your trial ends.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-revnu-grayLight">
            <h3 className="font-bold text-revnu-darker mb-2">What happens when I hit my message limit?</h3>
            <p className="text-sm text-revnu-gray">
              You'll receive a notification when you're approaching your 500 SMS or 1,000 email limit.
              Additional messages can be purchased in packs, or your credits automatically reset at the
              start of your next billing cycle.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-revnu-grayLight">
            <h3 className="font-bold text-revnu-darker mb-2">Can I cancel anytime?</h3>
            <p className="text-sm text-revnu-gray">
              Yes, you can cancel your subscription at any time. Your service will continue until
              the end of your current billing period, and you won't be charged again.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-revnu-grayLight">
            <h3 className="font-bold text-revnu-darker mb-2">Is REVNU TCPA compliant?</h3>
            <p className="text-sm text-revnu-gray">
              Yes! REVNU includes built-in TCPA compliance tools including consent tracking, opt-out
              management, time-of-day restrictions, and frequency limits. However, you are ultimately
              responsible for obtaining proper consent before sending messages.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-revnu-grayLight">
            <h3 className="font-bold text-revnu-darker mb-2">Do you integrate with QuickBooks?</h3>
            <p className="text-sm text-revnu-gray">
              Yes! REVNU integrates with QuickBooks Online to automatically sync your unpaid invoices
              and customer data. You can also import invoices via CSV or add them manually.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-revnu-grayLight">
            <h3 className="font-bold text-revnu-darker mb-2">How does payment processing work?</h3>
            <p className="text-sm text-revnu-gray">
              REVNU generates payment links that you can customize. Use Stripe for online payments
              (standard Stripe fees apply), or link to your existing payment portals like QuickBooks,
              PayPal, or Venmo. You can also record manual payments (checks, cash, bank transfers).
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-revnu-grayLight">
            <h3 className="font-bold text-revnu-darker mb-2">Is REVNU a debt collection agency?</h3>
            <p className="text-sm text-revnu-gray">
              No. REVNU is a software platform that helps YOU send payment reminders from YOUR business.
              We are not a third-party debt collector. Messages are sent from your business name,
              not ours.
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-revnu-lightGray border-y-2 border-revnu-grayLight py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-black text-revnu-darker mb-4">
            Ready to Get Paid Faster?
          </h2>
          <p className="text-lg text-revnu-gray mb-8">
            Join hundreds of contractors automating their collections with REVNU
          </p>
          <Link
            href="/sign-up"
            className="inline-block px-8 py-4 bg-revnu-green text-white font-black rounded-lg hover:bg-revnu-greenDark transition shadow-lg text-lg"
          >
            Start Your Free 14-Day Trial
          </Link>
          <p className="text-xs text-revnu-gray mt-4">
            No credit card required • Cancel anytime
          </p>
        </div>
      </div>

      <script
        dangerouslySetInnerHTML={{
          __html: `
            document.getElementById('billing-toggle').addEventListener('change', function(e) {
              const monthlyEls = document.querySelectorAll('.billing-monthly');
              const annualEls = document.querySelectorAll('.billing-annual');

              if (e.target.checked) {
                monthlyEls.forEach(el => el.classList.add('hidden'));
                annualEls.forEach(el => el.classList.remove('hidden'));
              } else {
                monthlyEls.forEach(el => el.classList.remove('hidden'));
                annualEls.forEach(el => el.classList.add('hidden'));
              }
            });
          `,
        }}
      />
    </div>
  );
}
