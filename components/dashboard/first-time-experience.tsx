"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface FirstTimeExperienceProps {
  organizationId: string;
}

export default function FirstTimeExperience({ organizationId }: FirstTimeExperienceProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [selectedPath, setSelectedPath] = useState<string | null>(null);

  const handlePathSelection = async (path: "quick-start" | "import" | "manual") => {
    setSelectedPath(path);
    setLoading(true);

    try {
      if (path === "quick-start") {
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

      // Mark welcome as seen
      await fetch("/api/onboarding/welcome", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ organizationId }),
      });

      // Redirect based on path
      if (path === "manual") {
        router.push("/dashboard/customers/new");
      } else if (path === "import") {
        router.push("/dashboard/customers?import=true");
      } else {
        router.refresh(); // Refresh to show demo data
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  const handleSkip = async () => {
    try {
      await fetch("/api/onboarding/welcome", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ organizationId }),
      });
      router.refresh();
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-revnu-dark border-2 border-revnu-green/30 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-8 border-b border-revnu-green/20">
          <div className="text-center">
            <h1 className="text-4xl font-black text-white mb-3">
              Welcome to <span className="text-revnu-green">REVNU</span>!
            </h1>
            <p className="text-xl text-revnu-gray">
              Let's get you set up in less than 60 seconds
            </p>
          </div>
        </div>

        {/* Body */}
        <div className="p-8">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">
            Choose your path to get started
          </h2>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {/* Quick Start with Demo Data */}
            <button
              onClick={() => handlePathSelection("quick-start")}
              disabled={loading}
              className="group relative bg-gradient-to-br from-revnu-green/20 to-revnu-green/5 border-2 border-revnu-green/30 rounded-xl p-6 text-left hover:border-revnu-green hover:from-revnu-green/30 hover:to-revnu-green/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="absolute -top-3 -right-3 bg-revnu-green text-revnu-dark text-xs font-black px-3 py-1 rounded-full">
                RECOMMENDED
              </div>
              <div className="text-4xl mb-4">🚀</div>
              <h3 className="text-xl font-black text-white mb-2">Quick Start</h3>
              <p className="text-sm text-revnu-gray mb-4">
                Explore with sample data. See how REVNU works with realistic customers and invoices.
              </p>
              <div className="text-xs text-revnu-green font-bold">
                {loading && selectedPath === "quick-start" ? "Setting up..." : "~30 seconds"}
              </div>
            </button>

            {/* Import Contacts */}
            <button
              onClick={() => handlePathSelection("import")}
              disabled={loading}
              className="group bg-revnu-slate/40 border-2 border-revnu-green/20 rounded-xl p-6 text-left hover:border-revnu-green hover:bg-revnu-slate/60 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="text-4xl mb-4">📋</div>
              <h3 className="text-xl font-black text-white mb-2">Import Contacts</h3>
              <p className="text-sm text-revnu-gray mb-4">
                Have a CSV file? Upload your existing customers and invoices in bulk.
              </p>
              <div className="text-xs text-revnu-green font-bold">
                {loading && selectedPath === "import" ? "Opening..." : "~2 minutes"}
              </div>
            </button>

            {/* Add First Customer */}
            <button
              onClick={() => handlePathSelection("manual")}
              disabled={loading}
              className="group bg-revnu-slate/40 border-2 border-revnu-green/20 rounded-xl p-6 text-left hover:border-revnu-green hover:bg-revnu-slate/60 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="text-4xl mb-4">➕</div>
              <h3 className="text-xl font-black text-white mb-2">Add First Customer</h3>
              <p className="text-sm text-revnu-gray mb-4">
                Start fresh. Manually add your first customer and invoice right now.
              </p>
              <div className="text-xs text-revnu-green font-bold">
                {loading && selectedPath === "manual" ? "Redirecting..." : "~1 minute"}
              </div>
            </button>
          </div>

          {/* Feature Highlights */}
          <div className="bg-revnu-slate/40 rounded-xl p-6 border border-revnu-green/10 mb-6">
            <h3 className="text-lg font-bold text-white mb-4">
              What you'll be able to do with REVNU:
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <span className="text-revnu-green text-xl">✓</span>
                <div>
                  <div className="font-bold text-white text-sm">Automated Reminders</div>
                  <div className="text-xs text-revnu-gray">Send SMS & email payment reminders automatically</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-revnu-green text-xl">✓</span>
                <div>
                  <div className="font-bold text-white text-sm">TCPA Compliant</div>
                  <div className="text-xs text-revnu-gray">Built-in compliance and consent management</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-revnu-green text-xl">✓</span>
                <div>
                  <div className="font-bold text-white text-sm">AI-Powered Sequences</div>
                  <div className="text-xs text-revnu-gray">Generate message templates with AI</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-revnu-green text-xl">✓</span>
                <div>
                  <div className="font-bold text-white text-sm">Track Everything</div>
                  <div className="text-xs text-revnu-gray">Monitor outstanding balances and message history</div>
                </div>
              </div>
            </div>
          </div>

          {/* Skip button */}
          <div className="text-center">
            <button
              onClick={handleSkip}
              disabled={loading}
              className="text-revnu-gray hover:text-white text-sm underline transition disabled:opacity-50"
            >
              Skip for now, I'll explore on my own
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
