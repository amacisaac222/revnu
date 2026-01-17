"use client";

import { useState } from "react";
import { X, CreditCard, Zap, Shield, Check, Loader2 } from "lucide-react";

interface SubscriptionGateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubscribe: (promoCode?: string) => Promise<void>;
  title?: string;
  message?: string;
}

export default function SubscriptionGateModal({
  isOpen,
  onClose,
  onSubscribe,
  title = "Subscription Required",
  message = "You need an active subscription to send messages to your customers.",
}: SubscriptionGateModalProps) {
  const [promoCode, setPromoCode] = useState("");
  const [showPromoInput, setShowPromoInput] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubscribe = async () => {
    setLoading(true);
    setError("");
    try {
      await onSubscribe(promoCode || undefined);
    } catch (err: any) {
      setError(err.message || "Failed to start checkout. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative bg-revnu-dark border-2 border-revnu-green/30 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg hover:bg-revnu-slate/40 transition text-revnu-gray hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="p-8 border-b border-revnu-slate/30">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 bg-revnu-green/20 border border-revnu-green/40 rounded-xl flex items-center justify-center">
              <CreditCard className="w-7 h-7 text-revnu-green" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white">{title}</h2>
              <p className="text-revnu-gray mt-1">{message}</p>
            </div>
          </div>
        </div>

        {/* Pricing Card */}
        <div className="p-8">
          <div className="bg-gradient-to-br from-revnu-green/10 to-revnu-slate/20 border-2 border-revnu-green/40 rounded-xl p-6 mb-6">
            <div className="text-center mb-6">
              <div className="text-5xl font-black text-white mb-2">
                $99<span className="text-xl text-revnu-gray font-normal">/month</span>
              </div>
              <p className="text-revnu-green font-bold uppercase tracking-wide text-sm">
                14-Day Free Trial
              </p>
            </div>

            {/* Features */}
            <div className="space-y-3 mb-6">
              {[
                "500 SMS + 1,000 emails/month",
                "Unlimited customers & invoices",
                "Automated reminder sequences",
                "QuickBooks integration",
                "Up to 5 team members",
                "TCPA compliance tools",
                "Mechanics lien tracking",
              ].map((feature, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-revnu-green flex-shrink-0" />
                  <span className="text-white">{feature}</span>
                </div>
              ))}
            </div>

            {/* Why Subscribe Banner */}
            <div className="bg-revnu-dark/60 border border-revnu-grayLight/20 rounded-lg p-4 mb-4">
              <div className="flex items-start gap-3">
                <Zap className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="text-white font-semibold mb-1">Get paid faster, stress less</p>
                  <p className="text-revnu-gray">
                    Automate your collections and protect your payment rights with mechanics lien tracking
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Promo Code Section */}
          {!showPromoInput ? (
            <button
              onClick={() => setShowPromoInput(true)}
              className="text-sm text-revnu-green hover:text-revnu-greenLight transition mb-4 underline"
            >
              Have a promo code?
            </button>
          ) : (
            <div className="mb-4">
              <label className="block text-sm font-bold text-white mb-2">
                Promo Code
              </label>
              <input
                type="text"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                placeholder="Enter promo code"
                className="w-full px-4 py-3 bg-revnu-slate/40 border border-revnu-grayLight/20 rounded-lg text-white placeholder-revnu-gray focus:outline-none focus:border-revnu-green transition"
              />
              {promoCode && (
                <p className="text-xs text-revnu-green mt-2">
                  ✓ Extended 30-day trial will be applied
                </p>
              )}
            </div>
          )}

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-4">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {/* CTA Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleSubscribe}
              disabled={loading}
              className="w-full px-6 py-4 bg-revnu-green text-revnu-dark font-bold rounded-lg hover:bg-revnu-greenLight transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-revnu-green/20"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Starting checkout...
                </>
              ) : (
                <>
                  <CreditCard className="w-5 h-5" />
                  Start 14-Day Free Trial
                </>
              )}
            </button>

            <button
              onClick={onClose}
              className="w-full px-6 py-3 bg-transparent border border-revnu-grayLight/20 text-white font-semibold rounded-lg hover:bg-revnu-slate/40 transition"
            >
              Maybe Later
            </button>
          </div>

          {/* Trust Badges */}
          <div className="mt-6 pt-6 border-t border-revnu-slate/30">
            <div className="flex items-center justify-center gap-6 text-xs text-revnu-gray">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-revnu-green" />
                <span>Secure Checkout</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-revnu-green" />
                <span>Cancel Anytime</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-revnu-green" />
                <span>5-min Setup</span>
              </div>
            </div>
            <p className="text-center text-xs text-revnu-gray mt-4">
              No credit card required for trial • Powered by Stripe
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
