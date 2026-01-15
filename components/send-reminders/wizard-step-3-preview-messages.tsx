'use client';

import { useState } from 'react';
import { ArrowRight, ArrowLeft, ChevronLeft, ChevronRight, Mail, MessageSquare, User } from 'lucide-react';

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

interface SequenceStep {
  id?: string;
  stepNumber: number;
  delayDays: number;
  channel: string;
  subject?: string | null;
  body: string;
  isActive: boolean;
}

interface SequenceTemplate {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  isDefault: boolean;
  triggerDaysPastDue: number;
  steps: SequenceStep[];
}

interface WizardStep3Props {
  selectedInvoices: Set<string>;
  allInvoices: Invoice[];
  sequence: SequenceTemplate;
  organizationName: string;
  onContinue: () => void;
  onBack: () => void;
}

export default function WizardStep3PreviewMessages({
  selectedInvoices,
  allInvoices,
  sequence,
  organizationName,
  onContinue,
  onBack,
}: WizardStep3Props) {
  const invoicesToPreview = allInvoices.filter((inv) => selectedInvoices.has(inv.id));
  const [currentInvoiceIndex, setCurrentInvoiceIndex] = useState(0);
  const currentInvoice = invoicesToPreview[currentInvoiceIndex];

  const fillVariables = (text: string, invoice: Invoice) => {
    if (!invoice) return text;
    return text
      .replace(/\{\{customerName\}\}/g, `${invoice.customer.firstName} ${invoice.customer.lastName}`)
      .replace(/\{\{customerFirstName\}\}/g, invoice.customer.firstName)
      .replace(/\{\{businessName\}\}/g, organizationName)
      .replace(/\{\{invoiceNumber\}\}/g, invoice.invoiceNumber)
      .replace(/\{\{invoiceAmount\}\}/g, `$${(invoice.amountRemaining / 100).toFixed(2)}`)
      .replace(/\{\{amountDue\}\}/g, `$${(invoice.amountDue / 100).toFixed(2)}`)
      .replace(/\{\{dueDate\}\}/g, new Date(invoice.dueDate).toLocaleDateString())
      .replace(/\{\{paymentLink\}\}/g, `https://pay.revnu.com/${invoice.id}`)
      .replace(/\{\{businessPhone\}\}/g, '(555) 123-4567')
      .replace(/\{\{businessEmail\}\}/g, 'billing@company.com');
  };

  const getDayLabel = (stepNumber: number, delayDays: number) => {
    if (stepNumber === 1) {
      return sequence.triggerDaysPastDue === 0
        ? 'Immediately (on due date)'
        : `Day ${sequence.triggerDaysPastDue} past due`;
    }
    const previousSteps = sequence.steps.filter((s) => s.stepNumber < stepNumber);
    const totalDays =
      previousSteps.reduce((sum, s) => sum + s.delayDays, 0) + delayDays + sequence.triggerDaysPastDue;
    return `Day ${totalDays} past due`;
  };

  const nextCustomer = () => {
    if (currentInvoiceIndex < invoicesToPreview.length - 1) {
      setCurrentInvoiceIndex(currentInvoiceIndex + 1);
    }
  };

  const prevCustomer = () => {
    if (currentInvoiceIndex > 0) {
      setCurrentInvoiceIndex(currentInvoiceIndex - 1);
    }
  };

  if (!currentInvoice) {
    return <div>No invoices selected</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-revnu-slate/40 border-2 border-revnu-green/30 rounded-xl p-6">
        <h2 className="text-2xl font-bold text-white mb-2">Preview Personalized Messages</h2>
        <p className="text-revnu-gray">
          See exactly what each customer will receive. Click through to preview different customers.
        </p>
      </div>

      {/* Customer Selector */}
      <div className="bg-revnu-slate/40 border border-revnu-green/20 rounded-xl p-6">
        <div className="flex items-center justify-between">
          <button
            onClick={prevCustomer}
            disabled={currentInvoiceIndex === 0}
            className="p-2 rounded-lg bg-revnu-dark border border-revnu-green/30 hover:border-revnu-green/60 transition disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-6 h-6 text-revnu-green" />
          </button>

          <div className="flex-1 mx-6 text-center">
            <div className="flex items-center justify-center gap-3 mb-2">
              <div className="w-12 h-12 bg-revnu-green/20 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-revnu-green" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">
                  {currentInvoice.customer.firstName} {currentInvoice.customer.lastName}
                </h3>
                <p className="text-sm text-revnu-gray">
                  Invoice {currentInvoice.invoiceNumber} • ${(currentInvoice.amountRemaining / 100).toFixed(2)}
                </p>
              </div>
            </div>
            <p className="text-sm text-revnu-gray">
              Customer {currentInvoiceIndex + 1} of {invoicesToPreview.length}
            </p>
          </div>

          <button
            onClick={nextCustomer}
            disabled={currentInvoiceIndex === invoicesToPreview.length - 1}
            className="p-2 rounded-lg bg-revnu-dark border border-revnu-green/30 hover:border-revnu-green/60 transition disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-6 h-6 text-revnu-green" />
          </button>
        </div>
      </div>

      {/* Sequence Preview */}
      <div className="bg-revnu-slate/40 border border-revnu-green/20 rounded-xl p-6">
        <h3 className="text-lg font-bold text-white mb-4">
          Message Timeline for {currentInvoice.customer.firstName}
        </h3>

        <div className="space-y-6">
          {sequence.steps
            .sort((a, b) => a.stepNumber - b.stepNumber)
            .map((step, index) => {
              const dayLabel = getDayLabel(step.stepNumber, step.delayDays);
              const isEmail = step.channel === 'email';

              return (
                <div key={step.id || index} className="relative">
                  {/* Timeline Connector */}
                  {index < sequence.steps.length - 1 && (
                    <div className="absolute left-6 top-16 w-0.5 h-full bg-revnu-green/30" />
                  )}

                  <div className="flex gap-4">
                    {/* Step Number Circle */}
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-full bg-revnu-green flex items-center justify-center font-bold text-revnu-dark relative z-10">
                        {step.stepNumber}
                      </div>
                    </div>

                    {/* Message Card */}
                    <div className="flex-1 bg-revnu-dark/50 border border-revnu-green/20 rounded-xl p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          {isEmail ? (
                            <Mail className="w-5 h-5 text-blue-400" />
                          ) : (
                            <MessageSquare className="w-5 h-5 text-revnu-green" />
                          )}
                          <div>
                            <p className="font-bold text-white">
                              {isEmail ? 'Email' : 'SMS'} - {dayLabel}
                            </p>
                            <p className="text-xs text-revnu-gray">
                              {step.delayDays > 0 && step.stepNumber > 1 && `${step.delayDays} days after previous step`}
                            </p>
                          </div>
                        </div>
                      </div>

                      {isEmail && step.subject && (
                        <div className="mb-3">
                          <p className="text-xs text-revnu-gray mb-1">Subject:</p>
                          <p className="font-bold text-white">{fillVariables(step.subject, currentInvoice)}</p>
                        </div>
                      )}

                      <div>
                        <p className="text-xs text-revnu-gray mb-2">Message:</p>
                        {isEmail ? (
                          <div className="bg-white text-gray-900 rounded-lg p-4 border border-gray-200">
                            <div className="whitespace-pre-wrap text-sm">
                              {fillVariables(step.body, currentInvoice)}
                            </div>
                          </div>
                        ) : (
                          <div className="bg-revnu-green/10 border border-revnu-green/30 rounded-2xl p-4 max-w-sm">
                            <p className="text-white text-sm whitespace-pre-wrap">
                              {fillVariables(step.body, currentInvoice)}
                            </p>
                          </div>
                        )}
                      </div>

                      {!step.isActive && (
                        <div className="mt-3">
                          <span className="text-xs px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded">Inactive</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="px-6 py-3 bg-revnu-dark border border-revnu-green/30 text-white font-bold rounded-lg hover:bg-revnu-dark/50 transition flex items-center gap-2"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>
        <button
          onClick={onContinue}
          className="px-8 py-4 bg-revnu-green text-revnu-dark font-bold rounded-lg text-lg hover:bg-revnu-green/90 transition flex items-center gap-3"
        >
          Continue to Review
          <ArrowRight className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}
