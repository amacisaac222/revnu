"use client";

import { useState } from "react";
import PreviewPhone from "./preview-phone";
import PreviewEmail from "./preview-email";
import SendTestModal from "./send-test-modal";

interface SequenceStep {
  id: string;
  stepNumber: number;
  delayDays: number;
  channel: "sms" | "email" | "both";
  subject?: string;
  body: string;
}

interface VisualSequenceBuilderProps {
  businessName: string;
  onSave?: (steps: SequenceStep[]) => void;
  initialSteps?: SequenceStep[];
}

export default function VisualSequenceBuilder({ businessName, onSave, initialSteps }: VisualSequenceBuilderProps) {
  const [steps, setSteps] = useState<SequenceStep[]>(initialSteps || [
    {
      id: "1",
      stepNumber: 1,
      delayDays: 0,
      channel: "sms",
      body: "Hi {{customerFirstName}}! Just a friendly reminder that invoice #{{invoiceNumber}} for {{amountRemaining}} is due today. Pay online here: {{paymentLink}}\n\nThanks! - {{businessName}}",
    },
  ]);

  const [selectedStepId, setSelectedStepId] = useState<string>(initialSteps?.[0]?.id || "1");
  const [previewMode, setPreviewMode] = useState<"sms" | "email">("sms");
  const [showSendTestModal, setShowSendTestModal] = useState(false);
  const [showPreview, setShowPreview] = useState(false); // Mobile toggle

  const selectedStep = steps.find((s) => s.id === selectedStepId);

  const addStep = () => {
    const newStep: SequenceStep = {
      id: Date.now().toString(),
      stepNumber: steps.length + 1,
      delayDays: 7,
      channel: "sms",
      body: "",
    };
    setSteps([...steps, newStep]);
    setSelectedStepId(newStep.id);
  };

  const updateStep = (id: string, updates: Partial<SequenceStep>) => {
    setSteps(steps.map((step) => (step.id === id ? { ...step, ...updates } : step)));
  };

  const deleteStep = (id: string) => {
    const newSteps = steps.filter((s) => s.id !== id);
    setSteps(newSteps);
    if (selectedStepId === id && newSteps.length > 0) {
      setSelectedStepId(newSteps[0].id);
    }
  };

  const processVariables = (text: string): string => {
    return text
      .replace(/\{\{customerFirstName\}\}/g, "John")
      .replace(/\{\{customerName\}\}/g, "John Doe")
      .replace(/\{\{businessName\}\}/g, businessName)
      .replace(/\{\{invoiceNumber\}\}/g, "#1234")
      .replace(/\{\{amountRemaining\}\}/g, "$450.00")
      .replace(/\{\{amountDue\}\}/g, "$450.00")
      .replace(/\{\{dueDate\}\}/g, "Jan 15, 2026")
      .replace(/\{\{daysPastDue\}\}/g, "3")
      .replace(/\{\{paymentLink\}\}/g, "pay.revnu.com/abc123");
  };

  // Editor content (reusable for mobile/desktop)
  const EditorContent = () => (
    <>
      {/* Timeline */}
      <div className="bg-revnu-slate/40 border border-revnu-green/20 rounded-xl p-4 md:p-6">
        <h3 className="text-lg font-bold text-white mb-4">Sequence Timeline</h3>

        <div className="space-y-3">
          {steps.map((step, index) => (
            <div key={step.id}>
              {/* Step Card - Larger tap targets for mobile */}
              <div
                onClick={() => setSelectedStepId(step.id)}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all active:scale-98 ${
                  selectedStepId === step.id
                    ? "bg-revnu-green/10 border-revnu-green"
                    : "bg-revnu-dark/50 border-revnu-green/20"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 md:w-8 md:h-8 bg-revnu-green rounded-lg flex items-center justify-center text-revnu-dark font-black text-sm flex-shrink-0">
                        {step.stepNumber}
                      </div>
                      <div>
                        <div className="text-white font-bold text-sm">
                          {step.delayDays === 0 ? "Send Now" : `Wait ${step.delayDays} days`}
                        </div>
                        <div className="text-revnu-gray text-xs uppercase tracking-wide">
                          {step.channel === "both" ? "SMS + Email" : step.channel.toUpperCase()}
                        </div>
                      </div>
                    </div>
                    <p className="text-revnu-gray text-sm line-clamp-2 break-words">{step.body || "Empty message"}</p>
                  </div>
                  {steps.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteStep(step.id);
                      }}
                      className="text-red-400 hover:text-red-300 p-2 -m-2 flex-shrink-0"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              {/* Arrow between steps */}
              {index < steps.length - 1 && (
                <div className="flex items-center justify-center py-2">
                  <div className="text-revnu-green text-xl">↓</div>
                </div>
              )}
            </div>
          ))}
        </div>

        <button
          onClick={addStep}
          className="mt-4 w-full px-4 py-4 md:py-3 bg-revnu-dark/50 border-2 border-dashed border-revnu-green/30 rounded-lg text-revnu-green font-bold hover:border-revnu-green hover:bg-revnu-green/10 transition-all text-base"
        >
          + Add Step
        </button>
      </div>

      {/* Editor */}
      {selectedStep && (
        <div className="bg-revnu-slate/40 border border-revnu-green/20 rounded-xl p-4 md:p-6">
          <h3 className="text-lg font-bold text-white mb-4">Edit Step {selectedStep.stepNumber}</h3>

          <div className="space-y-4">
            {/* Delay */}
            <div>
              <label className="block text-sm font-bold text-white mb-2">
                Wait Time (days)
              </label>
              <input
                type="number"
                value={selectedStep.delayDays}
                onChange={(e) =>
                  updateStep(selectedStep.id, { delayDays: parseInt(e.target.value) })
                }
                className="w-full px-4 py-3 md:py-2 bg-revnu-dark border border-revnu-green/30 rounded-lg text-white text-base focus:border-revnu-green focus:outline-none"
                min="0"
              />
            </div>

            {/* Channel - Stack on mobile */}
            <div>
              <label className="block text-sm font-bold text-white mb-2">Channel</label>
              <div className="grid grid-cols-3 gap-2">
                {(["sms", "email", "both"] as const).map((channel) => (
                  <button
                    key={channel}
                    onClick={() => updateStep(selectedStep.id, { channel })}
                    className={`px-4 py-3 md:py-2 rounded-lg font-bold text-sm transition-all ${
                      selectedStep.channel === channel
                        ? "bg-revnu-green text-revnu-dark"
                        : "bg-revnu-dark/50 text-revnu-gray border border-revnu-green/20"
                    }`}
                  >
                    {channel === "both" ? "Both" : channel.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Subject (if email) */}
            {(selectedStep.channel === "email" || selectedStep.channel === "both") && (
              <div>
                <label className="block text-sm font-bold text-white mb-2">
                  Email Subject
                </label>
                <input
                  type="text"
                  value={selectedStep.subject || ""}
                  onChange={(e) => updateStep(selectedStep.id, { subject: e.target.value })}
                  className="w-full px-4 py-3 md:py-2 bg-revnu-dark border border-revnu-green/30 rounded-lg text-white text-base focus:border-revnu-green focus:outline-none"
                  placeholder="Reminder: Invoice #{{invoiceNumber}}"
                />
              </div>
            )}

            {/* Body */}
            <div>
              <label className="block text-sm font-bold text-white mb-2">Message</label>
              <textarea
                value={selectedStep.body}
                onChange={(e) => updateStep(selectedStep.id, { body: e.target.value })}
                className="w-full px-4 py-3 bg-revnu-dark border border-revnu-green/30 rounded-lg text-white focus:border-revnu-green focus:outline-none font-mono text-sm"
                rows={8}
                placeholder="Write your message..."
              />
              <div className="mt-2 text-xs text-revnu-gray">
                Available: {`{{customerFirstName}}, {{invoiceNumber}}, {{amountRemaining}}, {{paymentLink}}`}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );

  // Preview content (reusable for mobile/desktop)
  const PreviewContent = () => (
    <div className="bg-revnu-slate/40 border border-revnu-green/20 rounded-xl p-4 md:p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-white">Live Preview</h3>
        {selectedStep && selectedStep.channel === "both" && (
          <div className="flex gap-2">
            <button
              onClick={() => setPreviewMode("sms")}
              className={`px-3 py-2 rounded-lg text-sm font-bold transition ${
                previewMode === "sms"
                  ? "bg-revnu-green text-revnu-dark"
                  : "bg-revnu-dark/50 text-revnu-gray"
              }`}
            >
              SMS
            </button>
            <button
              onClick={() => setPreviewMode("email")}
              className={`px-3 py-2 rounded-lg text-sm font-bold transition ${
                previewMode === "email"
                  ? "bg-revnu-green text-revnu-dark"
                  : "bg-revnu-dark/50 text-revnu-gray"
              }`}
            >
              Email
            </button>
          </div>
        )}
      </div>

      {selectedStep && (
        <div className="flex justify-center">
          {(selectedStep.channel === "sms" || (selectedStep.channel === "both" && previewMode === "sms")) && (
            <PreviewPhone
              message={processVariables(selectedStep.body)}
              businessName={businessName}
            />
          )}
          {(selectedStep.channel === "email" || (selectedStep.channel === "both" && previewMode === "email")) && (
            <PreviewEmail
              subject={processVariables(selectedStep.subject || "Payment Reminder")}
              body={processVariables(selectedStep.body)}
              businessName={businessName}
            />
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Mobile: Preview Toggle - Fixed at top */}
      <div className="lg:hidden sticky top-0 z-20 bg-revnu-dark/95 backdrop-blur-sm border-b border-revnu-green/20 -mx-4 px-4 py-3 shadow-lg">
        <button
          onClick={() => setShowPreview(!showPreview)}
          className="w-full px-6 py-4 bg-gradient-to-r from-revnu-green to-revnu-greenDark text-revnu-dark font-black rounded-lg flex items-center justify-center gap-2 text-base shadow-lg active:scale-98 transition-transform"
        >
          {showPreview ? "✏️ Edit Sequence" : "👁️ Preview Message"}
        </button>
      </div>

      {/* Mobile: Show either editor OR preview */}
      <div className="lg:hidden space-y-6">
        {!showPreview ? (
          <EditorContent />
        ) : (
          <>
            <PreviewContent />
            {/* Action Buttons on mobile */}
            <div className="space-y-3 px-1">
              <button
                onClick={() => setShowSendTestModal(true)}
                className="w-full px-6 py-4 bg-revnu-dark border-2 border-revnu-green/30 text-white font-black rounded-lg hover:bg-revnu-green/10 hover:border-revnu-green transition-all text-base"
              >
                📤 Send Test to My Phone
              </button>
              <button
                onClick={() => onSave?.(steps)}
                className="w-full px-6 py-4 bg-revnu-green text-revnu-dark font-black rounded-lg hover:bg-revnu-greenLight transition-all shadow-lg shadow-revnu-green/20 text-lg"
              >
                💾 Save Sequence
              </button>
            </div>
          </>
        )}
      </div>

      {/* Desktop: Side-by-side layout */}
      <div className="hidden lg:grid lg:grid-cols-2 gap-8">
        {/* Left: Editor */}
        <div className="space-y-6">
          <EditorContent />
        </div>

        {/* Right: Preview + Actions */}
        <div className="space-y-6">
          <PreviewContent />

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={() => setShowSendTestModal(true)}
              className="w-full px-6 py-3 bg-revnu-dark border border-revnu-green/30 text-white font-bold rounded-lg hover:bg-revnu-green/10 hover:border-revnu-green transition-all"
            >
              📤 Send Test
            </button>
            <button
              onClick={() => onSave?.(steps)}
              className="w-full px-6 py-4 bg-revnu-green text-revnu-dark font-black rounded-lg hover:bg-revnu-greenLight transition-all shadow-lg shadow-revnu-green/20 text-lg"
            >
              Save Sequence
            </button>
          </div>
        </div>
      </div>

      {/* Send Test Modal */}
      {showSendTestModal && selectedStep && (
        <SendTestModal
          channel={selectedStep.channel}
          subject={processVariables(selectedStep.subject || "Payment Reminder")}
          message={processVariables(selectedStep.body)}
          onClose={() => setShowSendTestModal(false)}
        />
      )}
    </div>
  );
}
