"use client";

import { useState } from "react";
import Link from "next/link";

interface ChecklistItem {
  id: string;
  label: string;
  completed: boolean;
  href: string;
  description: string;
}

interface ProgressChecklistProps {
  onboardingProgress: {
    addedCustomer?: boolean;
    createdInvoice?: boolean;
    createdSequence?: boolean;
    sentMessage?: boolean;
    setupPayment?: boolean;
  };
  usedDemoData: boolean;
}

export default function ProgressChecklist({
  onboardingProgress,
  usedDemoData,
}: ProgressChecklistProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);

  const checklistItems: ChecklistItem[] = [
    {
      id: "addedCustomer",
      label: "Add first customer",
      completed: onboardingProgress.addedCustomer || false,
      href: "/dashboard/customers/new",
      description: "Create your first customer profile",
    },
    {
      id: "createdInvoice",
      label: "Create an invoice",
      completed: onboardingProgress.createdInvoice || false,
      href: "/dashboard/invoices/new",
      description: "Track an outstanding payment",
    },
    {
      id: "createdSequence",
      label: "Set up a reminder sequence",
      completed: onboardingProgress.createdSequence || false,
      href: "/dashboard/sequences/new",
      description: "Automate payment reminders",
    },
    {
      id: "sentMessage",
      label: "Send your first reminder",
      completed: onboardingProgress.sentMessage || false,
      href: "/dashboard/invoices",
      description: "Contact a customer about payment",
    },
    {
      id: "setupPayment",
      label: "Configure payment methods",
      completed: onboardingProgress.setupPayment || false,
      href: "/dashboard/settings",
      description: "Connect Stripe or set payment links",
    },
  ];

  const completedCount = checklistItems.filter((item) => item.completed).length;
  const totalCount = checklistItems.length;
  const progressPercent = (completedCount / totalCount) * 100;
  const isComplete = completedCount === totalCount;

  if (isComplete && isMinimized) {
    return null; // Hide completely when done and user minimized it
  }

  if (isMinimized) {
    return (
      <button
        onClick={() => setIsMinimized(false)}
        className="fixed bottom-6 right-6 z-40 bg-revnu-green hover:bg-revnu-greenLight text-revnu-dark font-black px-4 py-3 rounded-full shadow-lg shadow-revnu-green/30 transition-all active:scale-95 flex items-center gap-2"
      >
        <span>
          {completedCount}/{totalCount}
        </span>
        <span className="text-xs">Setup</span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-40 w-80 bg-revnu-dark border-2 border-revnu-green/30 rounded-xl shadow-2xl shadow-revnu-green/20">
      {/* Header */}
      <div className="p-4 border-b border-revnu-green/20 flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">🎯</span>
            <h3 className="font-black text-white">Getting Started</h3>
          </div>
          {isComplete ? (
            <p className="text-xs text-revnu-green font-bold">
              🎉 All done! You're ready to go!
            </p>
          ) : (
            <p className="text-xs text-revnu-gray">
              {completedCount} of {totalCount} completed
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-revnu-gray hover:text-white transition p-1"
          >
            {isExpanded ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            )}
          </button>
          <button
            onClick={() => setIsMinimized(true)}
            className="text-revnu-gray hover:text-white transition p-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="px-4 pt-3">
        <div className="h-2 bg-revnu-slate/40 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-revnu-green to-revnu-greenDark transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Checklist */}
      {isExpanded && (
        <div className="p-4 space-y-2 max-h-80 overflow-y-auto">
          {usedDemoData && (
            <div className="bg-revnu-green/10 border border-revnu-green/20 rounded-lg p-3 mb-3">
              <div className="flex items-start gap-2">
                <span className="text-sm">💡</span>
                <div>
                  <p className="text-xs text-revnu-gray">
                    You're using demo data. Try each feature, then{" "}
                    <Link href="/dashboard/settings" className="text-revnu-green hover:underline">
                      clear it
                    </Link>{" "}
                    to add real data.
                  </p>
                </div>
              </div>
            </div>
          )}

          {checklistItems.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className={`block p-3 rounded-lg border transition-all ${
                item.completed
                  ? "bg-revnu-green/10 border-revnu-green/30"
                  : "bg-revnu-slate/40 border-revnu-green/20 hover:border-revnu-green hover:bg-revnu-slate/60"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  {item.completed ? (
                    <div className="w-5 h-5 rounded-full bg-revnu-green flex items-center justify-center">
                      <svg className="w-3 h-3 text-revnu-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-revnu-gray" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className={`text-sm font-bold ${item.completed ? "text-revnu-green" : "text-white"}`}>
                    {item.label}
                  </div>
                  {!item.completed && (
                    <div className="text-xs text-revnu-gray mt-0.5">{item.description}</div>
                  )}
                </div>
              </div>
            </Link>
          ))}

          {isComplete && (
            <div className="mt-4 p-4 bg-gradient-to-br from-revnu-green/20 to-revnu-green/5 border-2 border-revnu-green/30 rounded-lg text-center">
              <div className="text-2xl mb-2">🎉</div>
              <p className="text-sm font-bold text-white mb-1">You're all set!</p>
              <p className="text-xs text-revnu-gray">
                You've completed the basics. Keep exploring to master REVNU!
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
