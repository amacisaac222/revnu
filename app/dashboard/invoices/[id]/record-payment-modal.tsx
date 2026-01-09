"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface RecordPaymentModalProps {
  invoiceId: string;
  invoiceNumber: string;
  amountRemaining: number;
  onClose: () => void;
}

export default function RecordPaymentModal({
  invoiceId,
  invoiceNumber,
  amountRemaining,
  onClose,
}: RecordPaymentModalProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    amount: (amountRemaining / 100).toFixed(2),
    paymentMethod: "check",
    paymentDate: new Date().toISOString().split("T")[0],
    referenceNumber: "",
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const amountInCents = Math.round(parseFloat(formData.amount) * 100);

      const response = await fetch(`/api/invoices/${invoiceId}/payments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          amount: amountInCents,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to record payment");
      }

      router.refresh();
      onClose();
    } catch (error: any) {
      console.error("Error recording payment:", error);
      alert(error.message || "Failed to record payment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-revnu-slate w-full max-w-lg rounded-xl border-2 border-revnu-green/20 shadow-xl max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="p-6 border-b border-revnu-green/20">
            <h2 className="text-2xl font-black text-white">Record Payment</h2>
            <p className="text-sm text-revnu-gray mt-1">
              Invoice {invoiceNumber} • Remaining: ${(amountRemaining / 100).toLocaleString()}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Amount */}
            <div>
              <label htmlFor="amount" className="block text-sm font-bold text-white mb-2">
                Payment Amount *
              </label>
              <div className="relative">
                <span className="absolute left-4 top-3 text-revnu-gray">$</span>
                <input
                  type="number"
                  id="amount"
                  required
                  min="0.01"
                  max={(amountRemaining / 100).toFixed(2)}
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 bg-revnu-dark/50 border-2 border-revnu-green/20 rounded-lg text-white focus:outline-none focus:border-revnu-green/40"
                  placeholder="0.00"
                />
              </div>
              <p className="text-xs text-revnu-gray mt-1">
                Maximum: ${(amountRemaining / 100).toFixed(2)}
              </p>
            </div>

            {/* Payment Method */}
            <div>
              <label htmlFor="paymentMethod" className="block text-sm font-bold text-white mb-2">
                Payment Method *
              </label>
              <select
                id="paymentMethod"
                required
                value={formData.paymentMethod}
                onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                className="w-full px-4 py-2 bg-revnu-dark/50 border-2 border-revnu-green/20 rounded-lg text-white focus:outline-none focus:border-revnu-green/40"
              >
                <option value="check">Check</option>
                <option value="cash">Cash</option>
                <option value="bank_transfer">Bank Transfer / Wire</option>
                <option value="ach">ACH</option>
                <option value="credit_card">Credit Card</option>
                <option value="venmo">Venmo</option>
                <option value="zelle">Zelle</option>
                <option value="paypal">PayPal</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Payment Date */}
            <div>
              <label htmlFor="paymentDate" className="block text-sm font-bold text-white mb-2">
                Payment Date *
              </label>
              <input
                type="date"
                id="paymentDate"
                required
                value={formData.paymentDate}
                onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
                className="w-full px-4 py-2 bg-revnu-dark/50 border-2 border-revnu-green/20 rounded-lg text-white focus:outline-none focus:border-revnu-green/40"
              />
            </div>

            {/* Reference Number */}
            <div>
              <label htmlFor="referenceNumber" className="block text-sm font-bold text-white mb-2">
                Reference / Confirmation Number
              </label>
              <input
                type="text"
                id="referenceNumber"
                value={formData.referenceNumber}
                onChange={(e) => setFormData({ ...formData, referenceNumber: e.target.value })}
                className="w-full px-4 py-2 bg-revnu-dark/50 border-2 border-revnu-green/20 rounded-lg text-white placeholder-revnu-gray focus:outline-none focus:border-revnu-green/40"
                placeholder="Check #, Transaction ID, etc."
              />
            </div>

            {/* Notes */}
            <div>
              <label htmlFor="notes" className="block text-sm font-bold text-white mb-2">
                Notes
              </label>
              <textarea
                id="notes"
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-4 py-2 bg-revnu-dark/50 border-2 border-revnu-green/20 rounded-lg text-white placeholder-revnu-gray focus:outline-none focus:border-revnu-green/40"
                placeholder="Any additional details about this payment..."
              />
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-revnu-green to-revnu-greenDark text-revnu-dark font-black rounded-lg hover:from-revnu-greenLight hover:to-revnu-green transition shadow-lg shadow-revnu-green/20 disabled:opacity-50"
              >
                {loading ? "Recording..." : "Record Payment"}
              </button>
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-6 py-3 bg-revnu-dark/50 border-2 border-revnu-green/30 text-white font-bold rounded-lg hover:bg-revnu-dark transition disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
