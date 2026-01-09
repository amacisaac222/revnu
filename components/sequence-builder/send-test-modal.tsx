"use client";

import { useState } from "react";

interface SendTestModalProps {
  channel: "sms" | "email" | "both";
  subject?: string;
  message: string;
  onClose: () => void;
}

export default function SendTestModal({ channel, subject, message, onClose }: SendTestModalProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const [testEmail, setTestEmail] = useState("");
  const [testPhone, setTestPhone] = useState("");

  const handleSend = async (testChannel: "sms" | "email") => {
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const response = await fetch("/api/sequences/send-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channel: testChannel,
          subject,
          message,
          testEmail: testChannel === "email" ? testEmail : undefined,
          testPhone: testChannel === "sms" ? testPhone : undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send test");
      }

      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Failed to send test message");
    } finally {
      setLoading(false);
    }
  };

  const showEmailForm = channel === "email" || channel === "both";
  const showSMSForm = channel === "sms" || channel === "both";

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-revnu-slate border border-revnu-green/20 rounded-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-black text-white">Send Test Message</h3>
          <button
            onClick={onClose}
            className="text-revnu-gray hover:text-white transition"
          >
            ✕
          </button>
        </div>

        {success && (
          <div className="mb-4 p-3 bg-revnu-green/20 border border-revnu-green/30 rounded-lg">
            <p className="text-revnu-green font-semibold text-sm">
              ✓ Test message sent successfully!
            </p>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
            <p className="text-red-400 font-semibold text-sm">{error}</p>
          </div>
        )}

        <div className="space-y-4">
          {/* SMS Test */}
          {showSMSForm && (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-bold text-white mb-2">
                  Your Phone Number
                </label>
                <input
                  type="tel"
                  value={testPhone}
                  onChange={(e) => setTestPhone(e.target.value)}
                  placeholder="+1 (555) 123-4567"
                  className="w-full px-4 py-2 bg-revnu-dark border border-revnu-green/30 rounded-lg text-white focus:border-revnu-green focus:outline-none"
                />
                <p className="text-xs text-revnu-gray mt-1">
                  Include country code (e.g., +1 for US)
                </p>
              </div>
              <button
                onClick={() => handleSend("sms")}
                disabled={loading || !testPhone.trim()}
                className="w-full px-4 py-2 bg-revnu-green text-revnu-dark font-black rounded-lg hover:bg-revnu-greenLight transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Sending..." : "📱 Send Test SMS"}
              </button>
            </div>
          )}

          {/* Divider */}
          {showEmailForm && showSMSForm && (
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-revnu-green/20"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-2 bg-revnu-slate text-revnu-gray">OR</span>
              </div>
            </div>
          )}

          {/* Email Test */}
          {showEmailForm && (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-bold text-white mb-2">
                  Your Email Address
                </label>
                <input
                  type="email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-4 py-2 bg-revnu-dark border border-revnu-green/30 rounded-lg text-white focus:border-revnu-green focus:outline-none"
                />
              </div>
              <button
                onClick={() => handleSend("email")}
                disabled={loading || !testEmail.trim()}
                className="w-full px-4 py-2 bg-revnu-green text-revnu-dark font-black rounded-lg hover:bg-revnu-greenLight transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Sending..." : "📧 Send Test Email"}
              </button>
            </div>
          )}
        </div>

        <div className="mt-6 p-3 bg-revnu-dark/50 border border-revnu-green/10 rounded-lg">
          <p className="text-xs text-revnu-gray">
            <span className="font-bold text-white">Note:</span> Currently simulating sends (Twilio/Resend not configured). In production, this will send actual messages.
          </p>
        </div>
      </div>
    </div>
  );
}
