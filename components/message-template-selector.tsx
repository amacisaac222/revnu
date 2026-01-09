"use client";

import { useState } from "react";
import { MESSAGE_TEMPLATES, MessageTemplate, fillTemplate, getRecommendedTemplate } from "@/lib/message-templates";
import { Mail, MessageSquare, AlertCircle, Check, Zap } from "lucide-react";

interface MessageTemplateSelectorProps {
  channel: "sms" | "email" | "both";
  daysPastDue: number;
  customerFirstName: string;
  customerFullName: string;
  businessName: string;
  invoiceNumber: string;
  invoiceAmount: string;
  dueDate: string;
  paymentLink: string;
  businessPhone?: string;
  businessEmail?: string;
  onSelect: (template: MessageTemplate, filledContent: { sms?: string; emailSubject?: string; emailBody?: string }) => void;
  onCancel: () => void;
}

export default function MessageTemplateSelector({
  channel,
  daysPastDue,
  customerFirstName,
  customerFullName,
  businessName,
  invoiceNumber,
  invoiceAmount,
  dueDate,
  paymentLink,
  businessPhone,
  businessEmail,
  onSelect,
  onCancel,
}: MessageTemplateSelectorProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<MessageTemplate | null>(null);
  const [previewMode, setPreviewMode] = useState<"sms" | "email">("sms");

  // Filter templates by channel
  const availableTemplates = MESSAGE_TEMPLATES.filter((t) =>
    t.channels.includes(channel)
  );

  // Get recommended template
  const recommended = getRecommendedTemplate(daysPastDue, channel);

  // Template data for filling
  const templateData = {
    customerFirstName,
    customerFullName,
    businessName,
    invoiceNumber,
    invoiceAmount,
    dueDate,
    daysPastDue,
    paymentLink,
    businessPhone: businessPhone || "",
    businessEmail: businessEmail || "",
  };

  // Fill selected template
  const getFilledContent = (template: MessageTemplate) => {
    const result: { sms?: string; emailSubject?: string; emailBody?: string } = {};

    if (template.smsTemplate) {
      result.sms = fillTemplate(template.smsTemplate, templateData);
    }
    if (template.emailSubject) {
      result.emailSubject = fillTemplate(template.emailSubject, templateData);
    }
    if (template.emailBody) {
      result.emailBody = fillTemplate(template.emailBody, templateData);
    }

    return result;
  };

  const handleSelect = () => {
    if (!selectedTemplate) return;
    const filled = getFilledContent(selectedTemplate);
    onSelect(selectedTemplate, filled);
  };

  const categoryColors = {
    friendly: "bg-revnu-green/20 text-revnu-green border-revnu-green/30",
    firm: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    final: "bg-red-500/20 text-red-400 border-red-500/30",
    thank_you: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  };

  const categoryIcons = {
    friendly: "😊",
    firm: "⚠️",
    final: "🚨",
    thank_you: "🙏",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 overflow-y-auto">
      <div className="bg-revnu-dark border-2 border-revnu-green/30 rounded-xl max-w-6xl w-full my-8">
        {/* Header */}
        <div className="p-6 border-b border-revnu-green/20">
          <h2 className="text-2xl font-black text-white mb-2">
            Choose Message Template
          </h2>
          <p className="text-sm text-gray-400">
            Select a TCPA-compliant template for invoice #{invoiceNumber} ({daysPastDue} days overdue)
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 p-6">
          {/* Template List */}
          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
            <h3 className="text-lg font-bold text-white sticky top-0 bg-revnu-dark pb-2">
              Available Templates
            </h3>

            {availableTemplates.map((template) => {
              const isRecommended = template.id === recommended?.id;
              const isSelected = template.id === selectedTemplate?.id;

              return (
                <div
                  key={template.id}
                  onClick={() => setSelectedTemplate(template)}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition ${
                    isSelected
                      ? "border-revnu-green bg-revnu-green/10"
                      : "border-revnu-green/20 hover:border-revnu-green/40 bg-revnu-slate/40"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">
                          {categoryIcons[template.category]}
                        </span>
                        <h4 className="font-bold text-white">
                          {template.name}
                        </h4>
                        {isRecommended && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-revnu-green/20 text-revnu-green border border-revnu-green/30 rounded text-xs font-bold">
                            <Zap className="w-3 h-3" />
                            Recommended
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-400">
                        {template.description}
                      </p>
                    </div>
                    {isSelected && (
                      <Check className="w-5 h-5 text-revnu-green flex-shrink-0" />
                    )}
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded text-xs font-bold border ${
                        categoryColors[template.category]
                      }`}
                    >
                      {template.category.replace("_", " ").toUpperCase()}
                    </span>
                    {template.channels.map((ch) => (
                      <span
                        key={ch}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-revnu-slate/60 text-gray-300 rounded text-xs font-semibold"
                      >
                        {ch === "sms" ? (
                          <MessageSquare className="w-3 h-3" />
                        ) : (
                          <Mail className="w-3 h-3" />
                        )}
                        {ch.toUpperCase()}
                      </span>
                    ))}
                    <span className="text-xs text-gray-500">
                      {template.daysPastDueMin}-{template.daysPastDueMax} days
                    </span>
                  </div>

                  {template.requiresConsent && (
                    <div className="mt-2 flex items-center gap-1 text-xs text-yellow-400">
                      <AlertCircle className="w-3 h-3" />
                      Requires prior consent
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Preview */}
          <div className="space-y-4">
            <div className="sticky top-0 bg-revnu-dark pb-2">
              <h3 className="text-lg font-bold text-white mb-3">Preview</h3>

              {selectedTemplate && (
                <>
                  {/* Channel tabs for "both" templates */}
                  {selectedTemplate.smsTemplate &&
                    selectedTemplate.emailBody && (
                      <div className="flex gap-2 mb-4">
                        <button
                          onClick={() => setPreviewMode("sms")}
                          className={`flex-1 px-4 py-2 rounded-lg font-bold text-sm transition ${
                            previewMode === "sms"
                              ? "bg-revnu-green text-revnu-dark"
                              : "bg-revnu-slate/40 text-gray-400 hover:text-white"
                          }`}
                        >
                          <MessageSquare className="w-4 h-4 inline mr-2" />
                          SMS
                        </button>
                        <button
                          onClick={() => setPreviewMode("email")}
                          className={`flex-1 px-4 py-2 rounded-lg font-bold text-sm transition ${
                            previewMode === "email"
                              ? "bg-revnu-green text-revnu-dark"
                              : "bg-revnu-slate/40 text-gray-400 hover:text-white"
                          }`}
                        >
                          <Mail className="w-4 h-4 inline mr-2" />
                          Email
                        </button>
                      </div>
                    )}
                </>
              )}
            </div>

            {selectedTemplate ? (
              <div className="bg-revnu-slate/40 border border-revnu-green/20 rounded-lg p-6 max-h-[500px] overflow-y-auto">
                {/* SMS Preview */}
                {selectedTemplate.smsTemplate && previewMode === "sms" && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <MessageSquare className="w-4 h-4" />
                      SMS Message
                    </div>
                    <div className="bg-revnu-dark rounded-lg p-4">
                      <p className="text-white text-sm whitespace-pre-wrap">
                        {fillTemplate(selectedTemplate.smsTemplate, templateData)}
                      </p>
                    </div>
                    <div className="text-xs text-gray-500">
                      Character count:{" "}
                      {fillTemplate(selectedTemplate.smsTemplate, templateData).length}
                      {fillTemplate(selectedTemplate.smsTemplate, templateData)
                        .length > 160 && (
                        <span className="text-yellow-400 ml-2">
                          (Will be sent as {Math.ceil(fillTemplate(selectedTemplate.smsTemplate, templateData).length / 160)} messages)
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Email Preview */}
                {selectedTemplate.emailBody && previewMode === "email" && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Mail className="w-4 h-4" />
                      Email Message
                    </div>
                    {selectedTemplate.emailSubject && (
                      <div>
                        <label className="text-xs text-gray-500 uppercase tracking-wide font-bold mb-1 block">
                          Subject
                        </label>
                        <div className="bg-revnu-dark rounded-lg p-3">
                          <p className="text-white text-sm font-semibold">
                            {fillTemplate(selectedTemplate.emailSubject, templateData)}
                          </p>
                        </div>
                      </div>
                    )}
                    <div>
                      <label className="text-xs text-gray-500 uppercase tracking-wide font-bold mb-1 block">
                        Body
                      </label>
                      <div className="bg-revnu-dark rounded-lg p-4">
                        <p className="text-white text-sm whitespace-pre-wrap">
                          {fillTemplate(selectedTemplate.emailBody, templateData)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Compliance Info */}
                <div className="mt-4 pt-4 border-t border-revnu-green/20">
                  <h4 className="text-xs text-gray-500 uppercase tracking-wide font-bold mb-2">
                    Compliance Features
                  </h4>
                  <div className="space-y-1 text-xs text-gray-400">
                    {selectedTemplate.includesOptOut && (
                      <div className="flex items-center gap-2">
                        <Check className="w-3 h-3 text-revnu-green" />
                        Includes opt-out instructions (TCPA compliant)
                      </div>
                    )}
                    {selectedTemplate.requiresConsent && (
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-3 h-3 text-yellow-400" />
                        Requires documented prior consent
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Check className="w-3 h-3 text-revnu-green" />
                      Professional tone appropriate for business communication
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-3 h-3 text-revnu-green" />
                      Clear identification of sender
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-revnu-slate/40 border border-revnu-green/20 rounded-lg p-12 text-center">
                <p className="text-gray-400">
                  Select a template to preview its content
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row gap-3 p-6 border-t border-revnu-green/20">
          <button
            onClick={onCancel}
            className="flex-1 px-6 py-3 bg-revnu-slate/40 text-white font-bold rounded-lg hover:bg-revnu-slate/60 transition border border-revnu-green/20"
          >
            Cancel
          </button>
          <button
            onClick={handleSelect}
            disabled={!selectedTemplate}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-revnu-green to-revnu-greenDark text-revnu-dark font-bold rounded-lg hover:from-revnu-greenLight hover:to-revnu-green transition shadow-lg shadow-revnu-green/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {selectedTemplate ? `Use "${selectedTemplate.name}"` : "Select a Template"}
          </button>
        </div>
      </div>
    </div>
  );
}
