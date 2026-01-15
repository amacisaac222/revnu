'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import WizardProgressBar from './wizard-progress-bar';
import WizardStep1SelectRecipients from './wizard-step-1-select-recipients';
import WizardStep2ChooseSequence from './wizard-step-2-choose-sequence';
import WizardStep3PreviewMessages from './wizard-step-3-preview-messages';
import WizardStep4ReviewLaunch from './wizard-step-4-review-launch';
import WizardStep5Success from './wizard-step-5-success';

interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  smsConsentGiven: boolean;
  emailConsentGiven: boolean;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  amountRemaining: number;
  amountDue: number;
  daysPastDue: number;
  dueDate: string;
  status: string;
  customer: Customer;
}

interface SequenceTemplate {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  isDefault: boolean;
  triggerDaysPastDue: number;
  steps: any[];
  _count?: {
    invoices: number;
  };
}

interface Organization {
  id: string;
  businessName: string;
}

interface CampaignWizardProps {
  invoices: Invoice[];
  sequences: SequenceTemplate[];
  organization: Organization;
  onRefresh: () => void;
}

const WIZARD_STEPS = [
  { number: 1, label: 'Select' },
  { number: 2, label: 'Sequence' },
  { number: 3, label: 'Preview' },
  { number: 4, label: 'Launch' },
  { number: 5, label: 'Success' },
];

export default function CampaignWizard({ invoices, sequences, organization, onRefresh }: CampaignWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedInvoices, setSelectedInvoices] = useState<Set<string>>(new Set());
  const [selectedSequence, setSelectedSequence] = useState<SequenceTemplate | null>(null);
  const [launching, setLaunching] = useState(false);
  const [enrolledCount, setEnrolledCount] = useState(0);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [campaignMode, setCampaignMode] = useState<'invoice' | 'customer'>('invoice');

  const handleStep1Continue = () => {
    if (selectedInvoices.size > 0) {
      setCurrentStep(2);
    }
  };

  const handleStep2Continue = () => {
    if (selectedSequence) {
      setCurrentStep(3);
    }
  };

  const handleStep3Continue = () => {
    setCurrentStep(4);
  };

  const handleLaunch = async () => {
    if (!selectedSequence) return;

    setLaunching(true);
    try {
      let successCount = 0;
      for (const invoiceId of Array.from(selectedInvoices)) {
        const response = await fetch(`/api/invoices/${invoiceId}/assign-sequence`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sequenceId: selectedSequence.id }),
        });
        if (response.ok) successCount++;
      }

      setEnrolledCount(successCount);
      onRefresh();
      setCurrentStep(5);
    } catch (error) {
      alert('Failed to launch campaign. Please try again.');
    } finally {
      setLaunching(false);
    }
  };

  const handleStartNew = () => {
    setCurrentStep(1);
    setSelectedInvoices(new Set());
    setSelectedSequence(null);
    setEnrolledCount(0);
  };

  const handleCancel = () => {
    if (currentStep === 1 || currentStep === 5) {
      handleStartNew();
    } else {
      setShowCancelConfirm(true);
    }
  };

  const confirmCancel = () => {
    setShowCancelConfirm(false);
    handleStartNew();
  };

  return (
    <div className="relative">
      {/* Cancel Button */}
      {currentStep < 5 && (
        <div className="flex justify-end mb-4">
          <button
            onClick={handleCancel}
            className="px-4 py-2 text-revnu-gray hover:text-white transition flex items-center gap-2 text-sm"
          >
            <X className="w-4 h-4" />
            Cancel
          </button>
        </div>
      )}

      {/* Progress Bar */}
      <WizardProgressBar currentStep={currentStep} steps={WIZARD_STEPS} />

      {/* Step Content */}
      {currentStep === 1 && (
        <WizardStep1SelectRecipients
          invoices={invoices}
          selectedInvoices={selectedInvoices}
          onSelectionChange={setSelectedInvoices}
          onContinue={handleStep1Continue}
          campaignMode={campaignMode}
          onCampaignModeChange={setCampaignMode}
        />
      )}

      {currentStep === 2 && (
        <WizardStep2ChooseSequence
          sequences={sequences}
          organizationName={organization.businessName}
          organizationId={organization.id}
          selectedSequence={selectedSequence}
          onSequenceSelect={setSelectedSequence}
          onContinue={handleStep2Continue}
          onBack={() => setCurrentStep(1)}
          onRefresh={onRefresh}
        />
      )}

      {currentStep === 3 && selectedSequence && (
        <WizardStep3PreviewMessages
          selectedInvoices={selectedInvoices}
          allInvoices={invoices}
          sequence={selectedSequence}
          organizationName={organization.businessName}
          onContinue={handleStep3Continue}
          onBack={() => setCurrentStep(2)}
        />
      )}

      {currentStep === 4 && selectedSequence && (
        <WizardStep4ReviewLaunch
          selectedInvoices={selectedInvoices}
          allInvoices={invoices}
          sequence={selectedSequence}
          onLaunch={handleLaunch}
          onBack={() => setCurrentStep(3)}
          launching={launching}
        />
      )}

      {currentStep === 5 && selectedSequence && (
        <WizardStep5Success
          enrolledCount={enrolledCount}
          sequence={selectedSequence}
          onStartNew={handleStartNew}
        />
      )}

      {/* Cancel Confirmation Modal */}
      {showCancelConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="bg-revnu-dark border-2 border-revnu-green/30 rounded-xl p-8 max-w-md w-full">
            <h3 className="text-2xl font-bold text-white mb-4">Cancel Campaign?</h3>
            <p className="text-revnu-gray mb-6">
              Are you sure you want to cancel? All progress will be lost and you'll need to start over.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelConfirm(false)}
                className="flex-1 px-4 py-3 bg-revnu-dark border border-revnu-green/30 text-white font-bold rounded-lg hover:bg-revnu-dark/50 transition"
              >
                Continue Campaign
              </button>
              <button
                onClick={confirmCancel}
                className="flex-1 px-4 py-3 bg-red-500/20 border border-red-500/30 text-red-400 font-bold rounded-lg hover:bg-red-500/30 transition"
              >
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
