"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
}

interface Sequence {
  id: string;
  name: string;
  isDefault: boolean;
}

interface InvoiceFormProps {
  organizationId: string;
  customers: Customer[];
  sequences: Sequence[];
}

export default function InvoiceForm({ organizationId, customers, sequences }: InvoiceFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const defaultSequence = sequences.find((s) => s.isDefault);

  const [formData, setFormData] = useState({
    customerId: "",
    invoiceNumber: "",
    invoiceDate: new Date().toISOString().split("T")[0],
    dueDate: "",
    description: "",
    amount: "",
    sequenceId: defaultSequence?.id || "",
    startReminders: !!defaultSequence,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Convert amount to cents
      const amountInCents = Math.round(parseFloat(formData.amount) * 100);

      const response = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          organizationId,
          amountDue: amountInCents,
          amountRemaining: amountInCents,
          collectionSequenceId: formData.startReminders ? formData.sequenceId : null,
          inCollection: formData.startReminders,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create invoice");
      }

      router.push("/dashboard/invoices");
      router.refresh();
    } catch (error) {
      console.error("Error creating invoice:", error);
      alert("Failed to create invoice. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {customers.length === 0 ? (
        <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-md">
          <h3 className="text-sm font-medium text-yellow-800 mb-2">
            No customers available
          </h3>
          <p className="text-sm text-yellow-700 mb-4">
            You need to add at least one customer before creating an invoice.
          </p>
          <Link
            href="/dashboard/customers/new"
            className="inline-block px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 text-sm"
          >
            Add Customer
          </Link>
        </div>
      ) : (
        <>
          {/* Customer Selection */}
          <div>
            <label htmlFor="customerId" className="block text-sm font-medium text-gray-700 mb-2">
              Customer *
            </label>
            <select
              id="customerId"
              required
              value={formData.customerId}
              onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
            >
              <option value="">Select a customer...</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.firstName} {customer.lastName}
                  {customer.email && ` (${customer.email})`}
                </option>
              ))}
            </select>
          </div>

          {/* Invoice Details */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="invoiceNumber" className="block text-sm font-medium text-gray-700 mb-2">
                Invoice Number *
              </label>
              <input
                type="text"
                id="invoiceNumber"
                required
                value={formData.invoiceNumber}
                onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="INV-001"
              />
            </div>
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
                Amount *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-gray-500">$</span>
                <input
                  type="number"
                  id="amount"
                  required
                  min="0"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="invoiceDate" className="block text-sm font-medium text-gray-700 mb-2">
                Invoice Date *
              </label>
              <input
                type="date"
                id="invoiceDate"
                required
                value={formData.invoiceDate}
                onChange={(e) => setFormData({ ...formData, invoiceDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
            <div>
              <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-2">
                Due Date *
              </label>
              <input
                type="date"
                id="dueDate"
                required
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              id="description"
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="Services provided, work completed, etc."
            />
          </div>

          {/* Automated Reminders */}
          <div className="border-t pt-6">
            <h3 className="text-sm font-semibold mb-4">Automated Payment Reminders</h3>

            <div className="space-y-4">
              <div className="flex items-start">
                <input
                  type="checkbox"
                  id="startReminders"
                  checked={formData.startReminders}
                  onChange={(e) =>
                    setFormData({ ...formData, startReminders: e.target.checked })
                  }
                  className="mt-1 h-4 w-4 rounded border-gray-300"
                />
                <label htmlFor="startReminders" className="ml-3 text-sm">
                  <span className="font-medium">Start automated reminders</span>
                  <p className="text-gray-600 mt-1">
                    Send payment reminder messages from your business automatically
                  </p>
                </label>
              </div>

              {formData.startReminders && (
                <div>
                  <label htmlFor="sequenceId" className="block text-sm font-medium text-gray-700 mb-2">
                    Reminder Sequence *
                  </label>
                  {sequences.length === 0 ? (
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                      <p className="text-sm text-yellow-800">
                        No active sequences found.{" "}
                        <Link
                          href="/dashboard/sequences/new"
                          className="underline font-medium"
                        >
                          Create one first
                        </Link>
                      </p>
                    </div>
                  ) : (
                    <select
                      id="sequenceId"
                      required={formData.startReminders}
                      value={formData.sequenceId}
                      onChange={(e) =>
                        setFormData({ ...formData, sequenceId: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                    >
                      <option value="">Select a sequence...</option>
                      {sequences.map((sequence) => (
                        <option key={sequence.id} value={sequence.id}>
                          {sequence.name}
                          {sequence.isDefault && " (Default)"}
                        </option>
                      ))}
                    </select>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    Reminders will send based on your sequence settings and respect customer consent
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 disabled:bg-gray-400"
            >
              {loading ? "Creating..." : "Create Invoice"}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </>
      )}
    </form>
  );
}
