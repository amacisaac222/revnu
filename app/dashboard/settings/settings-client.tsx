"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { US_STATES } from "@/components/onboarding/state-dropdown";

interface Organization {
  id: string;
  businessName: string;
  industry: string | null;
  phone: string | null;
  email: string | null;
  timezone: string;
  primaryState: string | null;
  invoicesPerYear: number | null;
  latePaymentsPerMonth: number | null;
  timeSpentChasing: number | null;
  defaultPaymentUrl: string | null;
  paymentInstructions: string | null;
  communicationTone: string | null;
  typicalPaymentTerms: number;
  averageInvoiceAmount: number | null;
  preferredChannels: any;
}

interface SettingsClientProps {
  organization: Organization;
}

type Tab = "profile" | "payment" | "notifications";

export default function SettingsClient({ organization }: SettingsClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("profile");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const [formData, setFormData] = useState({
    // Profile
    businessName: organization.businessName,
    industry: organization.industry || "electrical",
    phone: organization.phone || "",
    email: organization.email || "",
    timezone: organization.timezone,
    primaryState: organization.primaryState || "",

    // Business Metrics
    invoicesPerYear: organization.invoicesPerYear || 0,
    latePaymentsPerMonth: organization.latePaymentsPerMonth || 0,
    timeSpentChasing: organization.timeSpentChasing || 0,
    typicalPaymentTerms: organization.typicalPaymentTerms,
    averageInvoiceAmount: organization.averageInvoiceAmount ? organization.averageInvoiceAmount / 100 : 1000,

    // Payment
    paymentLink: organization.defaultPaymentUrl || "",
    paymentInstructions: organization.paymentInstructions || "",

    // Communication
    communicationTone: organization.communicationTone || "professional",
  });

  const handleSave = async () => {
    setLoading(true);
    setSuccessMessage("");

    try {
      const response = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organizationId: organization.id,
          ...formData,
          averageInvoiceAmount: formData.averageInvoiceAmount * 100, // Convert to cents
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save settings");
      }

      setSuccessMessage("Settings saved successfully!");
      router.refresh();

      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error("Error saving settings:", error);
      alert("Failed to save settings. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: "profile" as Tab, label: "Business Profile", icon: "🏢" },
    { id: "payment" as Tab, label: "Payment Methods", icon: "💳" },
    { id: "notifications" as Tab, label: "Notifications", icon: "🔔" },
  ];

  return (
    <div className="min-h-screen bg-revnu-dark p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-black text-white mb-2">Settings</h1>
          <p className="text-revnu-gray">
            Manage your business profile, payment methods, and preferences
          </p>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 p-4 bg-revnu-green/20 border-2 border-revnu-green rounded-lg">
            <div className="flex items-center gap-2">
              <span className="text-2xl">✓</span>
              <span className="text-white font-bold">{successMessage}</span>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="border-b border-revnu-green/20 mb-8">
          <div className="flex gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 font-bold transition-all ${
                  activeTab === tab.id
                    ? "text-revnu-green border-b-2 border-revnu-green"
                    : "text-revnu-gray hover:text-white"
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-revnu-slate/40 border-2 border-revnu-green/30 rounded-2xl p-8">
          {/* PROFILE TAB */}
          {activeTab === "profile" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-black text-white mb-4">Business Information</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-white mb-2">
                    Business Name *
                  </label>
                  <input
                    type="text"
                    value={formData.businessName}
                    onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                    className="w-full px-4 py-3 bg-revnu-dark border-2 border-revnu-green/20 rounded-lg text-white focus:outline-none focus:border-revnu-green"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-white mb-2">
                    Industry *
                  </label>
                  <select
                    value={formData.industry}
                    onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                    className="w-full px-4 py-3 bg-revnu-dark border-2 border-revnu-green/20 rounded-lg text-white focus:outline-none focus:border-revnu-green"
                  >
                    <option value="electrical">Electrical</option>
                    <option value="hvac">HVAC</option>
                    <option value="plumbing">Plumbing</option>
                    <option value="general_contractor">General Contractor</option>
                    <option value="roofing">Roofing</option>
                    <option value="landscaping">Landscaping</option>
                    <option value="carpentry">Carpentry</option>
                    <option value="painting">Painting</option>
                    <option value="other">Other Trades</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-white mb-2">
                    Primary State *
                  </label>
                  <select
                    value={formData.primaryState}
                    onChange={(e) => setFormData({ ...formData, primaryState: e.target.value })}
                    className="w-full px-4 py-3 bg-revnu-dark border-2 border-revnu-green/20 rounded-lg text-white focus:outline-none focus:border-revnu-green"
                  >
                    <option value="">Select state...</option>
                    {US_STATES.map((state) => (
                      <option key={state.code} value={state.code}>
                        {state.name}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-xs text-revnu-gray">
                    Used for state-specific mechanic's lien laws
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-bold text-white mb-2">
                    Timezone *
                  </label>
                  <select
                    value={formData.timezone}
                    onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                    className="w-full px-4 py-3 bg-revnu-dark border-2 border-revnu-green/20 rounded-lg text-white focus:outline-none focus:border-revnu-green"
                  >
                    <option value="America/New_York">Eastern Time</option>
                    <option value="America/Chicago">Central Time</option>
                    <option value="America/Denver">Mountain Time</option>
                    <option value="America/Los_Angeles">Pacific Time</option>
                    <option value="America/Phoenix">Arizona</option>
                    <option value="America/Anchorage">Alaska</option>
                    <option value="Pacific/Honolulu">Hawaii</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-white mb-2">
                    Business Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 bg-revnu-dark border-2 border-revnu-green/20 rounded-lg text-white focus:outline-none focus:border-revnu-green"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-white mb-2">
                    Business Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 bg-revnu-dark border-2 border-revnu-green/20 rounded-lg text-white focus:outline-none focus:border-revnu-green"
                    placeholder="contact@business.com"
                  />
                </div>
              </div>

              <div className="pt-6 border-t border-revnu-green/20">
                <h3 className="text-xl font-black text-white mb-4">Business Metrics</h3>
                <p className="text-sm text-revnu-gray mb-4">
                  These metrics help tune your collection sequences for optimal results
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-white mb-2">
                      Invoices Per Year
                    </label>
                    <select
                      value={formData.invoicesPerYear}
                      onChange={(e) => setFormData({ ...formData, invoicesPerYear: parseInt(e.target.value) })}
                      className="w-full px-4 py-3 bg-revnu-dark border-2 border-revnu-green/20 rounded-lg text-white focus:outline-none focus:border-revnu-green"
                    >
                      <option value={25}>1-50 invoices/year</option>
                      <option value={125}>51-200 invoices/year</option>
                      <option value={350}>201-500 invoices/year</option>
                      <option value={750}>500+ invoices/year</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-white mb-2">
                      Late Payments Per Month
                    </label>
                    <select
                      value={formData.latePaymentsPerMonth}
                      onChange={(e) => setFormData({ ...formData, latePaymentsPerMonth: parseInt(e.target.value) })}
                      className="w-full px-4 py-3 bg-revnu-dark border-2 border-revnu-green/20 rounded-lg text-white focus:outline-none focus:border-revnu-green"
                    >
                      <option value={2}>0-5 late payments/month</option>
                      <option value={10}>6-15 late payments/month</option>
                      <option value={23}>16-30 late payments/month</option>
                      <option value={40}>30+ late payments/month</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-white mb-2">
                      Time Spent Chasing (hours/week)
                    </label>
                    <select
                      value={formData.timeSpentChasing}
                      onChange={(e) => setFormData({ ...formData, timeSpentChasing: parseFloat(e.target.value) })}
                      className="w-full px-4 py-3 bg-revnu-dark border-2 border-revnu-green/20 rounded-lg text-white focus:outline-none focus:border-revnu-green"
                    >
                      <option value={0.5}>Less than 1 hour</option>
                      <option value={2}>1-3 hours</option>
                      <option value={4}>3-5 hours</option>
                      <option value={7}>5+ hours</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-white mb-2">
                      Communication Tone
                    </label>
                    <select
                      value={formData.communicationTone}
                      onChange={(e) => setFormData({ ...formData, communicationTone: e.target.value })}
                      className="w-full px-4 py-3 bg-revnu-dark border-2 border-revnu-green/20 rounded-lg text-white focus:outline-none focus:border-revnu-green"
                    >
                      <option value="friendly">Friendly</option>
                      <option value="professional">Professional</option>
                      <option value="firm">Firm</option>
                      <option value="casual">Casual</option>
                    </select>
                  </div>

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
                      Average Invoice Amount
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
          )}

          {/* PAYMENT TAB */}
          {activeTab === "payment" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-black text-white mb-2">Payment Methods</h2>
                <p className="text-revnu-gray">
                  Configure how customers pay you - this appears in all reminder messages
                </p>
              </div>

              <div>
                <label className="block text-sm font-bold text-white mb-2">
                  Payment Link (Optional)
                </label>
                <input
                  type="url"
                  value={formData.paymentLink}
                  onChange={(e) => setFormData({ ...formData, paymentLink: e.target.value })}
                  className="w-full px-4 py-3 bg-revnu-dark border-2 border-revnu-green/20 rounded-lg text-white focus:outline-none focus:border-revnu-green"
                  placeholder="https://pay.stripe.com/yourlink"
                />
                <p className="mt-2 text-xs text-revnu-gray">
                  Stripe, Square, PayPal, or any other payment processor link
                </p>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex-1 h-px bg-revnu-green/20"></div>
                <span className="text-revnu-gray text-sm font-bold">OR</span>
                <div className="flex-1 h-px bg-revnu-green/20"></div>
              </div>

              <div>
                <label className="block text-sm font-bold text-white mb-2">
                  Payment Instructions
                </label>
                <textarea
                  value={formData.paymentInstructions}
                  onChange={(e) => setFormData({ ...formData, paymentInstructions: e.target.value })}
                  rows={5}
                  maxLength={250}
                  className="w-full px-4 py-3 bg-revnu-dark border-2 border-revnu-green/20 rounded-lg text-white focus:outline-none focus:border-revnu-green resize-none"
                  placeholder="We accept:
• Check (mail to 123 Main St)
• Venmo (@yourbusiness)
• Zelle (email@business.com)
• Cash"
                />
                <p className="mt-2 text-xs text-revnu-gray">
                  {formData.paymentInstructions.length}/250 characters
                </p>
              </div>

              <div className="bg-revnu-dark border-2 border-revnu-green/20 rounded-lg p-4">
                <div className="text-sm font-bold text-white mb-2">Preview in Messages:</div>
                <div className="text-sm text-revnu-gray">
                  {formData.paymentLink ? (
                    <>Pay now: {formData.paymentLink}</>
                  ) : formData.paymentInstructions ? (
                    <pre className="font-sans whitespace-pre-wrap">{formData.paymentInstructions}</pre>
                  ) : (
                    <span className="italic">Your payment info will appear here...</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* NOTIFICATIONS TAB */}
          {activeTab === "notifications" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-black text-white mb-2">Notification Settings</h2>
                <p className="text-revnu-gray">
                  Coming soon: Email notifications for important events
                </p>
              </div>

              <div className="bg-blue-500/10 border-2 border-blue-500/30 rounded-lg p-6 text-center">
                <div className="text-4xl mb-3">🚧</div>
                <div className="text-white font-bold mb-2">Under Construction</div>
                <div className="text-sm text-revnu-gray">
                  Notification settings will be available in a future update
                </div>
              </div>
            </div>
          )}

          {/* Save Button */}
          <div className="mt-8 pt-6 border-t border-revnu-green/20">
            <button
              onClick={handleSave}
              disabled={loading}
              className="px-8 py-3 bg-gradient-to-r from-revnu-green to-revnu-greenDark text-revnu-dark font-black rounded-lg hover:from-revnu-greenLight hover:to-revnu-green transition shadow-lg shadow-revnu-green/20 disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
