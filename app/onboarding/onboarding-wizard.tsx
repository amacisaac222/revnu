"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Step1BusinessBasics from "@/components/onboarding/step1-business-basics";
import Step2BusinessVolume from "@/components/onboarding/step2-business-volume";
import Step5PaymentContact from "@/components/onboarding/step5-payment-contact";

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
    primaryState: "", // NEW: State for lien laws

    // Step 2: Business Volume Metrics (UPDATED)
    invoicesPerYear: 0, // NEW: Volume metric
    latePaymentsPerMonth: 0, // NEW: Delinquency metric
    timeSpentChasing: 0, // NEW: Hours per week
    hasExistingInvoices: false,
    typicalPaymentTerms: 30,
    averageInvoiceAmount: 1000, // in dollars, will convert to cents

    // Step 3: Communication Preferences
    preferredChannels: {
      sms: false,
      email: false,
      phone: false,
    },

    // Step 4: Brand Voice
    communicationTone: "",

    // Step 5: Payment & Contact Info (NEW)
    businessEmail: userEmail, // Pre-filled from Clerk
    paymentInstructions: "", // Custom payment text
    paymentLink: "", // Optional payment URL
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

      // Step 2: Generate sequences (AI or fallback defaults)
      const sequencesResponse = await fetch("/api/onboarding/generate-sequences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organizationId: orgData.organization.id,
          businessName: formData.businessName,
          industry: formData.industry,
          primaryState: formData.primaryState,
          invoicesPerYear: formData.invoicesPerYear,
          latePaymentsPerMonth: formData.latePaymentsPerMonth,
          timeSpentChasing: formData.timeSpentChasing,
          hasExistingInvoices: formData.hasExistingInvoices,
          preferredChannels: formData.preferredChannels,
          communicationTone: formData.communicationTone,
          averageInvoiceAmount: formData.averageInvoiceAmount * 100,
          typicalPaymentTerms: formData.typicalPaymentTerms,
          businessEmail: formData.businessEmail,
          contactPhone: formData.phone,
          paymentInstructions: formData.paymentInstructions,
          paymentLink: formData.paymentLink,
        }),
      });

      if (!sequencesResponse.ok) {
        throw new Error("Failed to generate sequences");
      }

      const sequencesData = await sequencesResponse.json();

      // Show notification if default templates were used
      if (sequencesData.source === "default") {
        console.log("ℹ️ Using default sequence templates (AI generation unavailable)");
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
        return formData.businessName.trim().length > 0 && formData.primaryState !== "";
      case 2:
        return formData.invoicesPerYear > 0 && formData.latePaymentsPerMonth >= 0 && formData.timeSpentChasing >= 0;
      case 3:
        return (
          formData.preferredChannels.sms ||
          formData.preferredChannels.email ||
          formData.preferredChannels.phone
        );
      case 4:
        return formData.communicationTone !== "";
      case 5:
        return true; // Review step
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
              <Step1BusinessBasics
                formData={formData}
                setFormData={setFormData}
              />
            )}

            {/* Step 2: Business Volume */}
            {!generatingSequences && currentStep === 2 && (
              <Step2BusinessVolume
                formData={formData}
                setFormData={setFormData}
              />
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

            {/* Step 5: Payment & Contact */}
            {!generatingSequences && currentStep === 5 && (
              <Step5PaymentContact
                formData={formData}
                setFormData={setFormData}
              />
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
