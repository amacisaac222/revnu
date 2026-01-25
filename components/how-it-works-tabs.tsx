"use client";

import { useState, useEffect } from "react";

const steps = [
  {
    id: 1,
    title: "Add your invoices",
    description: "CSV upload or add manually. Link customer phone/email. Done in 2 minutes.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    mockup: (
      <div className="bg-revnu-slate/60 border border-revnu-green/20 rounded-xl p-6 shadow-xl">
        <div className="mb-4">
          <h4 className="text-sm font-bold text-revnu-green uppercase tracking-wide mb-2">Upload Invoices</h4>
        </div>
        <div className="border-2 border-dashed border-revnu-green/40 rounded-lg p-8 text-center hover:border-revnu-green/60 transition-all cursor-pointer group">
          <svg className="w-12 h-12 mx-auto text-revnu-green mb-3 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <p className="text-white font-semibold mb-1">Drop CSV file here</p>
          <p className="text-sm text-revnu-gray">or click to browse</p>
        </div>
        <div className="mt-4 space-y-2">
          <div className="flex items-center gap-3 p-3 bg-revnu-dark/40 rounded-lg">
            <svg className="w-5 h-5 text-revnu-green" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-sm text-white">QuickBooks sync available</span>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 2,
    title: "Choose your reminder schedule",
    description: "Pick a template or create your own. Friendly first, firmer later. All sent from YOUR business name.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    mockup: (
      <div className="bg-revnu-slate/60 border border-revnu-green/20 rounded-xl p-6 shadow-xl">
        <div className="mb-4">
          <h4 className="text-sm font-bold text-revnu-green uppercase tracking-wide mb-2">Reminder Sequence</h4>
        </div>
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-4 bg-revnu-dark/40 rounded-lg border-l-4 border-revnu-green">
            <div className="flex-shrink-0 w-8 h-8 bg-revnu-green/20 rounded-full flex items-center justify-center">
              <span className="text-xs font-bold text-revnu-green">1</span>
            </div>
            <div className="flex-1">
              <p className="text-white font-semibold text-sm">Day 0 - Invoice Due</p>
              <p className="text-xs text-revnu-gray">Friendly reminder via SMS & Email</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 bg-revnu-dark/40 rounded-lg border-l-4 border-revnu-greenLight/60">
            <div className="flex-shrink-0 w-8 h-8 bg-revnu-greenLight/20 rounded-full flex items-center justify-center">
              <span className="text-xs font-bold text-revnu-greenLight">2</span>
            </div>
            <div className="flex-1">
              <p className="text-white font-semibold text-sm">Day 3 - Follow Up</p>
              <p className="text-xs text-revnu-gray">Second reminder with payment link</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 bg-revnu-dark/40 rounded-lg border-l-4 border-yellow-500/60">
            <div className="flex-shrink-0 w-8 h-8 bg-yellow-500/20 rounded-full flex items-center justify-center">
              <span className="text-xs font-bold text-yellow-500">3</span>
            </div>
            <div className="flex-1">
              <p className="text-white font-semibold text-sm">Day 7 - Final Notice</p>
              <p className="text-xs text-revnu-gray">Firmer tone + lien warning</p>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 3,
    title: "Get paid automatically",
    description: "REVNU sends reminders with Stripe payment links. Customers click, pay, done. Zero chasing.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    mockup: (
      <div className="bg-revnu-slate/60 border border-revnu-green/20 rounded-xl p-6 shadow-xl">
        <div className="mb-4">
          <h4 className="text-sm font-bold text-revnu-green uppercase tracking-wide mb-2">Payment Received!</h4>
        </div>
        <div className="bg-revnu-dark/40 rounded-lg p-6 border border-revnu-green/30">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-revnu-green/20 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-revnu-green" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          <div className="text-center mb-4">
            <p className="text-2xl font-black text-white mb-1">$4,500.00</p>
            <p className="text-sm text-revnu-gray">Invoice #INV-2001</p>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center py-2 border-b border-revnu-slate/50">
              <span className="text-sm text-revnu-gray">Customer</span>
              <span className="text-sm font-semibold text-white">John Smith</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-revnu-slate/50">
              <span className="text-sm text-revnu-gray">Payment Method</span>
              <span className="text-sm font-semibold text-white">Visa •••• 4242</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-revnu-gray">Status</span>
              <span className="text-sm font-bold text-revnu-green">PAID ✓</span>
            </div>
          </div>
        </div>
      </div>
    ),
  },
];

export default function HowItWorksTabs() {
  const [activeStep, setActiveStep] = useState(1);
  const [isAutoPlay, setIsAutoPlay] = useState(true);

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlay) return;

    const interval = setInterval(() => {
      setActiveStep((prev) => (prev === 3 ? 1 : prev + 1));
    }, 5000); // Change step every 5 seconds

    return () => clearInterval(interval);
  }, [isAutoPlay]);

  const activeStepData = steps.find((step) => step.id === activeStep)!;

  return (
    <section id="how-it-works" className="py-20 bg-revnu-dark border-t border-revnu-slate/50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
            How it works
          </h2>
          <p className="text-xl text-revnu-gray mb-6">
            Set up in 5 minutes. Collect on autopilot.
          </p>

          {/* Auto-play toggle */}
          <button
            onClick={() => setIsAutoPlay(!isAutoPlay)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-revnu-slate/40 border border-revnu-green/20 rounded-lg text-sm text-revnu-gray hover:text-white hover:border-revnu-green/40 transition-all"
          >
            {isAutoPlay ? (
              <>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                Pause Auto-Play
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
                Play Auto
              </>
            )}
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          {steps.map((step) => (
            <button
              key={step.id}
              onClick={() => {
                setActiveStep(step.id);
                setIsAutoPlay(false); // Stop auto-play when user manually selects
              }}
              className={`flex-1 flex items-center gap-3 sm:gap-4 p-4 sm:p-6 rounded-xl border-2 transition-all ${
                activeStep === step.id
                  ? "bg-revnu-green/10 border-revnu-green shadow-lg shadow-revnu-green/20"
                  : "bg-revnu-slate/40 border-revnu-slate/50 hover:border-revnu-green/40"
              }`}
            >
              <div
                className={`flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center transition-all ${
                  activeStep === step.id
                    ? "bg-revnu-green text-revnu-dark"
                    : "bg-revnu-dark/40 text-revnu-gray"
                }`}
              >
                {step.icon}
              </div>
              <div className="flex-1 text-left">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`text-xs font-bold ${
                      activeStep === step.id ? "text-revnu-green" : "text-revnu-gray"
                    }`}
                  >
                    STEP {step.id}
                  </span>
                </div>
                <h3
                  className={`text-sm sm:text-base font-bold ${
                    activeStep === step.id ? "text-white" : "text-revnu-gray"
                  }`}
                >
                  {step.title}
                </h3>
              </div>
            </button>
          ))}
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center gap-2 mb-8">
          {steps.map((step) => (
            <div
              key={step.id}
              className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                step.id === activeStep ? "bg-revnu-green" : "bg-revnu-slate/40"
              }`}
            />
          ))}
        </div>

        {/* Content Area */}
        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* Left: Description */}
          <div className="space-y-6">
            <div>
              <div className="inline-block px-3 py-1 bg-revnu-green/20 border border-revnu-green/30 rounded-full mb-4">
                <span className="text-xs font-bold text-revnu-green uppercase tracking-wide">
                  Step {activeStepData.id} of 3
                </span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-white mb-4">
                {activeStepData.title}
              </h3>
              <p className="text-lg text-revnu-gray leading-relaxed">
                {activeStepData.description}
              </p>
            </div>

            {/* Navigation Arrows */}
            <div className="flex gap-3">
              <button
                onClick={() => setActiveStep(activeStep === 1 ? 3 : activeStep - 1)}
                className="flex items-center gap-2 px-4 py-3 bg-revnu-slate/40 border border-revnu-green/20 rounded-lg text-white hover:border-revnu-green/40 transition-all disabled:opacity-50 min-h-[48px]"
                disabled={activeStep === 1}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Previous
              </button>
              <button
                onClick={() => setActiveStep(activeStep === 3 ? 1 : activeStep + 1)}
                className="flex items-center gap-2 px-4 py-3 bg-revnu-green border border-revnu-green rounded-lg text-white hover:bg-revnu-greenDark transition-all min-h-[48px]"
              >
                Next
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>

          {/* Right: Visual Mockup */}
          <div className="relative">
            <div className="transition-all duration-500 ease-in-out transform">
              {activeStepData.mockup}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
