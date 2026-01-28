// Step 5: Payment & Contact Info Component
// NEW step for collecting payment instructions and contact details

interface Step5Props {
  formData: {
    businessName: string;
    businessEmail: string;
    paymentInstructions: string;
    paymentLink: string;
  };
  setFormData: (data: any) => void;
}

export default function Step5PaymentContact({ formData, setFormData }: Step5Props) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-black text-white mb-2">
          Payment & Contact Setup
        </h3>
        <p className="text-revnu-gray">
          Tell customers how to pay you - this goes in every reminder message
        </p>
      </div>

      {/* Business Email */}
      <div>
        <label className="block text-sm font-bold text-white mb-2">
          Business Email
        </label>
        <input
          type="email"
          value={formData.businessEmail}
          onChange={(e) => setFormData({ ...formData, businessEmail: e.target.value })}
          className="w-full px-4 py-3 bg-revnu-dark border-2 border-revnu-green/20 rounded-lg text-white focus:outline-none focus:border-revnu-green"
          placeholder="invoices@yourbusiness.com"
        />
        <p className="mt-2 text-xs text-revnu-gray">
          Used in message signatures and as reply-to address
        </p>
      </div>

      {/* Payment Link (Optional) */}
      <div>
        <label className="block text-sm font-bold text-white mb-2">
          Payment Link (Optional)
        </label>
        <input
          type="url"
          value={formData.paymentLink}
          onChange={(e) => setFormData({ ...formData, paymentLink: e.target.value })}
          className="w-full px-4 py-3 bg-revnu-dark border-2 border-revnu-green/20 rounded-lg text-white focus:outline-none focus:border-revnu-green"
          placeholder="https://pay.stripe.com/yourlink or https://square.link/u/..."
        />
        <p className="mt-2 text-xs text-revnu-gray">
          If you use Stripe, Square, PayPal, or another payment processor, paste your payment link here
        </p>
      </div>

      {/* OR separator */}
      <div className="flex items-center gap-4">
        <div className="flex-1 h-px bg-revnu-green/20"></div>
        <span className="text-revnu-gray text-sm font-bold">OR</span>
        <div className="flex-1 h-px bg-revnu-green/20"></div>
      </div>

      {/* Payment Instructions */}
      <div>
        <label className="block text-sm font-bold text-white mb-2">
          Payment Instructions
        </label>
        <textarea
          value={formData.paymentInstructions}
          onChange={(e) => setFormData({ ...formData, paymentInstructions: e.target.value })}
          rows={4}
          maxLength={250}
          className="w-full px-4 py-3 bg-revnu-dark border-2 border-revnu-green/20 rounded-lg text-white focus:outline-none focus:border-revnu-green resize-none"
          placeholder={`We accept:\n• Check (mail to 123 Main St)\n• Venmo (@yourbusiness)\n• Zelle (email@business.com)\n• Cash`}
        />
        <p className="mt-2 text-xs text-revnu-gray">
          {formData.paymentInstructions.length}/250 characters - Tell customers how to pay (check, Venmo, Zelle, etc.)
        </p>
      </div>

      {/* Preview */}
      <div className="bg-revnu-dark border-2 border-revnu-green/20 rounded-lg p-4">
        <div className="text-sm font-bold text-white mb-2">Preview:</div>
        <div className="text-sm text-revnu-gray">
          {formData.paymentLink ? (
            <>Pay now: {formData.paymentLink}</>
          ) : formData.paymentInstructions ? (
            <>{formData.paymentInstructions}</>
          ) : (
            <span className="italic">Your payment instructions will appear here...</span>
          )}
        </div>
      </div>

      {/* Info box */}
      <div className="bg-blue-500/10 border-2 border-blue-500/30 rounded-lg p-4">
        <div className="flex gap-3">
          <div className="text-2xl">💡</div>
          <div>
            <div className="font-bold text-white text-sm mb-1">How this works:</div>
            <div className="text-xs text-revnu-gray space-y-1">
              <p>• If you provide a payment link, we'll use that in all reminder messages</p>
              <p>• If not, we'll use your custom payment instructions instead</p>
              <p>• You can always update this later in Settings</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
