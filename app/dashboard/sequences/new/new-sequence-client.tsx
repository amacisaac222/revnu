"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import VisualSequenceBuilder from "@/components/sequence-builder/visual-sequence-builder";
import AIGenerator from "@/components/sequence-builder/ai-generator";

interface SequenceStep {
  id: string;
  stepNumber: number;
  delayDays: number;
  channel: "sms" | "email" | "both";
  subject?: string;
  body: string;
}

interface NewSequenceClientProps {
  organizationId: string;
  businessName: string;
}

export default function NewSequenceClient({ organizationId, businessName }: NewSequenceClientProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [aiGeneratedSteps, setAiGeneratedSteps] = useState<SequenceStep[] | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    triggerDaysPastDue: 0,
    isActive: true,
    isDefault: false,
  });

  const handleSave = async (steps: SequenceStep[]) => {
    // Validate sequence name
    if (!formData.name.trim()) {
      setShowSettings(true);
      alert("Please enter a sequence name");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/sequences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          organizationId,
          steps: steps.map(({ id, ...step }) => ({
            ...step,
            // Convert "both" to separate SMS and email steps
            channel: step.channel === "both" ? "sms" : step.channel,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save sequence");
      }

      router.push("/dashboard/sequences");
      router.refresh();
    } catch (error) {
      console.error("Error saving sequence:", error);
      alert("Failed to save sequence. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Sequence Settings */}
      <div className="bg-revnu-slate/40 border border-revnu-green/20 rounded-xl p-6">
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="w-full flex items-center justify-between mb-4"
        >
          <h3 className="text-lg font-bold text-white">Sequence Settings</h3>
          <span className="text-revnu-green">{showSettings ? "−" : "+"}</span>
        </button>

        {showSettings && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-white mb-2">
                Sequence Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 bg-revnu-dark border border-revnu-green/30 rounded-lg text-white focus:border-revnu-green focus:outline-none"
                placeholder="e.g., Standard 30-Day Reminder"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-white mb-2">
                Description
              </label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 bg-revnu-dark border border-revnu-green/30 rounded-lg text-white focus:border-revnu-green focus:outline-none"
                placeholder="Brief description of when to use this sequence"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-white mb-2">
                Start Reminders When
              </label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-revnu-gray">Invoice is</span>
                <input
                  type="number"
                  min="0"
                  value={formData.triggerDaysPastDue}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      triggerDaysPastDue: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-20 px-3 py-2 bg-revnu-dark border border-revnu-green/30 rounded-lg text-white focus:border-revnu-green focus:outline-none"
                />
                <span className="text-sm text-revnu-gray">days past due</span>
              </div>
              <p className="text-xs text-revnu-gray mt-1">
                Set to 0 to start on the due date
              </p>
            </div>

            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) =>
                    setFormData({ ...formData, isActive: e.target.checked })
                  }
                  className="h-4 w-4 rounded border-revnu-green/30"
                />
                <span className="text-sm font-bold text-white">Active</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isDefault}
                  onChange={(e) =>
                    setFormData({ ...formData, isDefault: e.target.checked })
                  }
                  className="h-4 w-4 rounded border-revnu-green/30"
                />
                <span className="text-sm font-bold text-white">Set as default</span>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* AI Generator */}
      <AIGenerator
        onGenerate={(steps) => {
          console.log("Generated steps:", steps);
          setAiGeneratedSteps(steps);
        }}
      />

      {/* Visual Sequence Builder */}
      <VisualSequenceBuilder
        key={aiGeneratedSteps ? JSON.stringify(aiGeneratedSteps) : 'default'}
        businessName={businessName}
        onSave={handleSave}
        initialSteps={aiGeneratedSteps || undefined}
      />

      {loading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-revnu-slate border border-revnu-green/20 rounded-xl p-6">
            <p className="text-white font-bold">Saving sequence...</p>
          </div>
        </div>
      )}
    </div>
  );
}
