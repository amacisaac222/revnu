"use client";

import { useState } from "react";
import { AlertTriangle, FileText, Send, CheckCircle, Clock } from "lucide-react";
import { calculateNOIDeadlines, shouldSendNOINow, formatNOIDeadlines } from "@/lib/noi-calculator";

interface NOIActionCardProps {
  invoice: {
    id: string;
    invoiceNumber: string;
    amountRemaining: number;
    dueDate: Date;
    lastWorkDate: Date | null;
    lienEligible: boolean;
    daysPastDue: number;
  };
  organizationState: string;
  noisSent?: Array<{
    id: string;
    sentDate: Date;
    deliveryStatus: string;
    responseDeadline: Date;
  }>;
  onSendNOI?: () => void;
}

export default function NOIActionCard({
  invoice,
  organizationState,
  noisSent = [],
  onSendNOI,
}: NOIActionCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Only show if invoice is lien eligible
  if (!invoice.lienEligible || !invoice.lastWorkDate) {
    return null;
  }

  // Calculate NOI deadlines
  const noiCalculation = calculateNOIDeadlines(
    invoice.lastWorkDate,
    invoice.dueDate,
    organizationState
  );

  const sendRecommendation = shouldSendNOINow(noiCalculation);

  // Check if NOI already sent
  const latestNOI = noisSent.length > 0 ? noisSent[noisSent.length - 1] : null;

  const handleGenerateNOI = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch(`/api/invoices/${invoice.id}/noi/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error("Failed to generate NOI");
      }

      const data = await response.json();

      // Download PDF automatically
      if (data.noi.pdfUrl) {
        window.open(data.noi.pdfUrl, "_blank");
      }

      // Callback to refresh page data
      if (onSendNOI) {
        onSendNOI();
      }

      alert("NOI generated successfully! PDF download started.");
    } catch (error) {
      console.error("NOI generation error:", error);
      alert("Failed to generate NOI. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Urgency color coding
  const urgencyColors = {
    critical: "border-red-500 bg-red-500/10",
    high: "border-orange-500 bg-orange-500/10",
    medium: "border-yellow-500 bg-yellow-500/10",
    low: "border-revnu-slate bg-revnu-slate/20",
  };

  const urgencyIcons = {
    critical: <AlertTriangle className="w-5 h-5 text-red-500" />,
    high: <AlertTriangle className="w-5 h-5 text-orange-500" />,
    medium: <Clock className="w-5 h-5 text-yellow-500" />,
    low: <FileText className="w-5 h-5 text-revnu-gray" />,
  };

  return (
    <div
      className={`border-2 rounded-xl p-6 ${
        urgencyColors[sendRecommendation.urgency]
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {urgencyIcons[sendRecommendation.urgency]}
          <div>
            <h3 className="text-lg font-bold text-white">
              Notice of Intent to Lien
            </h3>
            <p className="text-sm text-revnu-gray">
              {noiCalculation.noiRequired
                ? `Required by ${organizationState} law`
                : `Recommended (47% payment rate)`}
            </p>
          </div>
        </div>

        {latestNOI && (
          <div className="flex items-center gap-2 px-3 py-1 bg-revnu-green/20 border border-revnu-green/30 rounded-full">
            <CheckCircle className="w-4 h-4 text-revnu-green" />
            <span className="text-xs font-semibold text-revnu-green">
              NOI Sent
            </span>
          </div>
        )}
      </div>

      {/* Deadline Summary */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-revnu-dark/40 rounded-lg p-3">
          <div className="text-xs text-revnu-gray mb-1">Optimal Send Date</div>
          <div className="text-sm font-bold text-white">
            {noiCalculation.noiWindow.optimal.toLocaleDateString()}
          </div>
        </div>
        <div className="bg-revnu-dark/40 rounded-lg p-3">
          <div className="text-xs text-revnu-gray mb-1">Lien Deadline</div>
          <div className="text-sm font-bold text-white">
            {noiCalculation.lienFilingDeadline.toLocaleDateString()}
          </div>
          <div className="text-xs text-yellow-500 mt-1">
            {noiCalculation.daysUntilLienDeadline} days remaining
          </div>
        </div>
      </div>

      {/* Recommendation */}
      <div className="mb-4 p-3 bg-revnu-dark/60 rounded-lg border border-revnu-slate/30">
        <p className="text-sm text-white">
          <strong>Recommendation:</strong> {sendRecommendation.reason}
        </p>
      </div>

      {/* Latest NOI Status */}
      {latestNOI && (
        <div className="mb-4 p-3 bg-revnu-green/10 rounded-lg border border-revnu-green/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-revnu-green">
              NOI Sent: {latestNOI.sentDate.toLocaleDateString()}
            </span>
            <span
              className={`text-xs px-2 py-1 rounded-full ${
                latestNOI.deliveryStatus === "delivered"
                  ? "bg-revnu-green/20 text-revnu-green"
                  : "bg-yellow-500/20 text-yellow-500"
              }`}
            >
              {latestNOI.deliveryStatus}
            </span>
          </div>
          <p className="text-xs text-revnu-gray">
            Response deadline: {latestNOI.responseDeadline.toLocaleDateString()}
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        {!latestNOI && sendRecommendation.shouldSend && (
          <button
            onClick={handleGenerateNOI}
            disabled={isGenerating}
            className="flex-1 px-4 py-3 bg-revnu-green text-revnu-dark font-bold rounded-lg hover:bg-revnu-greenLight transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin w-4 h-4 border-2 border-revnu-dark border-t-transparent rounded-full"></div>
                Generating...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Generate & Send NOI
              </>
            )}
          </button>
        )}

        {latestNOI && (
          <button
            onClick={handleGenerateNOI}
            disabled={isGenerating}
            className="flex-1 px-4 py-3 bg-revnu-slate/40 text-white font-semibold rounded-lg hover:bg-revnu-slate/60 transition-all flex items-center justify-center gap-2"
          >
            <FileText className="w-4 h-4" />
            Send Another NOI
          </button>
        )}

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="px-4 py-3 bg-revnu-slate/20 text-revnu-gray font-semibold rounded-lg hover:bg-revnu-slate/40 transition-all"
        >
          {isExpanded ? "Hide Details" : "View Details"}
        </button>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-revnu-slate/30">
          <h4 className="text-sm font-bold text-white mb-3">
            Lien Deadline Details
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-revnu-gray">Work Completion:</span>
              <span className="text-white font-semibold">
                {noiCalculation.workCompletionDate.toLocaleDateString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-revnu-gray">State:</span>
              <span className="text-white font-semibold">
                {noiCalculation.stateName}
              </span>
            </div>
            {noiCalculation.preliminaryNoticeDeadline && (
              <div className="flex justify-between">
                <span className="text-revnu-gray">Preliminary Notice Deadline:</span>
                <span className="text-white font-semibold">
                  {noiCalculation.preliminaryNoticeDeadline.toLocaleDateString()}
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-revnu-gray">Lien Filing Days:</span>
              <span className="text-white font-semibold">
                {noiCalculation.daysUntilLienDeadline} days remaining
              </span>
            </div>
          </div>

          {noiCalculation.deliveryRequirements.certifiedMailRequired && (
            <div className="mt-3 p-2 bg-yellow-500/10 border border-yellow-500/30 rounded text-xs text-yellow-500">
              ⚠️ {organizationState} requires certified mail delivery
            </div>
          )}
        </div>
      )}
    </div>
  );
}
