"use client";

import { AlertTriangle, X } from "lucide-react";

interface ConsentWarningModalProps {
  channel: "sms" | "email";
  customerName: string;
  hasConsent: boolean;
  consentMethod?: string | null;
  consentDate?: Date | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConsentWarningModal({
  channel,
  customerName,
  hasConsent,
  consentMethod,
  consentDate,
  onConfirm,
  onCancel,
}: ConsentWarningModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
      <div className="bg-revnu-dark border-2 border-revnu-green/30 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-revnu-green/20">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${hasConsent ? 'bg-revnu-green/20' : 'bg-red-500/20'}`}>
              <AlertTriangle className={`w-6 h-6 ${hasConsent ? 'text-revnu-green' : 'text-red-400'}`} />
            </div>
            <h2 className="text-xl font-black text-white">
              {hasConsent ? 'Confirm Message Send' : 'TCPA Compliance Warning'}
            </h2>
          </div>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-white transition p-2"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Consent Status */}
          <div className={`p-4 rounded-lg border ${
            hasConsent
              ? 'bg-revnu-green/10 border-revnu-green/30'
              : 'bg-red-900/20 border-red-500/30'
          }`}>
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <h3 className={`font-bold mb-2 ${hasConsent ? 'text-revnu-green' : 'text-red-400'}`}>
                  {channel === 'sms' ? 'SMS' : 'Email'} Consent Status
                </h3>
                <p className="text-sm text-gray-300 mb-3">
                  Customer: <span className="font-semibold text-white">{customerName}</span>
                </p>
                {hasConsent ? (
                  <div className="space-y-2 text-sm">
                    <p className="text-gray-300">
                      <span className="text-revnu-green font-semibold">✓ Consent documented</span>
                    </p>
                    {consentMethod && (
                      <p className="text-gray-400">
                        Method: {consentMethod}
                      </p>
                    )}
                    {consentDate && (
                      <p className="text-gray-400">
                        Date: {new Date(consentDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2 text-sm">
                    <p className="text-red-400 font-semibold">
                      ⚠ NO CONSENT DOCUMENTED
                    </p>
                    <p className="text-gray-300">
                      {channel === 'sms'
                        ? 'Sending SMS without prior express written consent violates TCPA regulations.'
                        : 'Sending email without consent may violate CAN-SPAM regulations.'
                      }
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* TCPA Warning for SMS */}
          {channel === 'sms' && !hasConsent && (
            <div className="bg-red-900/20 border-2 border-red-500/30 rounded-lg p-4">
              <h3 className="text-red-400 font-bold mb-3 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                TCPA VIOLATION RISK
              </h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="text-red-400 font-bold">•</span>
                  <span>TCPA penalties: <strong className="text-white">$500-$1,500 per message</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 font-bold">•</span>
                  <span>Class action lawsuit exposure with <strong className="text-white">unlimited damages</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 font-bold">•</span>
                  <span>FCC enforcement actions and fines</span>
                </li>
              </ul>
            </div>
          )}

          {/* Requirements Checklist */}
          <div className="bg-revnu-slate/40 border border-revnu-green/20 rounded-lg p-4">
            <h3 className="text-white font-bold mb-3">Before Sending, Confirm:</h3>
            <div className="space-y-2 text-sm">
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  required
                  className="mt-1 w-4 h-4 rounded border-revnu-green/30 bg-revnu-dark text-revnu-green focus:ring-revnu-green focus:ring-offset-0"
                />
                <span className="text-gray-300 group-hover:text-white transition">
                  {channel === 'sms'
                    ? 'I have obtained prior express written consent from this customer to receive SMS messages'
                    : 'I have obtained consent from this customer to receive email communications'
                  }
                </span>
              </label>
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  required
                  className="mt-1 w-4 h-4 rounded border-revnu-green/30 bg-revnu-dark text-revnu-green focus:ring-revnu-green focus:ring-offset-0"
                />
                <span className="text-gray-300 group-hover:text-white transition">
                  The customer has NOT opted out or requested to stop receiving messages
                </span>
              </label>
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  required
                  className="mt-1 w-4 h-4 rounded border-revnu-green/30 bg-revnu-dark text-revnu-green focus:ring-revnu-green focus:ring-offset-0"
                />
                <span className="text-gray-300 group-hover:text-white transition">
                  I have a legitimate business relationship with this customer (they owe payment)
                </span>
              </label>
              {channel === 'sms' && (
                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    required
                    className="mt-1 w-4 h-4 rounded border-revnu-green/30 bg-revnu-dark text-revnu-green focus:ring-revnu-green focus:ring-offset-0"
                  />
                  <span className="text-gray-300 group-hover:text-white transition">
                    Current time is between 8 AM - 9 PM in the customer's time zone
                  </span>
                </label>
              )}
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  required
                  className="mt-1 w-4 h-4 rounded border-revnu-green/30 bg-revnu-dark text-revnu-green focus:ring-revnu-green focus:ring-offset-0"
                />
                <span className="text-gray-300 group-hover:text-white transition">
                  I understand that I am solely responsible for TCPA compliance and any violations
                </span>
              </label>
            </div>
          </div>

          {/* Legal Disclaimer */}
          <div className="text-xs text-gray-500 bg-revnu-darker/50 border border-revnu-green/10 rounded p-3">
            <p className="mb-2">
              <strong className="text-gray-400">Legal Disclaimer:</strong> By clicking "Send Message" below, you certify that you have obtained all necessary consents and comply with TCPA, CAN-SPAM, and all applicable regulations. REVNU is a software platform only and you are solely responsible for your messaging practices.
            </p>
            <p>
              Refer to our <a href="/acceptable-use" target="_blank" className="text-revnu-green hover:underline">Acceptable Use Policy</a> and <a href="/terms" target="_blank" className="text-revnu-green hover:underline">Terms of Service</a> for complete details.
            </p>
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
            onClick={onConfirm}
            className={`flex-1 px-6 py-3 font-bold rounded-lg transition ${
              hasConsent
                ? 'bg-gradient-to-r from-revnu-green to-revnu-greenDark text-revnu-dark hover:from-revnu-greenLight hover:to-revnu-green shadow-lg shadow-revnu-green/20'
                : 'bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-500/20'
            }`}
          >
            {hasConsent ? 'Send Message' : 'Send Anyway (I Accept Risk)'}
          </button>
        </div>
      </div>
    </div>
  );
}
