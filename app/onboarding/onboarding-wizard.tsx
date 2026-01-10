"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface OnboardingWizardProps {
  userEmail: string;
  userName: string;
}

type Step = 1 | 2 | 3 | 4 | 5;

export default function OnboardingWizard({ userEmail, userName }: OnboardingWizardProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);
  const [generatingSequences, setGeneratingSequences] = useState(false);

  const [formData, setFormData] = useState({
    // Step 1: Business Basics
    businessName: "",
    industry: "electrical",
    phone: "",
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "America/New_York",

    // Step 2: Collection Process
    collectionMethod: "",
    hasExistingInvoices: false,
    typicalPaymentTerms: 30,
    averageInvoiceAmount: 1000, // in dollars, will convert to cents

    // Step 3: Communication Preferences
    preferredChannels: {
      sms: false,
      email: false,
      phone: false,
    },
    followUpFrequency: "",

    // Step 4: Brand Voice
    communicationTone: "",
  });

  const nextStep = () => {
    if (currentStep < 5) {
      setCurrentStep((currentStep + 1) as Step);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as Step);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setGeneratingSequences(true);

    try {
      // Step 1: Create organization
      const orgResponse = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          averageInvoiceAmount: formData.averageInvoiceAmount * 100, // Convert to cents
          userEmail,
          userName,
        }),
      });

      if (!orgResponse.ok) {
        throw new Error("Failed to create organization");
      }

      const orgData = await orgResponse.json();

      // Step 2: Generate AI sequences
      const sequencesResponse = await fetch("/api/onboarding/generate-sequences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organizationId: orgData.organization.id,
          businessName: formData.businessName,
          industry: formData.industry,
          collectionMethod: formData.collectionMethod,
          hasExistingInvoices: formData.hasExistingInvoices,
          preferredChannels: formData.preferredChannels,
          communicationTone: formData.communicationTone,
          followUpFrequency: formData.followUpFrequency,
          averageInvoiceAmount: formData.averageInvoiceAmount * 100,
          typicalPaymentTerms: formData.typicalPaymentTerms,
        }),
      });

      if (!sequencesResponse.ok) {
        throw new Error("Failed to generate sequences");
      }

      // Success! Redirect to dashboard
      router.push("/dashboard");
    } catch (error) {
      console.error("Onboarding error:", error);
      alert("Something went wrong. Please try again.");
      setGeneratingSequences(false);
    } finally {
      setLoading(false);
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.businessName.trim().length > 0;
      case 2:
        return formData.collectionMethod !== "";
      case 3:
        return (
          (formData.preferredChannels.sms ||
           formData.preferredChannels.email ||
           formData.preferredChannels.phone) &&
          formData.followUpFrequency !== ""
        );
      case 4:
        return formData.communicationTone !== "";
      case 5:
        return true;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-revnu-dark flex flex-col">
      {/* Progress Bar */}
      <div className="bg-revnu-darker border-b border-revnu-green/20 px-6 py-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-black text-white">Setup Your Account</h2>
            <span className="text-sm text-revnu-gray">Step {currentStep} of 5</span>
          </div>
          <div className="h-2 bg-revnu-slate/40 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-revnu-green to-revnu-greenDark transition-all duration-300"
              style={{ width: `${(currentStep / 5) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="max-w-2xl w-full">
          <div className="bg-revnu-slate/40 border-2 border-revnu-green/30 rounded-2xl p-8">
            {/* Loading State */}
            {generatingSequences && (
              <div className="text-center py-12">
                <div className="inline-block animate-spin text-6xl mb-6">🤖</div>
                <h3 className="text-2xl font-black text-white mb-3">
                  Generating Your Custom Sequences...
                </h3>
                <p className="text-revnu-gray mb-4">
                  Our AI is creating personalized collection messages for {formData.businessName}
                </p>
                <div className="max-w-md mx-auto space-y-2 text-left">
                  <div className="flex items-center gap-2 text-sm text-revnu-gray">
                    <span className="text-revnu-green">✓</span>
                    <span>Analyzing your industry and communication style...</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-revnu-gray">
                    <span className="text-revnu-green">✓</span>
                    <span>Crafting professional message templates...</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-revnu-gray">
                    <span className="animate-pulse text-revnu-green">●</span>
                    <span>Setting up your collection cadence...</span>
                  </div>
                </div>
              </div>
            )}

            {/* Step 1: Business Basics */}
            {!generatingSequences && currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-2xl font-black text-white mb-2">
                    Tell us about your business
                  </h3>
                  <p className="text-revnu-gray">We'll use this to personalize everything for you</p>
                </div>

                <div>
                  <label className="block text-sm font-bold text-white mb-2">
                    Business Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.businessName}
                    onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                    className="w-full px-4 py-3 bg-revnu-dark border-2 border-revnu-green/20 rounded-lg text-white focus:outline-none focus:border-revnu-green"
                    placeholder="Smith Electrical Services"
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
                  <p className="mt-2 text-xs text-revnu-gray">
                    Used to send messages during appropriate hours (8 AM - 9 PM)
                  </p>
                </div>
              </div>
            )}

            {/* Step 2: Collection Process */}
            {!generatingSequences && currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-2xl font-black text-white mb-2">
                    How do you currently collect payments?
                  </h3>
                  <p className="text-revnu-gray">This helps us understand your workflow</p>
                </div>

                <div className="space-y-3">
                  {[
                    { value: "invoicing_software", label: "I send invoices through software", desc: "QuickBooks, FreshBooks, Wave, etc." },
                    { value: "manual_invoices", label: "I create invoices manually", desc: "Word, Excel, or paper invoices" },
                    { value: "cash_only", label: "I collect cash/check only", desc: "Payment on delivery" },
                    { value: "mixed", label: "Mixed methods", desc: "Combination of the above" },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setFormData({ ...formData, collectionMethod: option.value })}
                      className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                        formData.collectionMethod === option.value
                          ? "bg-revnu-green/20 border-revnu-green"
                          : "bg-revnu-dark border-revnu-green/20 hover:border-revnu-green/50"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 mt-0.5 flex items-center justify-center ${
                          formData.collectionMethod === option.value
                            ? "border-revnu-green bg-revnu-green"
                            : "border-revnu-gray"
                        }`}>
                          {formData.collectionMethod === option.value && (
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

                <div className="pt-4">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.hasExistingInvoices}
                      onChange={(e) => setFormData({ ...formData, hasExistingInvoices: e.target.checked })}
                      className="w-5 h-5 rounded border-2 border-revnu-green/40 bg-revnu-dark checked:bg-revnu-green focus:outline-none"
                    />
                    <span className="text-white font-bold">I have outstanding invoices right now</span>
                  </label>
                </div>

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
                      <option value={250}>$0 - $500</option>
                      <option value={1000}>$500 - $2,000</option>
                      <option value={5000}>$2,000 - $10,000</option>
                      <option value={15000}>$10,000+</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Communication Preferences */}
            {!generatingSequences && currentStep === 3 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-2xl font-black text-white mb-2">
                    How do you want to reach customers?
                  </h3>
                  <p className="text-revnu-gray">Select all channels you'd like to use</p>
                </div>

                <div className="space-y-3">
                  {[
                    { key: "sms", label: "Text/SMS", icon: "📱", desc: "Fast, high open rates" },
                    { key: "email", label: "Email", icon: "📧", desc: "Professional, detailed" },
                    { key: "phone", label: "Phone calls (manual)", icon: "☎️", desc: "You'll call yourself" },
                  ].map((channel) => (
                    <button
                      key={channel.key}
                      onClick={() => setFormData({
                        ...formData,
                        preferredChannels: {
                          ...formData.preferredChannels,
                          [channel.key]: !formData.preferredChannels[channel.key as keyof typeof formData.preferredChannels],
                        },
                      })}
                      className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                        formData.preferredChannels[channel.key as keyof typeof formData.preferredChannels]
                          ? "bg-revnu-green/20 border-revnu-green"
                          : "bg-revnu-dark border-revnu-green/20 hover:border-revnu-green/50"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-5 h-5 rounded border-2 flex-shrink-0 mt-0.5 flex items-center justify-center ${
                          formData.preferredChannels[channel.key as keyof typeof formData.preferredChannels]
                            ? "border-revnu-green bg-revnu-green"
                            : "border-revnu-gray"
                        }`}>
                          {formData.preferredChannels[channel.key as keyof typeof formData.preferredChannels] && (
                            <svg className="w-3 h-3 text-revnu-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{channel.icon}</span>
                            <span className="font-bold text-white">{channel.label}</span>
                          </div>
                          <div className="text-sm text-revnu-gray mt-1">{channel.desc}</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="pt-4">
                  <label className="block text-sm font-bold text-white mb-3">
                    How often should we follow up?
                  </label>
                  <div className="space-y-2">
                    {[
                      { value: "aggressive", label: "Aggressive", desc: "Every 3-5 days until paid" },
                      { value: "moderate", label: "Moderate", desc: "Weekly follow-ups" },
                      { value: "relaxed", label: "Relaxed", desc: "Every 2 weeks" },
                    ].map((freq) => (
                      <button
                        key={freq.value}
                        onClick={() => setFormData({ ...formData, followUpFrequency: freq.value })}
                        className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                          formData.followUpFrequency === freq.value
                            ? "bg-revnu-green/20 border-revnu-green"
                            : "bg-revnu-dark border-revnu-green/20 hover:border-revnu-green/50"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 mt-0.5 flex items-center justify-center ${
                            formData.followUpFrequency === freq.value
                              ? "border-revnu-green bg-revnu-green"
                              : "border-revnu-gray"
                          }`}>
                            {formData.followUpFrequency === freq.value && (
                              <div className="w-2 h-2 bg-revnu-dark rounded-full" />
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-white">{freq.label}</div>
                            <div className="text-sm text-revnu-gray">{freq.desc}</div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Brand Voice */}
            {!generatingSequences && currentStep === 4 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-2xl font-black text-white mb-2">
                    What's your communication style?
                  </h3>
                  <p className="text-revnu-gray">We'll match your brand voice in all messages</p>
                </div>

                <div className="space-y-3">
                  {[
                    {
                      value: "friendly",
                      label: "Friendly & Warm",
                      icon: "😊",
                      example: "Hey John! Just a friendly reminder about invoice #1234...",
                      desc: "Conversational, understanding, positive"
                    },
                    {
                      value: "professional",
                      label: "Professional & Polite",
                      icon: "👔",
                      example: "Dear Mr. Smith, This is a courtesy reminder regarding invoice #1234...",
                      desc: "Business-like, respectful, formal"
                    },
                    {
                      value: "firm",
                      label: "Direct & Firm",
                      icon: "📋",
                      example: "Invoice #1234 for $1,500 is now 15 days past due. Payment is required...",
                      desc: "No-nonsense, urgent, assertive"
                    },
                    {
                      value: "casual",
                      label: "Super Casual",
                      icon: "👋",
                      example: "Hey! Quick heads up about that invoice from last month...",
                      desc: "Relaxed, informal, like texting a friend"
                    },
                  ].map((tone) => (
                    <button
                      key={tone.value}
                      onClick={() => setFormData({ ...formData, communicationTone: tone.value })}
                      className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                        formData.communicationTone === tone.value
                          ? "bg-revnu-green/20 border-revnu-green"
                          : "bg-revnu-dark border-revnu-green/20 hover:border-revnu-green/50"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 mt-0.5 flex items-center justify-center ${
                          formData.communicationTone === tone.value
                            ? "border-revnu-green bg-revnu-green"
                            : "border-revnu-gray"
                        }`}>
                          {formData.communicationTone === tone.value && (
                            <div className="w-2 h-2 bg-revnu-dark rounded-full" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xl">{tone.icon}</span>
                            <span className="font-bold text-white">{tone.label}</span>
                          </div>
                          <div className="text-xs text-revnu-gray mb-2">{tone.desc}</div>
                          <div className="text-sm text-revnu-greenLight italic bg-revnu-dark/50 p-2 rounded">
                            "{tone.example}"
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 5: Review & Generate */}
            {!generatingSequences && currentStep === 5 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-2xl font-black text-white mb-2">
                    Ready to generate your sequences! 🎉
                  </h3>
                  <p className="text-revnu-gray">Review your selections below</p>
                </div>

                <div className="bg-revnu-dark rounded-lg p-6 space-y-4">
                  <div>
                    <div className="text-xs text-revnu-gray uppercase font-bold mb-1">Business</div>
                    <div className="text-white font-bold">{formData.businessName}</div>
                    <div className="text-sm text-revnu-gray">{formData.industry} • {formData.timezone.split("/")[1]}</div>
                  </div>

                  <div className="border-t border-revnu-green/10 pt-4">
                    <div className="text-xs text-revnu-gray uppercase font-bold mb-1">Collection Method</div>
                    <div className="text-white capitalize">{formData.collectionMethod.replace("_", " ")}</div>
                    <div className="text-sm text-revnu-gray">
                      Net {formData.typicalPaymentTerms} • Avg ${formData.averageInvoiceAmount.toLocaleString()}
                      {formData.hasExistingInvoices && " • Has outstanding invoices"}
                    </div>
                  </div>

                  <div className="border-t border-revnu-green/10 pt-4">
                    <div className="text-xs text-revnu-gray uppercase font-bold mb-1">Communication</div>
                    <div className="text-white capitalize">
                      {Object.entries(formData.preferredChannels)
                        .filter(([_, enabled]) => enabled)
                        .map(([channel, _]) => channel)
                        .join(", ") || "None selected"}
                    </div>
                    <div className="text-sm text-revnu-gray capitalize">{formData.followUpFrequency} follow-up frequency</div>
                  </div>

                  <div className="border-t border-revnu-green/10 pt-4">
                    <div className="text-xs text-revnu-gray uppercase font-bold mb-1">Voice & Tone</div>
                    <div className="text-white capitalize">{formData.communicationTone}</div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-500/20 to-purple-500/5 border-2 border-purple-500/30 rounded-lg p-6">
                  <div className="flex items-start gap-3">
                    <div className="text-3xl">🤖</div>
                    <div>
                      <div className="font-bold text-white mb-2">AI Will Generate:</div>
                      <ul className="space-y-1 text-sm text-revnu-gray">
                        <li className="flex items-center gap-2">
                          <span className="text-revnu-green">✓</span>
                          <span>{formData.followUpFrequency === "aggressive" ? "2 complete" : "1 complete"} collection sequence{formData.followUpFrequency === "aggressive" ? "s" : ""}</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="text-revnu-green">✓</span>
                          <span>3-5 customized message templates per sequence</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="text-revnu-green">✓</span>
                          <span>Messages tailored to {formData.industry} industry</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="text-revnu-green">✓</span>
                          <span>Your "{formData.communicationTone}" brand voice throughout</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            {!generatingSequences && (
              <div className="flex items-center justify-between pt-6 mt-6 border-t border-revnu-green/20">
                {currentStep > 1 ? (
                  <button
                    onClick={prevStep}
                    className="px-6 py-3 bg-revnu-slate/40 border border-revnu-green/20 text-white font-bold rounded-lg hover:border-revnu-green transition"
                  >
                    ← Back
                  </button>
                ) : (
                  <div />
                )}

                {currentStep < 5 ? (
                  <button
                    onClick={nextStep}
                    disabled={!isStepValid()}
                    className="px-6 py-3 bg-revnu-green text-revnu-dark font-bold rounded-lg hover:bg-revnu-greenLight transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Continue →
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={loading || !isStepValid()}
                    className="px-8 py-3 bg-gradient-to-r from-revnu-green to-revnu-greenDark text-revnu-dark font-black rounded-lg hover:from-revnu-greenLight hover:to-revnu-green transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-revnu-green/30"
                  >
                    {loading ? "Generating..." : "Generate My Sequences 🚀"}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
