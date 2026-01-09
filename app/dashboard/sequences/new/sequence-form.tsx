"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import TemplateVariablePicker from "@/components/template-variable-picker";

interface SequenceStep {
  id: string;
  stepNumber: number;
  delayDays: number;
  channel: "sms" | "email";
  subject: string;
  body: string;
}

interface SequenceFormProps {
  organizationId: string;
  sequence?: {
    id: string;
    name: string;
    description: string | null;
    triggerDaysPastDue: number;
    isActive: boolean;
    isDefault: boolean;
    steps: SequenceStep[];
  };
}

export default function SequenceForm({ organizationId, sequence }: SequenceFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: sequence?.name || "",
    description: sequence?.description || "",
    triggerDaysPastDue: sequence?.triggerDaysPastDue || 0,
    isActive: sequence?.isActive ?? true,
    isDefault: sequence?.isDefault ?? false,
  });

  const [steps, setSteps] = useState<SequenceStep[]>(
    sequence?.steps || [
      {
        id: crypto.randomUUID(),
        stepNumber: 1,
        delayDays: 0,
        channel: "sms",
        subject: "",
        body: "Hi {{customerFirstName}}, this is a friendly reminder that invoice {{invoiceNumber}} for {{amountRemaining}} is now {{daysPastDue}} days past due. You can pay online here: {{paymentLink}}",
      },
    ]
  );

  const textareaRefs = useRef<{ [key: string]: HTMLTextAreaElement | null }>({});

  const addStep = () => {
    const newStep: SequenceStep = {
      id: crypto.randomUUID(),
      stepNumber: steps.length + 1,
      delayDays: 7,
      channel: "sms",
      subject: "",
      body: "",
    };
    setSteps([...steps, newStep]);
  };

  const updateStep = (id: string, field: keyof SequenceStep, value: any) => {
    setSteps(
      steps.map((step) =>
        step.id === id ? { ...step, [field]: value } : step
      )
    );
  };

  const removeStep = (id: string) => {
    const filtered = steps.filter((step) => step.id !== id);
    // Renumber steps
    const renumbered = filtered.map((step, idx) => ({
      ...step,
      stepNumber: idx + 1,
    }));
    setSteps(renumbered);
  };

  const insertVariable = (stepId: string, variable: string) => {
    const textarea = textareaRefs.current[stepId];
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const step = steps.find((s) => s.id === stepId);
    if (!step) return;

    const newBody =
      step.body.substring(0, start) +
      variable +
      step.body.substring(end);

    updateStep(stepId, "body", newBody);

    // Restore cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + variable.length,
        start + variable.length
      );
    }, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = sequence
        ? `/api/sequences/${sequence.id}`
        : "/api/sequences";
      const method = sequence ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          organizationId,
          steps: steps.map(({ id, ...step }) => step), // Remove client-side IDs
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
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Sequence Settings */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h2 className="text-lg font-semibold mb-4">Sequence Settings</h2>

        <div className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Sequence Name *
            </label>
            <input
              type="text"
              id="name"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="e.g., Standard 30-Day Reminder"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <input
              type="text"
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="Brief description of when to use this sequence"
            />
          </div>

          <div>
            <label htmlFor="trigger" className="block text-sm font-medium text-gray-700 mb-2">
              Start Reminders When
            </label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Invoice is</span>
              <input
                type="number"
                id="trigger"
                min="0"
                required
                value={formData.triggerDaysPastDue}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    triggerDaysPastDue: parseInt(e.target.value) || 0,
                  })
                }
                className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
              />
              <span className="text-sm text-gray-600">days past due</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
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
                className="h-4 w-4 rounded border-gray-300"
              />
              <span className="text-sm font-medium">Active</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.isDefault}
                onChange={(e) =>
                  setFormData({ ...formData, isDefault: e.target.checked })
                }
                className="h-4 w-4 rounded border-gray-300"
              />
              <span className="text-sm font-medium">Set as default</span>
            </label>
          </div>
        </div>
      </div>

      {/* Steps */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Reminder Steps</h2>
          <button
            type="button"
            onClick={addStep}
            className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
          >
            + Add Step
          </button>
        </div>

        <div className="space-y-6">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className="border border-gray-200 rounded-lg p-4 relative"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-sm font-semibold">
                    {step.stepNumber}
                  </div>
                  <div className="text-sm font-medium">
                    Step {step.stepNumber}
                  </div>
                </div>
                {steps.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeStep(step.id)}
                    className="text-sm text-red-600 hover:text-red-800"
                  >
                    Remove
                  </button>
                )}
              </div>

              <div className="space-y-4">
                {/* Timing */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {index === 0 ? "Send" : "Wait"}
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        required
                        value={step.delayDays}
                        onChange={(e) =>
                          updateStep(
                            step.id,
                            "delayDays",
                            parseInt(e.target.value) || 0
                          )
                        }
                        className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                      />
                      <span className="text-sm text-gray-600">
                        days {index === 0 ? "after trigger" : "then send"}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Channel
                    </label>
                    <select
                      value={step.channel}
                      onChange={(e) =>
                        updateStep(step.id, "channel", e.target.value as "sms" | "email")
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                    >
                      <option value="sms">SMS</option>
                      <option value="email">Email</option>
                    </select>
                  </div>
                </div>

                {/* Email Subject */}
                {step.channel === "email" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Subject Line
                    </label>
                    <input
                      type="text"
                      value={step.subject}
                      onChange={(e) =>
                        updateStep(step.id, "subject", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                      placeholder="Payment Reminder: Invoice {{invoiceNumber}}"
                    />
                  </div>
                )}

                {/* Message Body */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Message *
                    </label>
                    <TemplateVariablePicker
                      onInsert={(variable) => insertVariable(step.id, variable)}
                    />
                  </div>
                  <textarea
                    ref={(el) => {
                      if (el) textareaRefs.current[step.id] = el;
                    }}
                    required
                    rows={4}
                    value={step.body}
                    onChange={(e) => updateStep(step.id, "body", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black font-mono text-sm"
                    placeholder="Write your message here. Use the 'Insert Variable' button to add customer info, amounts, payment links, etc."
                  />
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs text-gray-500">
                      {step.channel === "sms"
                        ? `${step.body.length} characters (recommended under 160)`
                        : ""}
                    </p>
                    <p className="text-xs text-gray-500">
                      Sent from your business • Respects quiet hours
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tone Examples */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-blue-900 mb-2">
          Suggested Tone Progression
        </h4>
        <div className="space-y-2 text-sm text-blue-800">
          <div>
            <span className="font-medium">Step 1 (Friendly):</span> &quot;Hi {'{{customerFirstName}}'}, friendly reminder that invoice {'{{invoiceNumber}}'} is due...&quot;
          </div>
          <div>
            <span className="font-medium">Step 2 (Firm):</span> &quot;{'{{customerName}}'}, we haven&apos;t received payment for invoice {'{{invoiceNumber}}'}...&quot;
          </div>
          <div>
            <span className="font-medium">Step 3 (Final Notice):</span> &quot;Final notice: Invoice {'{{invoiceNumber}}'} is {'{{daysPastDue}}'} days past due...&quot;
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-black text-white rounded-md hover:bg-gray-800 disabled:bg-gray-400"
        >
          {loading ? "Saving..." : sequence ? "Update Sequence" : "Create Sequence"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
