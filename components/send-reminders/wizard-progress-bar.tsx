'use client';

import { Check } from 'lucide-react';

interface Step {
  number: number;
  label: string;
}

interface WizardProgressBarProps {
  currentStep: number;
  steps: Step[];
}

export default function WizardProgressBar({ currentStep, steps }: WizardProgressBarProps) {
  return (
    <div className="bg-revnu-slate/40 border border-revnu-green/20 rounded-xl p-6 mb-6">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = currentStep > step.number;
          const isActive = currentStep === step.number;
          const isLast = index === steps.length - 1;

          return (
            <div key={step.number} className="flex items-center flex-1">
              {/* Step Circle */}
              <div className="flex flex-col items-center">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center font-bold transition-all ${
                    isCompleted
                      ? 'bg-revnu-green text-revnu-dark'
                      : isActive
                      ? 'bg-revnu-green text-revnu-dark shadow-lg shadow-revnu-green/30'
                      : 'bg-revnu-dark border-2 border-revnu-gray/30 text-revnu-gray'
                  }`}
                >
                  {isCompleted ? <Check className="w-6 h-6" /> : step.number}
                </div>
                <span
                  className={`mt-2 text-sm font-bold ${
                    isActive ? 'text-revnu-green' : isCompleted ? 'text-white' : 'text-revnu-gray'
                  }`}
                >
                  {step.label}
                </span>
              </div>

              {/* Connector Line */}
              {!isLast && (
                <div className="flex-1 h-1 mx-4">
                  <div
                    className={`h-full rounded transition-all ${
                      isCompleted ? 'bg-revnu-green' : 'bg-revnu-gray/20'
                    }`}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
