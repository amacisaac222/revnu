'use client';

import { useState } from 'react';
import { ArrowLeft, Rocket, Loader2, User, Mail, MessageSquare } from 'lucide-react';

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
}

interface WizardStep4Props {
  selectedInvoices: Set<string>;
  allInvoices: Invoice[];
  sequence: SequenceTemplate;
  onLaunch: () => void;
  onBack: () => void;
  launching: boolean;
  campaignMode: 'invoice' | 'customer';
}

export default function WizardStep4ReviewLaunch({
  selectedInvoices,
  allInvoices,
  sequence,
  onLaunch,
  onBack,
  launching,
  campaignMode,
}: WizardStep4Props) {
  const invoicesToLaunch = allInvoices.filter((inv) => selectedInvoices.has(inv.id));
  const smsSteps = sequence.steps.filter((s) => s.channel === 'sms').length;
  const emailSteps = sequence.steps.filter((s) => s.channel === 'email').length;

  // Calculate delivery breakdown
  const canReceiveSMS = invoicesToLaunch.filter(
    (inv) => inv.customer.phone && inv.customer.smsConsentGiven
  ).length;
  const canReceiveEmail = invoicesToLaunch.filter(
    (inv) => inv.customer.email && inv.customer.emailConsentGiven
  ).length;
  const canReceiveBoth = invoicesToLaunch.filter(
    (inv) =>
      inv.customer.phone &&
      inv.customer.smsConsentGiven &&
      inv.customer.email &&
      inv.customer.emailConsentGiven
  ).length;
  const willBeSkipped = invoicesToLaunch.filter(
    (inv) =>
      (!inv.customer.phone || !inv.customer.smsConsentGiven) &&
      (!inv.customer.email || !inv.customer.emailConsentGiven)
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-revnu-slate/40 border-2 border-revnu-green/30 rounded-xl p-6">
        <h2 className="text-2xl font-bold text-white mb-2">Review & Launch Campaign</h2>
        <p className="text-revnu-gray">Double-check everything before launching your campaign</p>
      </div>

      {/* Summary Card */}
      <div className="bg-gradient-to-br from-revnu-green/20 to-revnu-slate/40 border-2 border-revnu-green rounded-xl p-8">
        <div className="text-center mb-6">
          <Rocket className="w-16 h-16 mx-auto mb-4 text-revnu-green" />
          <h3 className="text-3xl font-bold text-white mb-2">Ready to Launch</h3>
          <p className="text-xl text-revnu-gray">
            <span className="text-revnu-green font-bold">{invoicesToLaunch.length} customers</span> will be enrolled in
          </p>
          <p className="text-2xl font-bold text-white mt-2">"{sequence.name}"</p>
        </div>

        {/* Sequence Details */}
        <div className="grid md:grid-cols-3 gap-4 mt-6">
          <div className="bg-revnu-dark/50 border border-revnu-green/20 rounded-lg p-4 text-center">
            <p className="text-revnu-gray text-sm mb-1">Total Steps</p>
            <p className="text-3xl font-bold text-white">{sequence.steps.length}</p>
          </div>
          <div className="bg-revnu-dark/50 border border-revnu-green/20 rounded-lg p-4 text-center">
            <div className="flex items-center justify-center gap-2 text-revnu-gray text-sm mb-1">
              <MessageSquare className="w-4 h-4" />
              <span>SMS Messages</span>
            </div>
            <p className="text-3xl font-bold text-revnu-green">{smsSteps}</p>
          </div>
          <div className="bg-revnu-dark/50 border border-revnu-green/20 rounded-lg p-4 text-center">
            <div className="flex items-center justify-center gap-2 text-revnu-gray text-sm mb-1">
              <Mail className="w-4 h-4" />
              <span>Emails</span>
            </div>
            <p className="text-3xl font-bold text-blue-400">{emailSteps}</p>
          </div>
        </div>

        {/* Start Trigger */}
        <div className="mt-6 p-4 bg-revnu-dark/50 border border-revnu-green/20 rounded-lg text-center">
          <p className="text-revnu-gray text-sm">
            {campaignMode === 'invoice'
              ? 'Messages will start sending when invoice is'
              : 'Messages will start sending'}
          </p>
          <p className="text-xl font-bold text-white mt-1">
            {campaignMode === 'invoice'
              ? sequence.triggerDaysPastDue === 0
                ? 'On due date'
                : `${sequence.triggerDaysPastDue} days past due`
              : 'Immediately upon enrollment'}
          </p>
        </div>

        {/* Delivery Breakdown */}
        <div className="mt-6 p-6 bg-revnu-dark/50 border border-revnu-green/20 rounded-lg">
          <h4 className="text-lg font-bold text-white mb-4 text-center">Delivery Breakdown</h4>
          <div className="grid grid-cols-4 gap-3">
            <div className="text-center">
              <div className="text-2xl font-bold text-revnu-green">{canReceiveSMS}</div>
              <div className="text-sm text-revnu-gray mt-1">Can receive SMS</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">{canReceiveEmail}</div>
              <div className="text-sm text-revnu-gray mt-1">Can receive Email</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-cyan-400">{canReceiveBoth}</div>
              <div className="text-sm text-revnu-gray mt-1">Can receive Both</div>
            </div>
            {willBeSkipped > 0 && (
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400">{willBeSkipped}</div>
                <div className="text-sm text-revnu-gray mt-1">Will be skipped</div>
              </div>
            )}
          </div>
          {willBeSkipped > 0 && (
            <p className="text-sm text-yellow-400 mt-4 text-center">
              ⚠️ {willBeSkipped} customer{willBeSkipped > 1 ? 's' : ''} will be skipped due to missing contact info
            </p>
          )}
        </div>
      </div>

      {/* Customer List */}
      <div className="bg-revnu-slate/40 border border-revnu-green/20 rounded-xl p-6">
        <h3 className="text-lg font-bold text-white mb-4">Customers to Enroll ({invoicesToLaunch.length})</h3>
        <div className="max-h-64 overflow-y-auto space-y-2 pr-2">
          {invoicesToLaunch.map((invoice) => (
            <div
              key={invoice.id}
              className="flex items-center gap-4 p-3 bg-revnu-dark/50 border border-revnu-green/10 rounded-lg"
            >
              <div className="w-10 h-10 bg-revnu-green/20 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 text-revnu-green" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-white">
                  {invoice.customer.firstName} {invoice.customer.lastName}
                </p>
                <p className="text-sm text-revnu-gray">
                  {invoice.invoiceNumber} • ${(invoice.amountRemaining / 100).toFixed(2)}
                  {invoice.daysPastDue > 0 && <span className="text-red-400"> • {invoice.daysPastDue}d overdue</span>}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Important Notice */}
      <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-6">
        <h4 className="font-bold text-yellow-400 mb-2 flex items-center gap-2">
          <span className="text-xl">⚠️</span> Important
        </h4>
        <ul className="space-y-2 text-sm text-yellow-200">
          <li>• Customers will automatically receive messages according to the sequence schedule</li>
          <li>• Messages will only be sent to customers with proper consent (SMS/Email)</li>
          <li>• You can view campaign progress in the Communications tab</li>
          <li>• Customers can opt-out at any time by replying STOP</li>
        </ul>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          disabled={launching}
          className="px-6 py-3 bg-revnu-dark border border-revnu-green/30 text-white font-bold rounded-lg hover:bg-revnu-dark/50 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Preview
        </button>
        <button
          onClick={onLaunch}
          disabled={launching}
          className="px-12 py-5 bg-revnu-green text-revnu-dark font-bold rounded-lg text-xl hover:bg-revnu-green/90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 shadow-lg shadow-revnu-green/30"
        >
          {launching ? (
            <>
              <Loader2 className="w-6 h-6 animate-spin" />
              Launching Campaign...
            </>
          ) : (
            <>
              <Rocket className="w-6 h-6" />
              Launch Campaign
            </>
          )}
        </button>
      </div>
    </div>
  );
}
