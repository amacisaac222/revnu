"use client";

import { useState } from "react";
import { X, Plus, Loader2, DollarSign, Calendar, User, FileText } from "lucide-react";

interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
}

interface QuickInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInvoiceCreated: (invoice: any) => void;
  customers: Customer[];
}

export default function QuickInvoiceModal({
  isOpen,
  onClose,
  onInvoiceCreated,
  customers,
}: QuickInvoiceModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showNewCustomer, setShowNewCustomer] = useState(false);
  const [formData, setFormData] = useState({
    customerId: "",
    invoiceNumber: "",
    amountDue: "",
    dueDate: "",
    description: "",
  });
  const [newCustomerData, setNewCustomerData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    smsConsentGiven: false,
    emailConsentGiven: false,
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      let customerId = formData.customerId;

      // If creating a new customer, create them first
      if (showNewCustomer) {
        if (!newCustomerData.firstName || !newCustomerData.lastName) {
          throw new Error("First and last name are required for new customer");
        }
        if (!newCustomerData.email && !newCustomerData.phone) {
          throw new Error("Either email or phone is required for new customer");
        }

        const customerResponse = await fetch("/api/customers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newCustomerData),
        });

        if (!customerResponse.ok) {
          const data = await customerResponse.json();
          throw new Error(data.error || "Failed to create customer");
        }

        const newCustomer = await customerResponse.json();
        customerId = newCustomer.id;
      }

      // Create the invoice
      const response = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId,
          invoiceNumber: formData.invoiceNumber,
          amountDue: parseFloat(formData.amountDue) * 100, // Convert to cents
          dueDate: formData.dueDate,
          description: formData.description,
          status: "unpaid",
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create invoice");
      }

      const invoice = await response.json();
      onInvoiceCreated(invoice);

      // Reset form
      setFormData({
        customerId: "",
        invoiceNumber: "",
        amountDue: "",
        dueDate: "",
        description: "",
      });
      setNewCustomerData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        smsConsentGiven: false,
        emailConsentGiven: false,
      });
      setShowNewCustomer(false);
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to create invoice");
    } finally {
      setLoading(false);
    }
  };

  const selectedCustomer = customers.find((c) => c.id === formData.customerId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative bg-revnu-dark border-2 border-revnu-green/30 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={loading}
          className="absolute top-4 right-4 p-2 rounded-lg hover:bg-revnu-slate/40 transition text-revnu-gray hover:text-white disabled:opacity-50"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="p-8 border-b border-revnu-slate/30">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-revnu-green/20 border border-revnu-green/40 rounded-xl flex items-center justify-center">
              <Plus className="w-7 h-7 text-revnu-green" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white">Create Quick Invoice</h2>
              <p className="text-revnu-gray mt-1">Add invoice and send reminders</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {/* Customer Selection */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-bold text-white">
                Customer <span className="text-revnu-green">*</span>
              </label>
              <button
                type="button"
                onClick={() => {
                  setShowNewCustomer(!showNewCustomer);
                  setFormData({ ...formData, customerId: "" });
                }}
                className="text-xs font-semibold text-revnu-green hover:text-revnu-greenLight transition flex items-center gap-1"
              >
                {showNewCustomer ? (
                  <>
                    <X className="w-3 h-3" />
                    Cancel
                  </>
                ) : (
                  <>
                    <Plus className="w-3 h-3" />
                    New Customer
                  </>
                )}
              </button>
            </div>

            {showNewCustomer ? (
              <div className="space-y-4 p-4 bg-revnu-slate/20 border border-revnu-green/20 rounded-lg">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-revnu-gray mb-1">
                      First Name <span className="text-revnu-green">*</span>
                    </label>
                    <input
                      type="text"
                      value={newCustomerData.firstName}
                      onChange={(e) => setNewCustomerData({ ...newCustomerData, firstName: e.target.value })}
                      required={showNewCustomer}
                      placeholder="John"
                      className="w-full px-3 py-2 bg-revnu-dark border border-revnu-grayLight/20 rounded-lg text-white text-sm placeholder-revnu-gray focus:outline-none focus:border-revnu-green transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-revnu-gray mb-1">
                      Last Name <span className="text-revnu-green">*</span>
                    </label>
                    <input
                      type="text"
                      value={newCustomerData.lastName}
                      onChange={(e) => setNewCustomerData({ ...newCustomerData, lastName: e.target.value })}
                      required={showNewCustomer}
                      placeholder="Doe"
                      className="w-full px-3 py-2 bg-revnu-dark border border-revnu-grayLight/20 rounded-lg text-white text-sm placeholder-revnu-gray focus:outline-none focus:border-revnu-green transition"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-revnu-gray mb-1">Email</label>
                  <input
                    type="email"
                    value={newCustomerData.email}
                    onChange={(e) => setNewCustomerData({ ...newCustomerData, email: e.target.value })}
                    placeholder="john@example.com"
                    className="w-full px-3 py-2 bg-revnu-dark border border-revnu-grayLight/20 rounded-lg text-white text-sm placeholder-revnu-gray focus:outline-none focus:border-revnu-green transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-revnu-gray mb-1">Phone</label>
                  <input
                    type="tel"
                    value={newCustomerData.phone}
                    onChange={(e) => setNewCustomerData({ ...newCustomerData, phone: e.target.value })}
                    placeholder="+1 (555) 123-4567"
                    className="w-full px-3 py-2 bg-revnu-dark border border-revnu-grayLight/20 rounded-lg text-white text-sm placeholder-revnu-gray focus:outline-none focus:border-revnu-green transition"
                  />
                </div>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm text-revnu-gray cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newCustomerData.smsConsentGiven}
                      onChange={(e) => setNewCustomerData({ ...newCustomerData, smsConsentGiven: e.target.checked })}
                      className="w-4 h-4 rounded border-revnu-grayLight/20 bg-revnu-dark text-revnu-green focus:ring-2 focus:ring-revnu-green"
                    />
                    SMS consent given
                  </label>
                  <label className="flex items-center gap-2 text-sm text-revnu-gray cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newCustomerData.emailConsentGiven}
                      onChange={(e) => setNewCustomerData({ ...newCustomerData, emailConsentGiven: e.target.checked })}
                      className="w-4 h-4 rounded border-revnu-grayLight/20 bg-revnu-dark text-revnu-green focus:ring-2 focus:ring-revnu-green"
                    />
                    Email consent given
                  </label>
                </div>
                <p className="text-xs text-revnu-gray/70">
                  Email or phone required. Consent needed to send reminders.
                </p>
              </div>
            ) : (
              <>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-revnu-gray pointer-events-none" />
                  <select
                    value={formData.customerId}
                    onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                    required={!showNewCustomer}
                    className="w-full pl-10 pr-4 py-3 bg-revnu-slate/40 border border-revnu-grayLight/20 rounded-lg text-white focus:outline-none focus:border-revnu-green transition"
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
                {selectedCustomer && (
                  <p className="text-xs text-revnu-gray mt-2">
                    Contact: {selectedCustomer.phone || selectedCustomer.email || "No contact info"}
                  </p>
                )}
              </>
            )}
          </div>

          {/* Invoice Number */}
          <div>
            <label className="block text-sm font-bold text-white mb-2">
              Invoice Number <span className="text-revnu-green">*</span>
            </label>
            <div className="relative">
              <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-revnu-gray pointer-events-none" />
              <input
                type="text"
                value={formData.invoiceNumber}
                onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                required
                placeholder="INV-001"
                className="w-full pl-10 pr-4 py-3 bg-revnu-slate/40 border border-revnu-grayLight/20 rounded-lg text-white placeholder-revnu-gray focus:outline-none focus:border-revnu-green transition"
              />
            </div>
          </div>

          {/* Amount Due */}
          <div>
            <label className="block text-sm font-bold text-white mb-2">
              Amount Due <span className="text-revnu-green">*</span>
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-revnu-gray pointer-events-none" />
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.amountDue}
                onChange={(e) => setFormData({ ...formData, amountDue: e.target.value })}
                required
                placeholder="0.00"
                className="w-full pl-10 pr-4 py-3 bg-revnu-slate/40 border border-revnu-grayLight/20 rounded-lg text-white placeholder-revnu-gray focus:outline-none focus:border-revnu-green transition"
              />
            </div>
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-sm font-bold text-white mb-2">
              Due Date <span className="text-revnu-green">*</span>
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-revnu-gray pointer-events-none" />
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                required
                className="w-full pl-10 pr-4 py-3 bg-revnu-slate/40 border border-revnu-grayLight/20 rounded-lg text-white focus:outline-none focus:border-revnu-green transition"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-bold text-white mb-2">
              Description
              <span className="text-revnu-gray font-normal ml-2">(Optional)</span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Services rendered..."
              rows={3}
              className="w-full px-4 py-3 bg-revnu-slate/40 border border-revnu-grayLight/20 rounded-lg text-white placeholder-revnu-gray focus:outline-none focus:border-revnu-green transition resize-none"
            />
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-6 py-3 bg-transparent border border-revnu-grayLight/20 text-white font-semibold rounded-lg hover:bg-revnu-slate/40 transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-4 bg-revnu-green text-revnu-dark font-bold rounded-lg hover:bg-revnu-greenLight transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-revnu-green/20"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5" />
                  Create & Continue
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
