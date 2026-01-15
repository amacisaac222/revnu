'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight, Mail, MessageSquare, Copy, Edit, Check } from 'lucide-react';

interface SequenceStep {
  id: string;
  stepNumber: number;
  delayDays: number;
  channel: string;
  subject?: string | null;
  body: string;
  isActive: boolean;
}

interface Sequence {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  isDefault: boolean;
  triggerDaysPastDue: number;
  steps: SequenceStep[];
  _count?: {
    invoices: number;
  };
}

interface SequencePreviewCardProps {
  sequence: Sequence;
  organizationName: string;
  onDuplicate?: (sequenceId: string) => void;
  onEdit?: (sequenceId: string) => void;
  onAssign?: (sequenceId: string) => void;
}

export default function SequencePreviewCard({
  sequence,
  organizationName,
  onDuplicate,
  onEdit,
  onAssign,
}: SequencePreviewCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getChannelIcon = (channel: string) => {
    return channel === 'email' ? (
      <Mail className="w-4 h-4 text-blue-400" />
    ) : (
      <MessageSquare className="w-4 h-4 text-revnu-green" />
    );
  };

  const getDayLabel = (stepNumber: number, delayDays: number) => {
    if (stepNumber === 1) {
      return sequence.triggerDaysPastDue === 0
        ? 'On due date'
        : `Day ${sequence.triggerDaysPastDue} past due`;
    }
    const previousSteps = sequence.steps.filter(s => s.stepNumber < stepNumber);
    const totalDays = previousSteps.reduce((sum, s) => sum + s.delayDays, 0) + delayDays + sequence.triggerDaysPastDue;
    return `Day ${totalDays}`;
  };

  const fillVariables = (text: string) => {
    return text
      .replace(/\{\{customerName\}\}/g, 'John Smith')
      .replace(/\{\{customerFirstName\}\}/g, 'John')
      .replace(/\{\{businessName\}\}/g, organizationName)
      .replace(/\{\{invoiceNumber\}\}/g, '#INV-001')
      .replace(/\{\{invoiceAmount\}\}/g, '$750.00')
      .replace(/\{\{amountDue\}\}/g, '$750.00')
      .replace(/\{\{dueDate\}\}/g, new Date().toLocaleDateString())
      .replace(/\{\{paymentLink\}\}/g, 'pay.revnu.com/abc123')
      .replace(/\{\{businessPhone\}\}/g, '(555) 123-4567')
      .replace(/\{\{businessEmail\}\}/g, 'billing@company.com');
  };

  return (
    <div className="bg-revnu-slate/40 border-2 border-revnu-green/20 rounded-xl overflow-hidden hover:border-revnu-green/40 transition">
      {/* Header */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1 hover:bg-revnu-dark rounded transition"
              >
                {isExpanded ? (
                  <ChevronDown className="w-5 h-5 text-revnu-green" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-revnu-gray" />
                )}
              </button>
              <h3 className="text-xl font-bold text-white">{sequence.name}</h3>
              {sequence.isDefault && (
                <span className="px-2 py-1 bg-revnu-green/20 text-revnu-green text-xs font-bold rounded">
                  Default
                </span>
              )}
              {sequence.isActive ? (
                <span className="px-2 py-1 bg-revnu-green/20 text-revnu-green text-xs font-bold rounded">
                  Active
                </span>
              ) : (
                <span className="px-2 py-1 bg-revnu-slate text-revnu-gray text-xs font-bold rounded">
                  Inactive
                </span>
              )}
            </div>
            {sequence.description && (
              <p className="text-revnu-gray text-sm ml-9">{sequence.description}</p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 ml-4">
            {onDuplicate && (
              <button
                onClick={() => onDuplicate(sequence.id)}
                className="p-2 bg-revnu-dark border border-revnu-green/30 text-revnu-green rounded-lg hover:bg-revnu-dark/50 transition"
                title="Duplicate sequence"
              >
                <Copy className="w-4 h-4" />
              </button>
            )}
            {onEdit && (
              <button
                onClick={() => onEdit(sequence.id)}
                className="p-2 bg-revnu-dark border border-revnu-green/30 text-revnu-green rounded-lg hover:bg-revnu-dark/50 transition"
                title="Edit sequence"
              >
                <Edit className="w-4 h-4" />
              </button>
            )}
            {onAssign && (
              <button
                onClick={() => onAssign(sequence.id)}
                className="px-4 py-2 bg-revnu-green text-revnu-dark font-bold rounded-lg hover:bg-revnu-greenLight transition"
              >
                <Check className="w-4 h-4 inline mr-1" />
                Assign
              </button>
            )}
          </div>
        </div>

        {/* Stats Row */}
        <div className="flex items-center gap-6 text-sm text-revnu-gray ml-9">
          <div>
            <span className="font-bold text-white">{sequence.steps.length}</span> steps
          </div>
          {sequence._count && (
            <div>
              <span className="font-bold text-white">{sequence._count.invoices}</span> invoices assigned
            </div>
          )}
          <div>
            Triggers: <span className="font-bold text-white">
              {sequence.triggerDaysPastDue === 0 ? 'On due date' : `${sequence.triggerDaysPastDue} days past due`}
            </span>
          </div>
        </div>
      </div>

      {/* Expanded Step Details */}
      {isExpanded && (
        <div className="border-t border-revnu-green/10 bg-revnu-dark/30 p-6">
          <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-wide">Sequence Steps Preview</h4>
          <div className="space-y-4">
            {sequence.steps
              .sort((a, b) => a.stepNumber - b.stepNumber)
              .map((step, index) => (
                <div
                  key={step.id}
                  className="bg-revnu-dark border border-revnu-green/20 rounded-lg p-4"
                >
                  {/* Step Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {getChannelIcon(step.channel)}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white">Step {step.stepNumber}</span>
                          <span className="text-xs px-2 py-0.5 bg-revnu-green/10 text-revnu-green rounded font-bold">
                            {getDayLabel(step.stepNumber, step.delayDays)}
                          </span>
                          <span className="text-xs text-revnu-gray">
                            {step.channel === 'email' ? 'Email' : 'SMS'}
                          </span>
                        </div>
                        {index > 0 && (
                          <div className="text-xs text-revnu-gray mt-1">
                            +{step.delayDays} day{step.delayDays !== 1 ? 's' : ''} after previous step
                          </div>
                        )}
                      </div>
                    </div>
                    {!step.isActive && (
                      <span className="text-xs text-revnu-gray">Inactive</span>
                    )}
                  </div>

                  {/* Email Subject */}
                  {step.channel === 'email' && step.subject && (
                    <div className="mb-2">
                      <div className="text-xs font-bold text-revnu-gray uppercase mb-1">Subject:</div>
                      <div className="text-sm text-white font-semibold">{fillVariables(step.subject)}</div>
                    </div>
                  )}

                  {/* Message Body */}
                  <div>
                    <div className="text-xs font-bold text-revnu-gray uppercase mb-1">Message:</div>
                    <div className={`text-sm text-revnu-gray/90 whitespace-pre-wrap ${
                      step.channel === 'sms' ? 'font-mono' : ''
                    }`}>
                      {fillVariables(step.body)}
                    </div>
                  </div>

                  {/* Character Count for SMS */}
                  {step.channel === 'sms' && (
                    <div className="mt-2 text-xs text-revnu-gray">
                      {step.body.length} characters
                    </div>
                  )}
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
