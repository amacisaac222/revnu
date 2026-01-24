import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import Footer from "@/components/footer";
import PublicLienCalculator from "@/components/lien/public-lien-calculator";
import ScrollingLogos from "@/components/scrolling-logos";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-revnu-dark">
      {/* Header - Dark Theme */}
      <header className="bg-revnu-darker/80 backdrop-blur-sm border-b border-revnu-slate/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-5 flex items-center justify-between">
          <Link href="/" className="hover:opacity-90 transition">
            <img src="/logo.svg" alt="REVNU" className="h-10" />
          </Link>
          <nav className="flex items-center gap-8">
            <SignedOut>
              <a href="#how-it-works" className="text-sm font-medium text-revnu-gray hover:text-white transition">
                How It Works
              </a>
              <a href="#features" className="text-sm font-medium text-revnu-gray hover:text-white transition">
                Features
              </a>
              <a href="#pricing" className="text-sm font-medium text-revnu-gray hover:text-white transition">
                Pricing
              </a>
              <Link
                href="/sign-in"
                className="text-sm font-medium text-revnu-gray hover:text-white transition"
              >
                Sign in
              </Link>
              <Link
                href="/sign-up"
                className="px-5 py-2.5 text-sm font-bold text-revnu-dark bg-revnu-green rounded-lg hover:bg-revnu-greenLight transition-all hover:shadow-lg hover:shadow-revnu-green/20"
              >
                Get Started
              </Link>
            </SignedOut>
            <SignedIn>
              <a href="#how-it-works" className="text-sm font-medium text-revnu-gray hover:text-white transition">
                How It Works
              </a>
              <a href="#features" className="text-sm font-medium text-revnu-gray hover:text-white transition">
                Features
              </a>
              <a href="#pricing" className="text-sm font-medium text-revnu-gray hover:text-white transition">
                Pricing
              </a>
              <Link
                href="/dashboard"
                className="px-5 py-2.5 text-sm font-bold text-revnu-dark bg-revnu-green rounded-lg hover:bg-revnu-greenLight transition-all hover:shadow-lg hover:shadow-revnu-green/20"
              >
                Dashboard
              </Link>
              <UserButton />
            </SignedIn>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section - Dark Theme */}
        <section className="relative overflow-hidden bg-revnu-dark">
          {/* Grid background */}
          <div className="absolute inset-0 opacity-[0.02]">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#4ade80" strokeWidth="1"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>

          {/* Green glow overlays */}
          <div className="absolute inset-0">
            <div className="absolute top-0 right-1/3 w-[600px] h-[600px] bg-revnu-green/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-revnu-green/5 rounded-full blur-3xl"></div>
          </div>

          <div className="relative max-w-7xl mx-auto px-6 lg:px-8 py-24 md:py-40">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left: Content */}
              <div className="max-w-2xl pt-8">
                <div className="inline-block mb-6">
                  <span className="inline-flex items-center gap-2 px-4 py-2 bg-revnu-slate/60 border border-revnu-green/20 rounded-full text-sm font-semibold text-revnu-green">
                    <span className="w-2 h-2 bg-revnu-green rounded-full animate-pulse"></span>
                    Built for Contractors
                  </span>
                </div>

                <h1 className="text-5xl md:text-7xl font-black text-white mb-6 leading-[1.05] tracking-tight">
                  Get Paid.
                  <span className="block mt-2 bg-gradient-to-r from-revnu-green to-revnu-greenLight bg-clip-text text-transparent">No Chasing.</span>
                </h1>

                <p className="text-xl md:text-2xl text-revnu-gray mb-10 leading-relaxed">
                  Automated payment reminders for contractors. Get paid faster, chase less.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                  <Link
                    href="/sign-up"
                    className="group inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-bold text-revnu-dark bg-revnu-green rounded-lg hover:bg-revnu-greenLight transition-all hover:shadow-2xl hover:shadow-revnu-green/30 hover:scale-105 transform"
                  >
                    Get Started
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </Link>
                  <a
                    href="#how-it-works"
                    className="inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold text-white border-2 border-revnu-slate hover:border-revnu-green/50 rounded-lg transition-all"
                  >
                    See How It Works
                  </a>
                </div>

                <p className="text-sm text-revnu-gray">
                  5-minute setup • Cancel anytime
                </p>
              </div>

              {/* Right: Product Mockup */}
              <div className="hidden lg:block relative">
                <div className="relative">
                  {/* Dashboard Mockup - Dark Theme */}
                  <div className="bg-revnu-slate/80 backdrop-blur-sm border border-revnu-green/20 rounded-2xl shadow-2xl shadow-revnu-green/10 p-6 transform rotate-1 hover:rotate-0 transition-transform duration-300">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6 pb-4 border-b border-revnu-green/10">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-revnu-green to-revnu-greenDark rounded-lg flex items-center justify-center">
                          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                            <rect x="2" y="11" width="3" height="7" rx="0.5" fill="#0a0f1a"/>
                            <rect x="6" y="8" width="3" height="10" rx="0.5" fill="#0a0f1a"/>
                            <rect x="10" y="5" width="3" height="13" rx="0.5" fill="#0a0f1a"/>
                          </svg>
                        </div>
                        <div>
                          <div className="text-sm font-bold text-white">Smith Electrical</div>
                          <div className="text-xs text-revnu-gray">Dashboard</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-revnu-green rounded-full animate-pulse"></div>
                        <span className="text-xs text-revnu-gray">Live</span>
                      </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="bg-revnu-green/10 rounded-xl p-4 border border-revnu-green/20">
                        <div className="text-xs text-revnu-green font-bold mb-1 uppercase tracking-wide">Collected</div>
                        <div className="text-2xl font-black text-revnu-green">$12,450</div>
                        <div className="text-xs text-revnu-greenLight mt-1">↑ 23% this month</div>
                      </div>
                      <div className="bg-revnu-dark/40 rounded-xl p-4 border border-revnu-grayLight/10">
                        <div className="text-xs text-revnu-gray font-bold mb-1 uppercase tracking-wide">Outstanding</div>
                        <div className="text-2xl font-black text-white">$8,200</div>
                        <div className="text-xs text-revnu-gray mt-1">14 invoices</div>
                      </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="space-y-3">
                      <div className="text-xs font-bold text-revnu-gray uppercase tracking-wide">Recent Activity</div>
                      <div className="bg-revnu-dark/40 rounded-lg p-3 border border-revnu-green/10">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-semibold text-white">John Doe</span>
                          <span className="text-xs text-revnu-green font-bold">PAID</span>
                        </div>
                        <div className="text-xs text-revnu-gray">Invoice #1234 • $450.00</div>
                      </div>
                      <div className="bg-revnu-dark/40 rounded-lg p-3 border border-revnu-grayLight/5">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-semibold text-white">Jane Smith</span>
                          <span className="text-xs text-revnu-grayLight font-bold">SENT</span>
                        </div>
                        <div className="text-xs text-revnu-gray">Invoice #1235 • $1,200.00</div>
                      </div>
                      <div className="bg-revnu-dark/40 rounded-lg p-3 border border-revnu-grayLight/5">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-semibold text-white">Bob Johnson</span>
                          <span className="text-xs text-revnu-greenLight font-bold">OPENED</span>
                        </div>
                        <div className="text-xs text-revnu-gray">Invoice #1236 • $750.00</div>
                      </div>
                    </div>
                  </div>

                  {/* Floating SMS Mockup - Dark Theme */}
                  <div className="absolute -bottom-6 -left-6 bg-revnu-slate/90 backdrop-blur-sm border border-revnu-green/20 rounded-xl shadow-2xl shadow-revnu-green/20 p-4 max-w-[240px] transform -rotate-3">
                    <div className="text-[10px] text-revnu-gray font-bold mb-2 uppercase tracking-wide">SMS Reminder</div>
                    <div className="bg-revnu-green text-revnu-dark text-xs font-semibold rounded-2xl rounded-bl-sm p-3 leading-relaxed">
                      Hi John, friendly reminder that invoice #1234 for $450 is now 3 days past due. Pay online: pay.link/abc123
                    </div>
                    <div className="text-[10px] text-revnu-gray mt-2">From: Smith Electrical</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Trusted By Section - Scrolling Logos */}
        <ScrollingLogos />

        {/* How It Works - Simplified */}
        <section id="how-it-works" className="py-20 bg-revnu-dark border-t border-revnu-slate/50">
          <div className="max-w-5xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
                How it works
              </h2>
              <p className="text-xl text-revnu-gray">
                Set up in 5 minutes. Collect on autopilot.
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-start gap-6 p-6 bg-revnu-slate/40 border border-revnu-green/20 rounded-xl hover:border-revnu-green/40 transition-all">
                <div className="flex-shrink-0 w-12 h-12 bg-revnu-green rounded-lg flex items-center justify-center text-revnu-dark text-xl font-black">
                  1
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Add your invoices</h3>
                  <p className="text-revnu-gray">CSV upload or add manually. Link customer phone/email. Done in 2 minutes.</p>
                </div>
              </div>

              <div className="flex items-start gap-6 p-6 bg-revnu-slate/40 border border-revnu-green/20 rounded-xl hover:border-revnu-green/40 transition-all">
                <div className="flex-shrink-0 w-12 h-12 bg-revnu-green rounded-lg flex items-center justify-center text-revnu-dark text-xl font-black">
                  2
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Choose your reminder schedule</h3>
                  <p className="text-revnu-gray">Pick a template or create your own. Friendly first, firmer later. All sent from YOUR business name.</p>
                </div>
              </div>

              <div className="flex items-start gap-6 p-6 bg-revnu-slate/40 border border-revnu-green/20 rounded-xl hover:border-revnu-green/40 transition-all">
                <div className="flex-shrink-0 w-12 h-12 bg-revnu-green rounded-lg flex items-center justify-center text-revnu-dark text-xl font-black">
                  3
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Get paid automatically</h3>
                  <p className="text-revnu-gray">REVNU sends reminders with Stripe payment links. Customers click, pay, done. Zero chasing.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features - Benefit-Focused */}
        <section id="features" className="py-20 bg-revnu-darker border-t border-revnu-slate/50">
          <div className="max-w-6xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
                Why contractors choose REVNU
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-6 bg-revnu-slate/40 border-l-4 border-revnu-green rounded-lg">
                <h4 className="text-xl font-bold text-white mb-2">✓ Automated SMS & Email Reminders</h4>
                <p className="text-revnu-gray">Sent from YOUR business name with one-click Stripe payment links. Not a third-party collector.</p>
              </div>

              <div className="p-6 bg-revnu-slate/40 border-l-4 border-revnu-green rounded-lg">
                <h4 className="text-xl font-bold text-white mb-2">✓ Mechanics Lien Protection</h4>
                <p className="text-revnu-gray">Track deadlines for all 50 states. Send lien-aware reminders. Never miss a filing window.</p>
              </div>

              <div className="p-6 bg-revnu-slate/40 border-l-4 border-revnu-green rounded-lg">
                <h4 className="text-xl font-bold text-white mb-2">✓ TCPA Compliant & Dashboard</h4>
                <p className="text-revnu-gray">Legal compliance built-in. Quiet hours enforced. Real-time tracking of opens, clicks, and payments.</p>
              </div>

              <div className="p-6 bg-revnu-slate/40 border-l-4 border-revnu-green rounded-lg">
                <h4 className="text-xl font-bold text-white mb-2">✓ Built for Contractors, Not Corporations</h4>
                <p className="text-revnu-gray">Simple enough for solo contractors. Powerful enough for growing businesses. No collections department needed.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing - Dark Theme */}
        <section id="pricing" className="py-20 bg-revnu-darker border-t border-revnu-slate/50 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-revnu-green rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-revnu-green rounded-full blur-3xl"></div>
          </div>

          <div className="relative max-w-4xl mx-auto px-6 lg:px-8 text-center">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
              Simple, transparent pricing
            </h2>
            <p className="text-xl text-revnu-gray mb-12">
              No setup fees. No per-message charges. Cancel anytime.
            </p>

            <div className="max-w-lg mx-auto bg-revnu-slate/60 backdrop-blur-lg border-2 border-revnu-green/30 rounded-2xl p-8 shadow-2xl shadow-revnu-green/20">
              <div className="text-6xl font-black text-white mb-2">
                $99<span className="text-2xl text-revnu-gray font-normal">/month</span>
              </div>
              <p className="text-revnu-green font-bold uppercase tracking-wide text-sm mb-8">Everything included</p>

              <ul className="text-left space-y-4 mb-8">
                {[
                  "2,500 SMS + 5,000 emails/month",
                  "Unlimited customers & invoices",
                  "Unlimited reminder sequences",
                  "QuickBooks integration",
                  "Up to 5 team members",
                  "Full TCPA compliance tools"
                ].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-white">
                    <svg className="w-5 h-5 text-revnu-green flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>

              <Link
                href="/sign-up"
                className="block w-full px-8 py-4 text-lg font-bold text-revnu-dark bg-revnu-green rounded-lg hover:bg-revnu-greenLight transition-all hover:scale-105 transform shadow-2xl shadow-revnu-green/30 mb-4"
              >
                Get Started
              </Link>

              <Link
                href="/pricing"
                className="block text-center text-sm text-revnu-green hover:text-revnu-greenLight transition underline"
              >
                View full pricing details →
              </Link>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-20 bg-revnu-dark border-t border-revnu-slate/50">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
                What contractors are saying
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Testimonial 1 */}
              <div className="bg-revnu-slate/40 border border-revnu-green/20 rounded-xl p-8">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-revnu-green" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-revnu-gray mb-6 leading-relaxed">
                  "REVNU saved me 10+ hours a week chasing payments. Now I just set it and forget it. Game changer for my electrical business."
                </p>
                <div>
                  <div className="font-bold text-white">Mike Rodriguez</div>
                  <div className="text-sm text-revnu-gray">Rodriguez Electric, TX</div>
                </div>
              </div>

              {/* Testimonial 2 */}
              <div className="bg-revnu-slate/40 border border-revnu-green/20 rounded-xl p-8">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-revnu-green" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-revnu-gray mb-6 leading-relaxed">
                  "The lien deadline tracker alone is worth it. I've never missed a filing window since switching to REVNU. Plus customers actually pay on time now."
                </p>
                <div>
                  <div className="font-bold text-white">Sarah Chen</div>
                  <div className="text-sm text-revnu-gray">Chen HVAC Solutions, CA</div>
                </div>
              </div>

              {/* Testimonial 3 */}
              <div className="bg-revnu-slate/40 border border-revnu-green/20 rounded-xl p-8">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-revnu-green" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-revnu-gray mb-6 leading-relaxed">
                  "My collection rate went from 60% to 85% in the first month. The automated reminders are professional and they actually work."
                </p>
                <div>
                  <div className="font-bold text-white">David Thompson</div>
                  <div className="text-sm text-revnu-gray">Thompson Plumbing, FL</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Lien Calculator Section - Dark Theme */}
        <section id="lien-calculator" className="py-20 bg-revnu-darker border-t border-revnu-slate/50">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="inline-block mb-4">
                <span className="inline-flex items-center gap-2 px-4 py-2 bg-revnu-green/10 border border-revnu-green/30 rounded-full text-sm font-semibold text-revnu-green">
                  Bonus: Free Tool
                </span>
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
                Mechanics Lien Deadline Calculator
              </h2>
              <p className="text-xl text-revnu-gray max-w-3xl mx-auto">
                Calculate state-specific lien deadlines in seconds. No signup required.
              </p>
            </div>

            <PublicLienCalculator />
          </div>
        </section>

        {/* Final CTA - Dark Theme */}
        <section className="py-24 bg-revnu-dark border-t border-revnu-slate/50">
          <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
            <h2 className="text-5xl md:text-6xl font-black text-white mb-6">
              Ready to get paid on time?
            </h2>
            <p className="text-xl text-revnu-gray mb-10">
              Join hundreds of contractors collecting faster with automated reminders.
            </p>
            <Link
              href="/sign-up"
              className="inline-flex items-center gap-2 px-10 py-5 text-xl font-bold text-revnu-dark bg-revnu-green rounded-lg hover:bg-revnu-greenLight transition-all hover:shadow-2xl hover:shadow-revnu-green/30 hover:scale-105 transform"
            >
              Get Started
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            <p className="text-sm text-revnu-gray mt-6">
              5-minute setup • Cancel anytime
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
