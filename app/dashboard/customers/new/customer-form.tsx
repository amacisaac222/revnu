"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface CustomerFormProps {
  organizationId: string;
}

export default function CustomerForm({ organizationId }: CustomerFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    propertyAddress: "",
    propertyCity: "",
    propertyState: "",
    propertyZip: "",
    smsConsentGiven: false,
    smsConsentMethod: "",
    emailConsentGiven: false,
    customerNotes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          organizationId,
          smsConsentDate: formData.smsConsentGiven ? new Date().toISOString() : null,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create customer");
      }

      router.push("/dashboard/customers");
      router.refresh();
    } catch (error) {
      console.error("Error creating customer:", error);
      alert("Failed to create customer. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Name */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-white mb-2">
            First Name *
          </label>
          <input
            type="text"
            id="firstName"
            required
            value={formData.firstName}
            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
            className="w-full px-3 py-2 bg-revnu-dark border border-revnu-green/30 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-revnu-green"
          />
        </div>
        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-white mb-2">
            Last Name *
          </label>
          <input
            type="text"
            id="lastName"
            required
            value={formData.lastName}
            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
            className="w-full px-3 py-2 bg-revnu-dark border border-revnu-green/30 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-revnu-green"
          />
        </div>
      </div>

      {/* Contact */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
            Email
          </label>
          <input
            type="email"
            id="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-3 py-2 bg-revnu-dark border border-revnu-green/30 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-revnu-green"
          />
        </div>
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-white mb-2">
            Phone
          </label>
          <input
            type="tel"
            id="phone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full px-3 py-2 bg-revnu-dark border border-revnu-green/30 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-revnu-green"
            placeholder="+1 (555) 123-4567"
          />
        </div>
      </div>

      {/* Address */}
      <div>
        <label htmlFor="address" className="block text-sm font-medium text-white mb-2">
          Street Address
        </label>
        <input
          type="text"
          id="address"
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          className="w-full px-3 py-2 bg-revnu-dark border border-revnu-green/30 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-revnu-green"
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-1">
          <label htmlFor="city" className="block text-sm font-medium text-white mb-2">
            City
          </label>
          <input
            type="text"
            id="city"
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            className="w-full px-3 py-2 bg-revnu-dark border border-revnu-green/30 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-revnu-green"
          />
        </div>
        <div className="col-span-1">
          <label htmlFor="state" className="block text-sm font-medium text-white mb-2">
            State
          </label>
          <input
            type="text"
            id="state"
            value={formData.state}
            onChange={(e) => setFormData({ ...formData, state: e.target.value })}
            className="w-full px-3 py-2 bg-revnu-dark border border-revnu-green/30 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-revnu-green"
            placeholder="CA"
            maxLength={2}
          />
        </div>
        <div className="col-span-1">
          <label htmlFor="zip" className="block text-sm font-medium text-white mb-2">
            ZIP
          </label>
          <input
            type="text"
            id="zip"
            value={formData.zip}
            onChange={(e) => setFormData({ ...formData, zip: e.target.value })}
            className="w-full px-3 py-2 bg-revnu-dark border border-revnu-green/30 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-revnu-green"
          />
        </div>
      </div>

      {/* Property Address (for Mechanics Lien) */}
      <div className="border-t border-revnu-green/20 pt-6">
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-sm font-semibold text-white">Property/Work Location</h3>
          <span className="text-xs text-revnu-gray">(For mechanics lien protection)</span>
        </div>
        <p className="text-xs text-revnu-gray mb-4">
          If work is performed at a different location than the billing address, enter it here to enable mechanics lien tracking.
        </p>

        <div>
          <label htmlFor="propertyAddress" className="block text-sm font-medium text-white mb-2">
            Property Street Address
          </label>
          <input
            type="text"
            id="propertyAddress"
            value={formData.propertyAddress}
            onChange={(e) => setFormData({ ...formData, propertyAddress: e.target.value })}
            className="w-full px-3 py-2 bg-revnu-dark border border-revnu-green/30 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-revnu-green"
            placeholder="Leave blank if same as billing address"
          />
        </div>

        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="col-span-1">
            <label htmlFor="propertyCity" className="block text-sm font-medium text-white mb-2">
              City
            </label>
            <input
              type="text"
              id="propertyCity"
              value={formData.propertyCity}
              onChange={(e) => setFormData({ ...formData, propertyCity: e.target.value })}
              className="w-full px-3 py-2 bg-revnu-dark border border-revnu-green/30 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-revnu-green"
            />
          </div>
          <div className="col-span-1">
            <label htmlFor="propertyState" className="block text-sm font-medium text-white mb-2">
              State
            </label>
            <input
              type="text"
              id="propertyState"
              value={formData.propertyState}
              onChange={(e) => setFormData({ ...formData, propertyState: e.target.value })}
              className="w-full px-3 py-2 bg-revnu-dark border border-revnu-green/30 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-revnu-green"
              placeholder="CA"
              maxLength={2}
            />
          </div>
          <div className="col-span-1">
            <label htmlFor="propertyZip" className="block text-sm font-medium text-white mb-2">
              ZIP
            </label>
            <input
              type="text"
              id="propertyZip"
              value={formData.propertyZip}
              onChange={(e) => setFormData({ ...formData, propertyZip: e.target.value })}
              className="w-full px-3 py-2 bg-revnu-dark border border-revnu-green/30 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-revnu-green"
            />
          </div>
        </div>
      </div>

      {/* TCPA Consent */}
      <div className="border-t border-revnu-green/20 pt-6">
        <h3 className="text-sm font-semibold mb-4">Communication Consent (TCPA Compliance)</h3>

        <div className="space-y-4">
          <div className="flex items-start">
            <input
              type="checkbox"
              id="smsConsent"
              checked={formData.smsConsentGiven}
              onChange={(e) =>
                setFormData({ ...formData, smsConsentGiven: e.target.checked })
              }
              className="mt-1 h-4 w-4 rounded border-revnu-green/30"
            />
            <label htmlFor="smsConsent" className="ml-3 text-sm">
              <span className="font-medium">Customer consents to receive SMS messages</span>
              <p className="text-revnu-gray mt-1">
                Required before sending automated collection texts. Must be obtained legally.
              </p>
            </label>
          </div>

          {formData.smsConsentGiven && (
            <div>
              <label htmlFor="smsConsentMethod" className="block text-sm font-medium text-white mb-2">
                How was consent obtained? *
              </label>
              <select
                id="smsConsentMethod"
                required={formData.smsConsentGiven}
                value={formData.smsConsentMethod}
                onChange={(e) =>
                  setFormData({ ...formData, smsConsentMethod: e.target.value })
                }
                className="w-full px-3 py-2 bg-revnu-dark border border-revnu-green/30 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-revnu-green"
              >
                <option value="">Select method...</option>
                <option value="written">Written agreement</option>
                <option value="verbal">Verbal consent (recorded)</option>
                <option value="online_form">Online form submission</option>
                <option value="invoice_checkbox">Invoice/contract checkbox</option>
              </select>
            </div>
          )}

          <div className="flex items-start">
            <input
              type="checkbox"
              id="emailConsent"
              checked={formData.emailConsentGiven}
              onChange={(e) =>
                setFormData({ ...formData, emailConsentGiven: e.target.checked })
              }
              className="mt-1 h-4 w-4 rounded border-revnu-green/30"
            />
            <label htmlFor="emailConsent" className="ml-3 text-sm">
              <span className="font-medium">Customer consents to receive email</span>
            </label>
          </div>
        </div>
      </div>

      {/* Notes */}
      <div>
        <label htmlFor="customerNotes" className="block text-sm font-medium text-white mb-2">
          Notes
        </label>
        <textarea
          id="customerNotes"
          rows={3}
          value={formData.customerNotes}
          onChange={(e) => setFormData({ ...formData, customerNotes: e.target.value })}
          className="w-full px-3 py-2 bg-revnu-dark border border-revnu-green/30 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-revnu-green"
          placeholder="Any additional notes about this customer..."
        />
      </div>

      {/* Actions */}
      <div className="flex gap-4 pt-4">
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-revnu-green text-revnu-dark font-bold rounded-md hover:bg-revnu-greenLight disabled:bg-revnu-gray disabled:text-revnu-dark"
        >
          {loading ? "Creating..." : "Create Customer"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 border border-revnu-green/30 text-revnu-gray rounded-md hover:bg-revnu-slate/40 hover:text-white"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
