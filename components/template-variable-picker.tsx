"use client";

import { useState } from "react";

export const TEMPLATE_VARIABLES = [
  { key: "{{businessName}}", label: "Your Business Name", example: "Smith Electrical" },
  { key: "{{customerFirstName}}", label: "Customer First Name", example: "John" },
  { key: "{{customerName}}", label: "Customer Full Name", example: "John Doe" },
  { key: "{{invoiceNumber}}", label: "Invoice Number", example: "INV-001" },
  { key: "{{amountDue}}", label: "Original Amount", example: "$500.00" },
  { key: "{{amountRemaining}}", label: "Current Balance", example: "$500.00" },
  { key: "{{dueDate}}", label: "Due Date", example: "Jan 15, 2026" },
  { key: "{{daysPastDue}}", label: "Days Past Due", example: "5" },
  { key: "{{paymentLink}}", label: "Payment Link", example: "https://pay.stripe.com/..." },
];

interface TemplateVariablePickerProps {
  onInsert: (variable: string) => void;
}

export default function TemplateVariablePicker({ onInsert }: TemplateVariablePickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
      >
        Insert Variable
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
            <div className="p-3 border-b border-gray-200">
              <h4 className="text-sm font-semibold">Template Variables</h4>
              <p className="text-xs text-gray-500 mt-1">
                Click to insert into your message
              </p>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {TEMPLATE_VARIABLES.map((variable) => (
                <button
                  key={variable.key}
                  type="button"
                  onClick={() => {
                    onInsert(variable.key);
                    setIsOpen(false);
                  }}
                  className="w-full px-3 py-2 text-left hover:bg-gray-50 border-b border-gray-100 last:border-0"
                >
                  <div className="text-sm font-medium text-gray-900">
                    {variable.key}
                  </div>
                  <div className="text-xs text-gray-600 mt-0.5">
                    {variable.label} • Example: {variable.example}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
