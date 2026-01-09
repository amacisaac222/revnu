"use client";

import { useState } from "react";

interface AIGeneratorProps {
  onGenerate: (steps: any[]) => void;
}

export default function AIGenerator({ onGenerate }: AIGeneratorProps) {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showExamples, setShowExamples] = useState(false);
  const [generatedSteps, setGeneratedSteps] = useState<any[] | null>(null);

  const examples = [
    "3-step sequence for overdue HVAC invoices, start friendly then get firm",
    "Aggressive 4-step collection for 30+ days past due electrical work",
    "Polite reminder sequence for new customers with net-30 terms",
    "Final notice sequence for invoices 60+ days overdue",
  ];

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError("Please describe what kind of sequence you want");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/sequences/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate sequence");
      }

      setGeneratedSteps(data.steps);
      setPrompt(""); // Clear prompt after successful generation
    } catch (err: any) {
      setError(err.message || "Failed to generate sequence");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = () => {
    if (generatedSteps) {
      onGenerate(generatedSteps);
      setGeneratedSteps(null);
    }
  };

  const handleReject = () => {
    setGeneratedSteps(null);
  };

  return (
    <div className="bg-revnu-slate/40 border border-revnu-green/20 rounded-xl p-4 md:p-6 space-y-4">
      {/* Header - Mobile optimized */}
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <h3 className="text-lg md:text-xl font-black text-white">
              Quick Generator
            </h3>
            <p className="text-xs md:text-sm text-revnu-gray mt-1">
              Describe what you want in plain English
            </p>
          </div>
          <button
            onClick={() => setShowExamples(!showExamples)}
            className="text-sm font-bold text-revnu-green hover:text-revnu-greenLight transition flex-shrink-0 px-3 py-2"
          >
            {showExamples ? "Hide" : "Examples"}
          </button>
        </div>
      </div>

      {showExamples && (
        <div className="bg-revnu-dark/50 border border-revnu-green/10 rounded-lg p-3 md:p-4">
          <p className="text-xs font-bold text-white mb-2">Tap to use:</p>
          <div className="space-y-2">
            {examples.map((example, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setPrompt(example);
                  setShowExamples(false); // Auto-hide on mobile after selection
                }}
                className="block w-full text-left text-xs md:text-sm text-revnu-gray hover:text-white bg-revnu-dark/50 hover:bg-revnu-green/10 px-3 py-3 md:py-2 rounded transition active:scale-98"
              >
                "{example}"
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Larger textarea for mobile */}
      <div>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
              e.preventDefault();
              handleGenerate();
            }
          }}
          placeholder="e.g., 3-step sequence for overdue plumbing invoices... (Ctrl+Enter to generate)"
          className="w-full px-4 py-3 bg-revnu-dark border border-revnu-green/30 rounded-lg text-white text-base focus:border-revnu-green focus:outline-none resize-none"
          rows={4}
          disabled={loading}
        />
      </div>

      {error && (
        <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
          <p className="text-red-400 font-semibold text-sm">{error}</p>
        </div>
      )}

      {/* Proposal - Show when steps are generated */}
      {generatedSteps && (
        <div className="bg-revnu-dark/50 border-2 border-revnu-green/30 rounded-lg p-4 space-y-4">
          <div className="flex items-start gap-3">
            <div className="flex-1">
              <p className="text-sm font-bold text-white mb-2">Here's your {generatedSteps.length}-step sequence:</p>
              <div className="space-y-2">
                {generatedSteps.map((step, idx) => (
                  <div key={step.id} className="bg-revnu-slate/40 p-3 rounded border border-revnu-green/10">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-black text-revnu-green">STEP {step.stepNumber}</span>
                      <span className="text-xs text-revnu-gray">
                        {step.delayDays === 0 ? "Send Now" : `Wait ${step.delayDays} day${step.delayDays > 1 ? 's' : ''}`}
                      </span>
                      <span className="text-xs text-revnu-gray">• {step.channel.toUpperCase()}</span>
                    </div>
                    <p className="text-xs text-white line-clamp-2">{step.body}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={handleConfirm}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-revnu-green to-revnu-greenDark text-revnu-dark font-black rounded-lg hover:from-revnu-greenLight hover:to-revnu-green transition-all shadow-lg shadow-revnu-green/20 active:scale-98"
            >
              ✓ Use This Sequence
            </button>
            <button
              onClick={handleReject}
              className="flex-1 px-6 py-3 bg-revnu-slate/40 border-2 border-revnu-green/30 text-white font-bold rounded-lg hover:bg-revnu-slate/60 transition-all active:scale-98"
            >
              ✕ Try Again
            </button>
          </div>
        </div>
      )}

      {/* Generate button - Hide when showing proposal */}
      {!generatedSteps && (
        <>
          <button
            onClick={handleGenerate}
            disabled={loading || !prompt.trim()}
            className="w-full px-6 py-4 md:py-3 bg-gradient-to-r from-revnu-green to-revnu-greenDark text-revnu-dark font-black rounded-lg hover:from-revnu-greenLight hover:to-revnu-green transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-revnu-green/20 text-base active:scale-98"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Generating...
              </span>
            ) : (
              "Generate Sequence"
            )}
          </button>

          <div className="p-3 bg-revnu-dark/30 border border-revnu-green/10 rounded-lg">
            <p className="text-xs text-revnu-gray">
              <span className="font-bold text-white">Tip:</span> Be specific about tone and number of steps
            </p>
          </div>
        </>
      )}
    </div>
  );
}
