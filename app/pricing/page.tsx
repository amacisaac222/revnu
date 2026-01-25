"use client";

import { useState } from "react";
import Link from "next/link";
import { Check } from "lucide-react";

export default function PricingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-revnu-dark text-white">
      {/* Header */}
      <header className="bg-revnu-darker/80 backdrop-blur-sm border-b border-revnu-slate/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between">
          <Link href="/" className="hover:opacity-90 transition">
            <img src="/logo-new.svg" alt="REVNU" className="h-8 sm:h-10" />
          </Link>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-revnu-gray hover:text-white transition min-h-[44px] min-w-[44px]"
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-4">
            <Link
              href="/sign-in"
              className="text-sm font-bold text-revnu-gray hover:text-white transition min-h-[44px] flex items-center"
            >
              Sign In
            </Link>
            <Link
              href="/sign-up"
              className="px-5 py-3 bg-revnu-green text-revnu-dark font-black rounded-lg hover:bg-revnu-greenLight transition text-sm min-h-[44px] flex items-center"
            >
              Get Started
            </Link>
          </nav>
        </div>

        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-50 bg-revnu-darker">
            <div className="flex flex-col h-full">
              {/* Mobile Menu Header */}
              <div className="flex items-center justify-between p-6 border-b border-revnu-slate/50">
                <img src="/logo-new.svg" alt="REVNU" className="h-8" />
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 text-revnu-gray hover:text-white transition min-h-[44px] min-w-[44px]"
                  aria-label="Close menu"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Mobile Menu Links */}
              <nav className="flex flex-col p-6 space-y-2 overflow-y-auto">
                <Link
                  href="/sign-in"
                  className="text-base font-medium text-revnu-gray hover:text-white py-4 px-4 rounded-lg hover:bg-revnu-slate/40 transition min-h-[48px] flex items-center"
                >
                  Sign In
                </Link>
                <Link
                  href="/sign-up"
                  className="mt-4 px-6 py-4 text-base font-bold text-white bg-revnu-green rounded-lg hover:bg-revnu-greenDark transition-all min-h-[52px] flex items-center justify-center"
                >
                  Get Started
                </Link>
              </nav>
            </div>
          </div>
        )}
      </header>

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
        <div className="relative bg-gradient-to-br from-revnu-green/20 to-revnu-green/5 border-2 border-revnu-green shadow-2xl shadow-revnu-green/20 rounded-2xl p-12">
          <div className="absolute -top-4 left-1/2 -translate-x-1/2">
            <span className="bg-revnu-green text-revnu-dark px-6 py-2 rounded-full text-sm font-black uppercase">
              Everything Included
            </span>
          </div>

          <div className="text-center mb-12">
            <div className="flex items-baseline justify-center gap-2 mb-4">
              <span className="text-7xl font-black text-white">$99</span>
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
                <span className="text-white font-medium">{feature}</span>
              </div>
            ))}
          </div>

          <Link
            href="/sign-up"
            className="block w-full text-center px-8 py-5 bg-gradient-to-r from-revnu-green to-revnu-greenDark text-revnu-dark font-black text-xl rounded-lg hover:from-revnu-greenLight hover:to-revnu-green shadow-lg hover:scale-105 transform transition-all"
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
          <div className="text-center p-8 bg-revnu-slate/40 border border-revnu-green/20 rounded-xl">
            <div className="text-5xl mb-4">💳</div>
            <h3 className="text-xl font-bold text-white mb-3">No Hidden Fees</h3>
            <p className="text-revnu-gray">
              $99/month flat rate. No per-message charges. No transaction fees (Stripe fees apply separately).
            </p>
          </div>

          <div className="text-center p-8 bg-revnu-slate/40 border border-revnu-green/20 rounded-xl">
            <div className="text-5xl mb-4">⚡</div>
            <h3 className="text-xl font-bold text-white mb-3">Setup in Minutes</h3>
            <p className="text-revnu-gray">
              Import your invoices via CSV or QuickBooks. Configure your first sequence. Start collecting.
            </p>
          </div>

          <div className="text-center p-8 bg-revnu-slate/40 border border-revnu-green/20 rounded-xl">
            <div className="text-5xl mb-4">🛡️</div>
            <h3 className="text-xl font-bold text-white mb-3">TCPA Compliant</h3>
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
          <div className="bg-revnu-slate/40 p-6 rounded-xl border border-revnu-green/20">
            <h3 className="font-bold mb-2">Do I need a credit card for the free trial?</h3>
            <p className="text-sm text-revnu-gray">
              No! Start your 14-day free trial with no credit card required. You'll only be charged
              when you choose to continue after your trial ends.
            </p>
          </div>

          <div className="bg-revnu-slate/40 p-6 rounded-xl border border-revnu-green/20">
            <h3 className="font-bold text-white mb-2">What happens when I hit my message limit?</h3>
            <p className="text-sm text-revnu-gray">
              You'll receive a notification when you're approaching your 500 SMS or 1,000 email limit.
              Additional messages can be purchased in packs, or your credits automatically reset at the
              start of your next billing cycle.
            </p>
          </div>

          <div className="bg-revnu-slate/40 p-6 rounded-xl border border-revnu-green/20">
            <h3 className="font-bold text-white mb-2">Can I cancel anytime?</h3>
            <p className="text-sm text-revnu-gray">
              Yes, you can cancel your subscription at any time. Your service will continue until
              the end of your current billing period, and you won't be charged again.
            </p>
          </div>

          <div className="bg-revnu-slate/40 p-6 rounded-xl border border-revnu-green/20">
            <h3 className="font-bold text-white mb-2">Is REVNU TCPA compliant?</h3>
            <p className="text-sm text-revnu-gray">
              Yes! REVNU includes built-in TCPA compliance tools including consent tracking, opt-out
              management, time-of-day restrictions, and frequency limits. However, you are ultimately
              responsible for obtaining proper consent before sending messages.
            </p>
          </div>

          <div className="bg-revnu-slate/40 p-6 rounded-xl border border-revnu-green/20">
            <h3 className="font-bold text-white mb-2">Do you integrate with QuickBooks?</h3>
            <p className="text-sm text-revnu-gray">
              Yes! REVNU integrates with QuickBooks Online to automatically sync your unpaid invoices
              and customer data. You can also import invoices via CSV or add them manually.
            </p>
          </div>

          <div className="bg-revnu-slate/40 p-6 rounded-xl border border-revnu-green/20">
            <h3 className="font-bold text-white mb-2">How does payment processing work?</h3>
            <p className="text-sm text-revnu-gray">
              REVNU generates payment links that you can customize. Use Stripe for online payments
              (standard Stripe fees apply), or link to your existing payment portals like QuickBooks,
              PayPal, or Venmo. You can also record manual payments (checks, cash, bank transfers).
            </p>
          </div>

          <div className="bg-revnu-slate/40 p-6 rounded-xl border border-revnu-green/20">
            <h3 className="font-bold text-white mb-2">Is REVNU a debt collection agency?</h3>
            <p className="text-sm text-revnu-gray">
              No. REVNU is a software platform that helps YOU send payment reminders from YOUR business.
              We are not a third-party debt collector. Messages are sent from your business name,
              not ours.
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-br from-revnu-green/20 to-revnu-green/5 border-y-2 border-revnu-green/30 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-black mb-4">
            Ready to Get Paid Faster?
          </h2>
          <p className="text-lg text-revnu-gray mb-8">
            Join hundreds of contractors automating their collections with REVNU
          </p>
          <Link
            href="/sign-up"
            className="inline-block px-8 py-4 bg-gradient-to-r from-revnu-green to-revnu-greenDark text-revnu-dark font-black rounded-lg hover:from-revnu-greenLight hover:to-revnu-green transition shadow-lg shadow-revnu-green/20 text-lg"
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
