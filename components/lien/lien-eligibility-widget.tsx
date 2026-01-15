"use client";

import { Shield, AlertTriangle, CheckCircle, Clock, HelpCircle } from "lucide-react";
import { calculateLienDeadlines, isLienEligible, formatDeadlineMessage } from "@/lib/lien-deadlines";

interface LienEligibilityWidgetProps {
  invoice: {
    id: string;
    invoiceNumber: string;
    description: string | null;
    amountRemaining: number;
    status: string;
    firstWorkDate: Date | null;
    lastWorkDate: Date | null;
    lienEligible: boolean;
    preliminaryNoticeSent: boolean;
    lienFiled: boolean;
  };
  customer: {
    propertyAddress: string | null;
    propertyCity: string | null;
    propertyState: string | null;
    propertyZip: string | null;
  };
}

export default function LienEligibilityWidget({
  invoice,
  customer,
}: LienEligibilityWidgetProps) {
  const hasPropertyAddress = !!(
    customer.propertyAddress &&
    customer.propertyState
  );

  const eligible = isLienEligible(
    hasPropertyAddress,
    customer.propertyState,
    invoice.description
  );

  const deadlines = customer.propertyState && invoice.lastWorkDate
    ? calculateLienDeadlines(
        customer.propertyState,
        invoice.firstWorkDate,
        invoice.lastWorkDate
      )
    : null;

  // Don't show widget if invoice is paid
  if (invoice.status === "paid") {
    return null;
  }

  // Not eligible - show why
  if (!eligible) {
    return (
      <div className="bg-revnu-slate/40 border border-revnu-gray/20 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <HelpCircle className="w-5 h-5 text-revnu-gray flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-bold text-white mb-2">
              Mechanics Lien Status
            </h3>
            <p className="text-sm text-revnu-gray mb-3">
              This invoice may not qualify for mechanics lien protection:
            </p>
            <ul className="text-xs text-revnu-gray space-y-1 ml-4">
              {!hasPropertyAddress && (
                <li>• Missing property address</li>
              )}
              {!customer.propertyState && (
                <li>• Missing property state</li>
              )}
              {hasPropertyAddress && customer.propertyState && (
                <li>• Work description doesn't indicate property improvement</li>
              )}
            </ul>
            <p className="text-xs text-revnu-gray mt-3">
              Add property details to enable lien protection tracking.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Eligible - show deadlines and status
  return (
    <div className={`border-2 rounded-xl p-6 ${
      deadlines?.warningLevel === "red"
        ? "bg-red-500/10 border-red-500/50"
        : deadlines?.warningLevel === "yellow"
        ? "bg-amber-500/10 border-amber-500/50"
        : "bg-revnu-green/10 border-revnu-green/50"
    }`}>
      <div className="flex items-start gap-3 mb-4">
        <Shield className={`w-6 h-6 flex-shrink-0 mt-0.5 ${
          deadlines?.warningLevel === "red"
            ? "text-red-400"
            : deadlines?.warningLevel === "yellow"
            ? "text-amber-400"
            : "text-revnu-green"
        }`} />
        <div className="flex-1">
          <h3 className="text-lg font-bold text-white mb-1">
            Mechanics Lien Protection
          </h3>
          <p className="text-sm text-revnu-gray">
            This invoice qualifies for mechanics lien rights in {customer.propertyState}
          </p>
        </div>
      </div>

      {/* Deadline Status */}
      {deadlines && (
        <div className="space-y-3">
          <div className={`p-4 rounded-lg ${
            deadlines.warningLevel === "red"
              ? "bg-red-500/20"
              : deadlines.warningLevel === "yellow"
              ? "bg-amber-500/20"
              : "bg-revnu-dark/50"
          }`}>
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-white" />
              <span className="text-sm font-bold text-white">Filing Deadline</span>
            </div>
            <p className="text-sm text-white">
              {formatDeadlineMessage(deadlines)}
            </p>
            {deadlines.lienFilingDeadline && (
              <p className="text-xs text-revnu-gray mt-1">
                Deadline: {deadlines.lienFilingDeadline.toLocaleDateString()}
              </p>
            )}
          </div>

          {/* Status Checklist */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              {invoice.firstWorkDate ? (
                <>
                  <CheckCircle className="w-4 h-4 text-revnu-green" />
                  <span className="text-white">First work date recorded</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <span className="text-revnu-gray">Set first work date</span>
                </>
              )}
            </div>

            <div className="flex items-center gap-2 text-sm">
              {invoice.lastWorkDate ? (
                <>
                  <CheckCircle className="w-4 h-4 text-revnu-green" />
                  <span className="text-white">Completion date recorded</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <span className="text-revnu-gray">Set completion date</span>
                </>
              )}
            </div>

            {deadlines.preliminaryNoticeRequired && (
              <div className="flex items-center gap-2 text-sm">
                {invoice.preliminaryNoticeSent ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-revnu-green" />
                    <span className="text-white">Preliminary notice sent</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    <span className="text-revnu-gray">
                      Send preliminary notice ({deadlines.preliminaryNoticeDays}-day notice required)
                    </span>
                  </>
                )}
              </div>
            )}

            <div className="flex items-center gap-2 text-sm">
              {invoice.lienFiled ? (
                <>
                  <CheckCircle className="w-4 h-4 text-revnu-green" />
                  <span className="text-white">Mechanics lien filed</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <span className="text-revnu-gray">Lien not yet filed</span>
                </>
              )}
            </div>
          </div>

          {/* Educational Note */}
          <div className="mt-4 p-3 bg-revnu-dark/30 rounded-lg border border-revnu-green/20">
            <p className="text-xs text-revnu-gray leading-relaxed">
              <strong className="text-white">What is a mechanics lien?</strong><br />
              A legal claim against property that secures payment for construction work.
              It prevents the property from being sold or refinanced until the debt is paid,
              creating strong motivation for payment.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 mt-4">
            <button className="flex-1 px-4 py-2 bg-revnu-green text-revnu-dark font-bold rounded-lg hover:bg-revnu-greenLight transition text-sm">
              View Lien Documents
            </button>
            <button className="px-4 py-2 border border-revnu-green/30 text-revnu-green font-semibold rounded-lg hover:bg-revnu-green/10 transition text-sm">
              Learn More
            </button>
          </div>
        </div>
      )}

      {!invoice.lastWorkDate && (
        <div className="mt-4 p-3 bg-amber-500/20 rounded-lg border border-amber-500/30">
          <p className="text-sm text-amber-200">
            <strong>Action Required:</strong> Set the work completion date to track lien filing deadlines.
          </p>
        </div>
      )}
    </div>
  );
}
