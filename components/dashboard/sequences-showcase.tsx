"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface SequenceStep {
  id: string;
  stepNumber: number;
  delayDays: number;
  channel: string;
  subject: string | null;
  body: string;
}

interface Sequence {
  id: string;
  name: string;
  description: string | null;
  triggerDaysPastDue: number;
  steps: SequenceStep[];
}

interface SequencesShowcaseProps {
  organizationId: string;
  sequences: Sequence[];
  businessName: string;
  communicationTone: string;
}

export default function SequencesShowcase({
  organizationId,
  sequences,
  businessName,
  communicationTone
}: SequencesShowcaseProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDismiss = async () => {
    try {
      // Mark sequences as seen
      await fetch("/api/onboarding/sequences-seen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ organizationId }),
      });
      router.refresh();
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleGetStarted = async (action: "demo" | "manual") => {
    setLoading(true);
    try {
      if (action === "demo") {
        // Generate demo data
        const response = await fetch("/api/demo-data/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ organizationId }),
        });

        if (!response.ok) {
          throw new Error("Failed to generate demo data");
        }
      }

      // Mark sequences as seen
      await fetch("/api/onboarding/sequences-seen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ organizationId }),
      });

      // Redirect
      if (action === "manual") {
        router.push("/dashboard/customers/new");
      } else {
        router.refresh(); // Refresh to show demo data
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  // Get first step for phone mockup
  const firstSequence = sequences[0];
  const firstStep = firstSequence?.steps[0];

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 overflow-y-auto">
      <div className="min-h-screen flex items-center justify-center p-4 py-8">
        <div className="bg-revnu-dark border-2 border-revnu-green/30 rounded-xl max-w-5xl w-full">
          {/* Header with CTA */}
          <div className="p-6 border-b border-revnu-green/20">
            <div className="text-center mb-4">
              <div className="text-5xl mb-2">🎉</div>
              <h1 className="text-3xl font-black text-white mb-2">
                Sequences Ready!
              </h1>
              <p className="text-sm text-revnu-gray max-w-2xl mx-auto">
                We created {sequences.length} {sequences.length === 1 ? 'sequence' : 'sequences'} for {businessName}
              </p>
            </div>

            {/* CTAs at top */}
            <div className="grid md:grid-cols-2 gap-3 max-w-2xl mx-auto mt-4">
              <button
                onClick={() => handleGetStarted("demo")}
                disabled={loading}
                className="bg-gradient-to-r from-revnu-green to-revnu-greenDark text-revnu-dark font-black rounded-lg px-6 py-3 hover:from-revnu-greenLight hover:to-revnu-green transition disabled:opacity-50 text-sm"
              >
                {loading ? "Generating..." : "🚀 Try Demo Data"}
              </button>

              <button
                onClick={() => handleGetStarted("manual")}
                disabled={loading}
                className="bg-revnu-slate/60 border-2 border-revnu-green/30 rounded-lg px-6 py-3 text-white font-bold hover:border-revnu-green hover:bg-revnu-slate/80 transition disabled:opacity-50 text-sm"
              >
                {loading ? "Redirecting..." : "➕ Add Customer"}
              </button>
            </div>
          </div>

        {/* Body */}
        <div className="p-6">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Left: Sequences List */}
            <div className="space-y-3">
              <h2 className="text-lg font-bold text-white mb-2">
                Your Sequences
              </h2>

              {sequences.map((sequence, idx) => (
                <div
                  key={sequence.id}
                  className="bg-revnu-slate/40 border border-revnu-green/20 rounded-lg p-4"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-sm font-black text-white mb-1">
                        {sequence.name}
                      </h3>
                      {sequence.description && (
                        <p className="text-xs text-revnu-gray">
                          {sequence.description}
                        </p>
                      )}
                    </div>
                    {idx === 0 && (
                      <span className="px-2 py-0.5 bg-revnu-green/20 text-revnu-green text-[10px] font-bold rounded">
                        DEFAULT
                      </span>
                    )}
                  </div>

                  {/* Timeline */}
                  <div className="space-y-2 mt-3">
                    {sequence.steps.map((step, stepIdx) => (
                      <div key={step.id} className="flex items-start gap-2">
                        <div className="flex flex-col items-center">
                          <div className="w-6 h-6 rounded-full bg-revnu-green/20 border border-revnu-green flex items-center justify-center text-[10px] font-bold text-revnu-green flex-shrink-0">
                            {stepIdx + 1}
                          </div>
                          {stepIdx < sequence.steps.length - 1 && (
                            <div className="w-0.5 h-full bg-revnu-green/20 mt-1" style={{ minHeight: '20px' }} />
                          )}
                        </div>
                        <div className="flex-1 pb-2">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-xs font-bold text-white">
                              Day {step.delayDays}
                            </span>
                            <span className="text-[10px] px-1.5 py-0.5 bg-revnu-dark border border-revnu-green/30 rounded text-revnu-green font-bold">
                              {step.channel.toUpperCase()}
                            </span>
                          </div>
                          {step.subject && (
                            <div className="text-[10px] text-revnu-gray font-semibold mb-0.5">
                              {step.subject}
                            </div>
                          )}
                          <div className="text-[10px] text-revnu-gray line-clamp-1">
                            {step.body.replace(/\{\{.*?\}\}/g, '[...]').substring(0, 60)}...
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Right: Phone Mockup */}
            <div className="flex flex-col items-center justify-center">
              <h2 className="text-lg font-bold text-white mb-4">
                See It In Action
              </h2>

              {/* iPhone Mockup */}
              <div className="relative mx-auto">
                {/* Phone Frame */}
                <div className="bg-revnu-darker border-4 border-revnu-slate rounded-[2.5rem] shadow-2xl p-3 w-72">
                  {/* Notch */}
                  <div className="bg-black h-6 w-32 mx-auto rounded-b-3xl mb-3"></div>

                  {/* Screen */}
                  <div className="bg-white rounded-2xl overflow-hidden h-[500px] flex flex-col">
                    {/* Status Bar */}
                    <div className="bg-gray-100 px-4 py-2 flex items-center justify-between text-[10px] text-gray-800">
                      <span className="font-semibold">9:41 AM</span>
                      <div className="flex items-center gap-1">
                        <span className="text-xs">📶</span>
                        <span>100%</span>
                      </div>
                    </div>

                    {/* Messages Header */}
                    <div className="bg-gray-100 px-4 py-3 border-b border-gray-200">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-revnu-green to-revnu-greenDark flex items-center justify-center text-white font-bold text-sm">
                          {businessName.charAt(0)}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900 text-xs">{businessName}</div>
                          <div className="text-[10px] text-gray-500">Automated Payment Reminder</div>
                        </div>
                      </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 p-4 bg-gray-50 overflow-y-auto">
                      {firstStep && (
                        <div className="flex justify-start mb-3">
                          <div className="max-w-[85%]">
                            <div className="bg-gray-200 text-gray-900 rounded-2xl rounded-tl-sm px-3 py-2 text-[11px] leading-relaxed max-h-64 overflow-y-auto">
                              {(() => {
                                const message = firstStep.body
                                  .replace('{{customerName}}', 'John')
                                  .replace('{{invoiceNumber}}', '#1234')
                                  .replace('{{amount}}', '$450.00')
                                  .replace('{{paymentLink}}', 'pay.revnu.com/abc123')
                                  .replace('{{daysPastDue}}', '3')
                                  .replace('{{dueDate}}', 'Today')
                                  .replace('{{businessName}}', businessName);

                                // Truncate if too long for display
                                return message.length > 300 ? message.substring(0, 300) + '...' : message;
                              })()}
                            </div>
                            <div className="text-[10px] text-gray-500 mt-1 ml-2">
                              Today, 9:15 AM
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Reply placeholder */}
                      <div className="text-center text-[10px] text-gray-400 my-3">
                        Customer can reply with questions
                      </div>
                    </div>

                    {/* Input Area */}
                    <div className="bg-white border-t border-gray-200 px-3 py-2 flex items-center gap-2">
                      <div className="flex-1 bg-gray-100 rounded-full px-3 py-1.5 text-xs text-gray-400">
                        Text Message
                      </div>
                      <button className="w-7 h-7 rounded-full bg-revnu-green text-white flex items-center justify-center text-sm">
                        ↑
                      </button>
                    </div>
                  </div>

                  {/* Home Indicator */}
                  <div className="bg-white h-1 w-28 mx-auto rounded-full mt-2"></div>
                </div>
              </div>

              <p className="text-xs md:text-sm text-revnu-gray text-center mt-4 max-w-sm mx-auto px-4">
                Messages are sent from YOUR business, automatically following your custom sequence based on invoice due dates.
              </p>
            </div>
          </div>
        </div>

          {/* Footer */}
          <div className="border-t border-revnu-green/20 py-4 text-center">
            <button
              onClick={handleDismiss}
              disabled={loading}
              className="text-revnu-gray hover:text-white text-xs underline transition disabled:opacity-50"
            >
              Skip for now, I'll explore on my own
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
