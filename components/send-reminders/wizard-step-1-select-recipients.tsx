'use client';

import { useState } from 'react';
import { AlertTriangle, CheckSquare, Square, Search, ArrowRight } from 'lucide-react';

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

interface WizardStep1Props {
  invoices: Invoice[];
  selectedInvoices: Set<string>;
  onSelectionChange: (selected: Set<string>) => void;
  onContinue: () => void;
  campaignMode: 'invoice' | 'customer';
  onCampaignModeChange: (mode: 'invoice' | 'customer') => void;
}

type FilterType = 'all' | 'overdue' | 'has_sms' | 'has_email';

export default function WizardStep1SelectRecipients({
  invoices,
  selectedInvoices,
  onSelectionChange,
  onContinue,
  campaignMode,
  onCampaignModeChange,
}: WizardStep1Props) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('overdue');

  const getFilteredInvoices = () => {
    let filtered = [...invoices];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (inv) =>
          inv.customer.firstName.toLowerCase().includes(query) ||
          inv.customer.lastName.toLowerCase().includes(query) ||
          inv.invoiceNumber.toLowerCase().includes(query)
      );
    }

    switch (filterType) {
      case 'overdue':
        filtered = filtered.filter((inv) => inv.daysPastDue > 0);
        break;
      case 'has_sms':
        filtered = filtered.filter((inv) => inv.customer.phone && inv.customer.smsConsentGiven);
        break;
      case 'has_email':
        filtered = filtered.filter((inv) => inv.customer.email && inv.customer.emailConsentGiven);
        break;
    }

    return filtered;
  };

  const filteredInvoices = getFilteredInvoices();

  const toggleInvoiceSelection = (invoiceId: string) => {
    const newSelected = new Set(selectedInvoices);
    if (newSelected.has(invoiceId)) {
      newSelected.delete(invoiceId);
    } else {
      if (newSelected.size >= 100) {
        alert('Maximum 100 invoices can be selected at once');
        return;
      }
      newSelected.add(invoiceId);
    }
    onSelectionChange(newSelected);
  };

  const selectAllVisible = () => {
    const newSelected = new Set(selectedInvoices);
    const toAdd = filteredInvoices.slice(0, 100 - newSelected.size);
    toAdd.forEach((inv) => newSelected.add(inv.id));
    onSelectionChange(newSelected);
  };

  const clearSelection = () => {
    onSelectionChange(new Set());
  };

  // Get contact info stats for selected invoices
  const getContactStats = () => {
    const selected = filteredInvoices.filter(inv => selectedInvoices.has(inv.id));
    const hasSMS = selected.filter(inv => inv.customer.phone && inv.customer.smsConsentGiven).length;
    const hasEmail = selected.filter(inv => inv.customer.email && inv.customer.emailConsentGiven).length;
    const missingBoth = selected.filter(inv =>
      (!inv.customer.phone || !inv.customer.smsConsentGiven) &&
      (!inv.customer.email || !inv.customer.emailConsentGiven)
    ).length;
    return { hasSMS, hasEmail, missingBoth, total: selected.length };
  };

  const stats = getContactStats();

  return (
    <div className="space-y-6">
      {/* Campaign Mode Toggle */}
      <div className="bg-revnu-slate/40 border-2 border-revnu-green/30 rounded-xl p-6">
        <h3 className="text-lg font-bold text-white mb-3">Campaign Type</h3>
        <div className="flex gap-4">
          <button
            onClick={() => onCampaignModeChange('invoice')}
            className={`flex-1 p-4 rounded-lg border-2 transition ${
              campaignMode === 'invoice'
                ? 'bg-revnu-green/10 border-revnu-green text-white'
                : 'bg-revnu-dark border-revnu-green/20 text-revnu-gray hover:border-revnu-green/40'
            }`}
          >
            <div className="font-bold text-lg">Invoice-Based</div>
            <div className="text-sm mt-1">For payment collection with invoice details</div>
          </button>
          <button
            onClick={() => onCampaignModeChange('customer')}
            className={`flex-1 p-4 rounded-lg border-2 transition ${
              campaignMode === 'customer'
                ? 'bg-revnu-green/10 border-revnu-green text-white'
                : 'bg-revnu-dark border-revnu-green/20 text-revnu-gray hover:border-revnu-green/40'
            }`}
          >
            <div className="font-bold text-lg">Customer-Based</div>
            <div className="text-sm mt-1">For general messages without invoices</div>
          </button>
        </div>
      </div>

      {/* Header */}
      <div className="bg-revnu-slate/40 border-2 border-revnu-green/30 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-white">Select Recipients</h2>
            <p className="text-revnu-gray mt-1">
              {campaignMode === 'invoice'
                ? 'Choose customers with invoices to enroll (max 100)'
                : 'Choose customers for general messaging (max 100)'}
            </p>
          </div>
          {selectedInvoices.size > 0 && (
            <div className="flex items-center gap-3">
              <span className="px-4 py-2 bg-revnu-green/20 text-revnu-green font-bold rounded-lg text-lg">
                {selectedInvoices.size} selected
              </span>
              <button
                onClick={clearSelection}
                className="px-3 py-2 bg-revnu-dark border border-revnu-green/30 text-revnu-gray font-bold rounded-lg hover:text-white transition"
              >
                Clear All
              </button>
            </div>
          )}
        </div>

        {/* Search and Filters */}
        <div className="grid md:grid-cols-[1fr_auto] gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-revnu-gray" />
            <input
              type="text"
              placeholder="Search customers or invoice numbers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-revnu-dark border border-revnu-green/30 rounded-lg text-white focus:outline-none focus:border-revnu-green"
            />
          </div>

          <div className="flex gap-2">
            {[
              { value: 'all', label: 'All' },
              { value: 'overdue', label: 'Overdue' },
              { value: 'has_sms', label: 'SMS' },
              { value: 'has_email', label: 'Email' },
            ].map((f) => (
              <button
                key={f.value}
                onClick={() => setFilterType(f.value as FilterType)}
                className={`px-4 py-2 rounded-lg font-semibold text-sm whitespace-nowrap ${
                  filterType === f.value
                    ? 'bg-revnu-green text-revnu-dark'
                    : 'bg-revnu-dark text-revnu-gray border border-revnu-green/20'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Bulk Actions */}
        {filteredInvoices.length > 0 && (
          <div className="flex items-center gap-2 mt-4">
            <button
              onClick={selectAllVisible}
              disabled={selectedInvoices.size >= 100}
              className="text-sm text-revnu-green hover:text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Select All Visible ({Math.min(filteredInvoices.length, 100 - selectedInvoices.size)})
            </button>
            {selectedInvoices.size >= 100 && (
              <span className="text-xs text-yellow-400">(Maximum 100 reached)</span>
            )}
          </div>
        )}
      </div>

      {/* Contact Info Warning */}
      {selectedInvoices.size > 0 && stats.missingBoth > 0 && (
        <div className="bg-yellow-500/10 border-2 border-yellow-500/40 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <AlertTriangle className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="text-lg font-bold text-yellow-400 mb-2">Missing Contact Information</h3>
              <p className="text-yellow-200/80 mb-3">
                {stats.missingBoth} of {stats.total} selected customers are missing both SMS and email consent.
                They will be skipped when messages are sent.
              </p>
              <div className="grid grid-cols-3 gap-4 mt-4">
                <div className="bg-revnu-dark/50 rounded-lg p-3">
                  <div className="text-2xl font-bold text-revnu-green">{stats.hasSMS}</div>
                  <div className="text-sm text-revnu-gray">Can receive SMS</div>
                </div>
                <div className="bg-revnu-dark/50 rounded-lg p-3">
                  <div className="text-2xl font-bold text-revnu-green">{stats.hasEmail}</div>
                  <div className="text-sm text-revnu-gray">Can receive Email</div>
                </div>
                <div className="bg-revnu-dark/50 rounded-lg p-3">
                  <div className="text-2xl font-bold text-yellow-400">{stats.missingBoth}</div>
                  <div className="text-sm text-revnu-gray">Will be skipped</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Invoice List */}
      {filteredInvoices.length === 0 ? (
        <div className="bg-revnu-dark/50 border border-revnu-green/10 rounded-xl p-12 text-center">
          <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-revnu-gray opacity-50" />
          <p className="text-revnu-gray text-lg">No invoices found</p>
        </div>
      ) : (
        <div className="bg-revnu-slate/40 border border-revnu-green/20 rounded-xl p-6">
          <div className="max-h-96 overflow-y-auto space-y-2 pr-2">
            {filteredInvoices.map((invoice) => {
              const isSelected = selectedInvoices.has(invoice.id);
              return (
                <button
                  key={invoice.id}
                  onClick={() => toggleInvoiceSelection(invoice.id)}
                  className={`w-full flex items-center gap-4 p-4 rounded-lg border-2 transition text-left ${
                    isSelected
                      ? 'bg-revnu-green/10 border-revnu-green/40'
                      : 'bg-revnu-dark/50 border-revnu-green/10 hover:border-revnu-green/30'
                  }`}
                >
                  {isSelected ? (
                    <CheckSquare className="w-6 h-6 text-revnu-green flex-shrink-0" />
                  ) : (
                    <Square className="w-6 h-6 text-revnu-gray flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="font-bold text-white text-lg">
                        {invoice.customer.firstName} {invoice.customer.lastName}
                      </span>
                      <span className="text-sm text-revnu-gray">{invoice.invoiceNumber}</span>
                      <span className="text-sm font-bold text-revnu-green">
                        ${(invoice.amountRemaining / 100).toFixed(2)}
                      </span>
                      {invoice.daysPastDue > 0 && (
                        <span className="text-xs px-2 py-1 bg-red-500/20 text-red-400 rounded font-bold">
                          {invoice.daysPastDue}d overdue
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Continue Button */}
      <div className="flex justify-end">
        <button
          onClick={onContinue}
          disabled={selectedInvoices.size === 0}
          className="px-8 py-4 bg-revnu-green text-revnu-dark font-bold rounded-lg text-lg hover:bg-revnu-green/90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3"
        >
          Continue to Sequence Selection
          <ArrowRight className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}
