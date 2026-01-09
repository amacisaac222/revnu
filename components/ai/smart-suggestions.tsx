"use client";

import { useState } from "react";

interface AISuggestion {
  urgency: "low" | "medium" | "high" | "critical";
  recommendedAction: string;
  messageTone: string;
  suggestedMessage: string;
  reasoning: string;
  estimatedPaymentProbability: number;
  nextSteps: string[];
  timing: string;
}

interface SmartSuggestionsProps {
  invoiceId: string;
  onSendMessage?: (message: string) => void;
}

export default function SmartSuggestions({ invoiceId, onSendMessage }: SmartSuggestionsProps) {
  const [loading, setLoading] = useState(false);
  const [suggestion, setSuggestion] = useState<AISuggestion | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(true);

  const analyzeSituation = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/ai/analyze-invoice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invoiceId }),
      });

      if (!response.ok) {
        throw new Error("Failed to analyze invoice");
      }

      const data = await response.json();
      setSuggestion(data.analysis);
    } catch (err) {
      setError("Failed to get AI suggestions. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "critical":
        return "from-red-500/20 to-red-500/5 border-red-500/30";
      case "high":
        return "from-orange-500/20 to-orange-500/5 border-orange-500/30";
      case "medium":
        return "from-yellow-500/20 to-yellow-500/5 border-yellow-500/30";
      default:
        return "from-revnu-green/20 to-revnu-green/5 border-revnu-green/30";
    }
  };

  const getUrgencyIcon = (urgency: string) => {
    switch (urgency) {
      case "critical":
        return "🚨";
      case "high":
        return "⚠️";
      case "medium":
        return "📊";
      default:
        return "✅";
    }
  };

  if (!suggestion && !loading) {
    return (
      <div className="bg-gradient-to-br from-purple-500/20 to-purple-500/5 border-2 border-purple-500/30 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="text-4xl">🤖</div>
          <div className="flex-1">
            <h3 className="text-lg font-black text-white mb-2">AI-Powered Insights</h3>
            <p className="text-sm text-revnu-gray mb-4">
              Get intelligent recommendations on how to handle this invoice based on customer behavior,
              payment history, and industry best practices.
            </p>
            <button
              onClick={analyzeSituation}
              className="px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white font-bold rounded-lg hover:from-purple-600 hover:to-purple-700 transition shadow-lg shadow-purple-500/20"
            >
              Get AI Recommendations
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-purple-500/20 to-purple-500/5 border-2 border-purple-500/30 rounded-xl p-6">
        <div className="flex items-center gap-3">
          <div className="animate-spin text-2xl">🤖</div>
          <div>
            <p className="text-white font-bold">Analyzing invoice situation...</p>
            <p className="text-xs text-revnu-gray">Using AI to find the best approach</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border-2 border-red-500/30 rounded-xl p-4">
        <p className="text-red-400 text-sm">{error}</p>
        <button
          onClick={analyzeSituation}
          className="mt-2 text-xs text-revnu-green hover:underline"
        >
          Try again
        </button>
      </div>
    );
  }

  if (!suggestion) return null;

  return (
    <div className={`bg-gradient-to-br ${getUrgencyColor(suggestion.urgency)} border-2 rounded-xl overflow-hidden`}>
      {/* Header */}
      <div className="p-4 border-b border-revnu-green/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{getUrgencyIcon(suggestion.urgency)}</span>
          <div>
            <h3 className="font-black text-white flex items-center gap-2">
              AI Recommendation
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                suggestion.urgency === "critical" ? "bg-red-500" :
                suggestion.urgency === "high" ? "bg-orange-500" :
                suggestion.urgency === "medium" ? "bg-yellow-500" :
                "bg-green-500"
              } text-white uppercase tracking-wide`}>
                {suggestion.urgency}
              </span>
            </h3>
            <p className="text-xs text-revnu-gray">Powered by Claude AI</p>
          </div>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-revnu-gray hover:text-white transition"
        >
          <svg
            className={`w-5 h-5 transform transition-transform ${isExpanded ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {isExpanded && (
        <div className="p-6 space-y-4">
          {/* Recommended Action */}
          <div>
            <div className="text-xs text-revnu-gray font-bold uppercase tracking-wide mb-2">
              Recommended Action
            </div>
            <div className="bg-revnu-dark/30 rounded-lg p-4">
              <p className="text-white font-bold text-lg capitalize mb-1">
                {suggestion.recommendedAction.replace(/_/g, " ")}
              </p>
              <p className="text-sm text-revnu-gray">{suggestion.reasoning}</p>
            </div>
          </div>

          {/* Suggested Message */}
          <div>
            <div className="text-xs text-revnu-gray font-bold uppercase tracking-wide mb-2 flex items-center justify-between">
              <span>Suggested Message ({suggestion.messageTone})</span>
              <span className="text-revnu-green">Payment Probability: {suggestion.estimatedPaymentProbability}%</span>
            </div>
            <div className="bg-revnu-dark/30 rounded-lg p-4">
              <p className="text-white text-sm leading-relaxed mb-3">{suggestion.suggestedMessage}</p>
              {onSendMessage && (
                <button
                  onClick={() => onSendMessage(suggestion.suggestedMessage)}
                  className="px-4 py-2 bg-revnu-green text-revnu-dark font-bold rounded-lg hover:bg-revnu-greenLight transition text-sm"
                >
                  Use This Message
                </button>
              )}
            </div>
          </div>

          {/* Timing */}
          <div className="bg-revnu-dark/30 rounded-lg p-4 flex items-center gap-3">
            <span className="text-2xl">⏰</span>
            <div>
              <p className="text-xs text-revnu-gray font-bold uppercase tracking-wide">Optimal Timing</p>
              <p className="text-white font-bold">{suggestion.timing}</p>
            </div>
          </div>

          {/* Next Steps */}
          <div>
            <div className="text-xs text-revnu-gray font-bold uppercase tracking-wide mb-2">
              Next Steps
            </div>
            <div className="space-y-2">
              {suggestion.nextSteps.map((step, index) => (
                <div key={index} className="flex items-start gap-2 text-sm text-white">
                  <span className="text-revnu-green font-bold">{index + 1}.</span>
                  <span>{step}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Refresh Button */}
          <button
            onClick={analyzeSituation}
            className="w-full mt-4 px-4 py-2 bg-revnu-slate/40 border border-revnu-green/20 text-revnu-gray hover:text-white hover:border-revnu-green rounded-lg transition text-sm font-bold"
          >
            🔄 Refresh Analysis
          </button>
        </div>
      )}
    </div>
  );
}
