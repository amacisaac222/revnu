// Step 2: Business Volume Metrics Component
// Replaces the old "Collection Process" step

interface Step2Props {
  formData: {
    invoicesPerYear: number;
    latePaymentsPerMonth: number;
    timeSpentChasing: number;
    hasExistingInvoices: boolean;
    typicalPaymentTerms: number;
    averageInvoiceAmount: number;
  };
  setFormData: (data: any) => void;
}

export default function Step2BusinessVolume({ formData, setFormData }: Step2Props) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-black text-white mb-2">
          Tell us about your invoice volume
        </h3>
        <p className="text-revnu-gray">This helps us tune your collection sequences</p>
      </div>

      {/* Question 1: Invoices per year */}
      <div>
        <label className="block text-sm font-bold text-white mb-3">
          How many invoices do you send per year? *
        </label>
        <div className="space-y-2">
          {[
            { value: 25, label: "1-50 invoices/year", desc: "Small volume" },
            { value: 125, label: "51-200 invoices/year", desc: "Medium volume" },
            { value: 350, label: "201-500 invoices/year", desc: "Growing business" },
            { value: 750, label: "500+ invoices/year", desc: "Established business" },
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => setFormData({ ...formData, invoicesPerYear: option.value })}
              className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                formData.invoicesPerYear === option.value
                  ? "bg-revnu-green/20 border-revnu-green"
                  : "bg-revnu-dark border-revnu-green/20 hover:border-revnu-green/50"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 mt-0.5 flex items-center justify-center ${
                  formData.invoicesPerYear === option.value
                    ? "border-revnu-green bg-revnu-green"
                    : "border-revnu-gray"
                }`}>
                  {formData.invoicesPerYear === option.value && (
                    <div className="w-2 h-2 bg-revnu-dark rounded-full" />
                  )}
                </div>
                <div>
                  <div className="font-bold text-white">{option.label}</div>
                  <div className="text-sm text-revnu-gray">{option.desc}</div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Question 2: Late payments per month */}
      <div>
        <label className="block text-sm font-bold text-white mb-3">
          How many late payments do you typically deal with per month? *
        </label>
        <div className="space-y-2">
          {[
            { value: 2, label: "0-5 late payments/month", desc: "Occasional issues" },
            { value: 10, label: "6-15 late payments/month", desc: "Regular problem" },
            { value: 23, label: "16-30 late payments/month", desc: "Frequent issue" },
            { value: 40, label: "30+ late payments/month", desc: "Constant struggle" },
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => setFormData({ ...formData, latePaymentsPerMonth: option.value })}
              className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                formData.latePaymentsPerMonth === option.value
                  ? "bg-revnu-green/20 border-revnu-green"
                  : "bg-revnu-dark border-revnu-green/20 hover:border-revnu-green/50"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 mt-0.5 flex items-center justify-center ${
                  formData.latePaymentsPerMonth === option.value
                    ? "border-revnu-green bg-revnu-green"
                    : "border-revnu-gray"
                }`}>
                  {formData.latePaymentsPerMonth === option.value && (
                    <div className="w-2 h-2 bg-revnu-dark rounded-full" />
                  )}
                </div>
                <div>
                  <div className="font-bold text-white">{option.label}</div>
                  <div className="text-sm text-revnu-gray">{option.desc}</div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Question 3: Time spent chasing invoices */}
      <div>
        <label className="block text-sm font-bold text-white mb-3">
          How much time do you spend chasing invoices each week? *
        </label>
        <div className="space-y-2">
          {[
            { value: 0.5, label: "Less than 1 hour", desc: "Minimal time" },
            { value: 2, label: "1-3 hours", desc: "Noticeable burden" },
            { value: 4, label: "3-5 hours", desc: "Significant time" },
            { value: 7, label: "5+ hours", desc: "It's like a second job!" },
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => setFormData({ ...formData, timeSpentChasing: option.value })}
              className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                formData.timeSpentChasing === option.value
                  ? "bg-revnu-green/20 border-revnu-green"
                  : "bg-revnu-dark border-revnu-green/20 hover:border-revnu-green/50"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 mt-0.5 flex items-center justify-center ${
                  formData.timeSpentChasing === option.value
                    ? "border-revnu-green bg-revnu-green"
                    : "border-revnu-gray"
                }`}>
                  {formData.timeSpentChasing === option.value && (
                    <div className="w-2 h-2 bg-revnu-dark rounded-full" />
                  )}
                </div>
                <div>
                  <div className="font-bold text-white">{option.label}</div>
                  <div className="text-sm text-revnu-gray">{option.desc}</div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Existing fields */}
      <div className="pt-4 border-t border-revnu-green/20">
        <label className="flex items-center gap-3 cursor-pointer mb-4">
          <input
            type="checkbox"
            checked={formData.hasExistingInvoices}
            onChange={(e) => setFormData({ ...formData, hasExistingInvoices: e.target.checked })}
            className="w-5 h-5 rounded border-2 border-revnu-green/40 bg-revnu-dark checked:bg-revnu-green focus:outline-none"
          />
          <span className="text-white font-bold">I have outstanding invoices right now</span>
        </label>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-white mb-2">
              Payment Terms
            </label>
            <select
              value={formData.typicalPaymentTerms}
              onChange={(e) => setFormData({ ...formData, typicalPaymentTerms: parseInt(e.target.value) })}
              className="w-full px-4 py-3 bg-revnu-dark border-2 border-revnu-green/20 rounded-lg text-white focus:outline-none focus:border-revnu-green"
            >
              <option value={15}>Net 15</option>
              <option value={30}>Net 30</option>
              <option value={45}>Net 45</option>
              <option value={60}>Net 60</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-white mb-2">
              Average Invoice
            </label>
            <select
              value={formData.averageInvoiceAmount}
              onChange={(e) => setFormData({ ...formData, averageInvoiceAmount: parseInt(e.target.value) })}
              className="w-full px-4 py-3 bg-revnu-dark border-2 border-revnu-green/20 rounded-lg text-white focus:outline-none focus:border-revnu-green"
            >
              <option value={500}>$500</option>
              <option value={1000}>$1,000</option>
              <option value={2500}>$2,500</option>
              <option value={5000}>$5,000</option>
              <option value={10000}>$10,000+</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
