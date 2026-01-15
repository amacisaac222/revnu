'use client';

import { useState } from 'react';
import SequencePreviewCard from './sequence-preview-card';
import { AlertTriangle, CheckSquare, Square, Search, X, Loader2, CheckCircle } from 'lucide-react';

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
  _count?: {
    invoices: number;
  };
}

interface Organization {
  id: string;
  businessName: string;
}

interface SequenceManagerTabProps {
  sequences: SequenceTemplate[];
  invoices: Invoice[];
  organization: Organization;
  onRefresh: () => void;
}

type FilterType = 'all' | 'overdue' | 'has_sms' | 'has_email';

export default function SequenceManagerTab({ sequences, invoices, organization, onRefresh }: SequenceManagerTabProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('overdue');
  const [selectedInvoices, setSelectedInvoices] = useState<Set<string>>(new Set());
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedSequence, setSelectedSequence] = useState<SequenceTemplate | null>(null);
  const [assigning, setAssigning] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  // Filter invoices
  const getFilteredInvoices = () => {
    let filtered = [...invoices];

    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(inv =>
        inv.customer.firstName.toLowerCase().includes(query) ||
        inv.customer.lastName.toLowerCase().includes(query) ||
        inv.invoiceNumber.toLowerCase().includes(query)
      );
    }

    // Apply filter type
    switch (filterType) {
      case 'overdue':
        filtered = filtered.filter(inv => inv.daysPastDue > 0);
        break;
      case 'has_sms':
        filtered = filtered.filter(inv => inv.customer.phone && inv.customer.smsConsentGiven);
        break;
      case 'has_email':
        filtered = filtered.filter(inv => inv.customer.email && inv.customer.emailConsentGiven);
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
    setSelectedInvoices(newSelected);
  };

  const selectAllVisible = () => {
    const newSelected = new Set(selectedInvoices);
    const toAdd = filteredInvoices.slice(0, 100 - newSelected.size);
    toAdd.forEach(inv => newSelected.add(inv.id));
    setSelectedInvoices(newSelected);
  };

  const clearSelection = () => {
    setSelectedInvoices(new Set());
  };

  const handleAssignClick = (sequence: SequenceTemplate) => {
    if (selectedInvoices.size === 0) {
      alert('Please select at least one invoice');
      return;
    }
    setSelectedSequence(sequence);
    setShowConfirmModal(true);
  };

  const confirmAssignment = async () => {
    if (!selectedSequence) return;

    setAssigning(true);
    setShowConfirmModal(false);

    try {
      let successCount = 0;
      for (const invoiceId of Array.from(selectedInvoices)) {
        const response = await fetch(`/api/invoices/${invoiceId}/assign-sequence`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sequenceId: selectedSequence.id }),
        });
        if (response.ok) successCount++;
      }

      setResult({
        success: true,
        message: `Successfully assigned ${successCount} invoice(s) to "${selectedSequence.name}"`,
      });
      clearSelection();
      setSelectedSequence(null);
      onRefresh();
    } catch (error) {
      setResult({
        success: false,
        message: 'Failed to assign sequences. Please try again.',
      });
    } finally {
      setAssigning(false);
    }
  };

  const handleDuplicate = async (sequenceId: string) => {
    try {
      const response = await fetch('/api/sequences/duplicate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sequenceId }),
      });
      if (response.ok) {
        onRefresh();
      }
    } catch (error) {
      console.error('Failed to duplicate:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Result Banner */}
      {result && (
        <div className={`p-4 rounded-xl border-2 flex items-start gap-3 ${
          result.success ? 'bg-revnu-green/10 border-revnu-green/30 text-revnu-green' : 'bg-red-500/10 border-red-500/30 text-red-400'
        }`}>
          {result.success ? <CheckCircle className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
          <p className="flex-1 font-bold">{result.message}</p>
          <button onClick={() => setResult(null)}><X className="w-5 h-5" /></button>
        </div>
      )}

      {/* Invoice Selection Section */}
      <div className="bg-revnu-slate/40 border-2 border-revnu-green/30 rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Select Invoices to Assign</h2>
          {selectedInvoices.size > 0 && (
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-revnu-green/20 text-revnu-green font-bold rounded-lg">
                {selectedInvoices.size} selected
              </span>
              <button
                onClick={clearSelection}
                className="px-3 py-1 bg-revnu-dark border border-revnu-green/30 text-revnu-gray font-bold rounded-lg hover:text-white transition"
              >
                Clear
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
          <div className="flex items-center gap-2">
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

        {/* Invoice List */}
        {filteredInvoices.length === 0 ? (
          <div className="bg-revnu-dark/50 border border-revnu-green/10 rounded-lg p-8 text-center">
            <AlertTriangle className="w-12 h-12 mx-auto mb-3 text-revnu-gray opacity-50" />
            <p className="text-revnu-gray">No invoices found</p>
          </div>
        ) : (
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
                      <span className="font-bold text-white">
                        {invoice.customer.firstName} {invoice.customer.lastName}
                      </span>
                      <span className="text-sm text-revnu-gray">{invoice.invoiceNumber}</span>
                      <span className="text-sm font-bold text-revnu-green">
                        ${(invoice.amountRemaining / 100).toFixed(2)}
                      </span>
                      {invoice.daysPastDue > 0 && (
                        <span className="text-xs px-2 py-1 bg-red-500/20 text-red-400 rounded">
                          {invoice.daysPastDue}d overdue
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Sequences Section */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4">Available Sequences</h2>
        {sequences.length === 0 ? (
          <div className="bg-revnu-slate/40 border border-revnu-green/20 rounded-xl p-12 text-center">
            <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-revnu-gray opacity-50" />
            <h3 className="text-xl font-bold text-white mb-2">No Sequences</h3>
            <p className="text-revnu-gray">Create sequences in the "Create Sequence" tab</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sequences.map((sequence) => (
              <SequencePreviewCard
                key={sequence.id}
                sequence={sequence}
                organizationName={organization.businessName}
                onDuplicate={handleDuplicate}
                onAssign={() => handleAssignClick(sequence)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && selectedSequence && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="bg-revnu-dark border-2 border-revnu-green/30 rounded-xl p-8 max-w-md w-full">
            <h3 className="text-2xl font-bold text-white mb-4">Confirm Assignment</h3>
            <div className="space-y-4 mb-6">
              <p className="text-revnu-gray">
                You are about to assign <span className="text-white font-bold">{selectedInvoices.size} invoice(s)</span> to:
              </p>
              <div className="p-4 bg-revnu-slate/40 border border-revnu-green/20 rounded-lg">
                <p className="font-bold text-revnu-green text-lg">{selectedSequence.name}</p>
                {selectedSequence.description && (
                  <p className="text-sm text-revnu-gray mt-1">{selectedSequence.description}</p>
                )}
                <p className="text-sm text-revnu-gray mt-2">
                  {selectedSequence.steps.length} step(s) • Starts {selectedSequence.triggerDaysPastDue} day(s) past due
                </p>
              </div>
              <p className="text-sm text-revnu-gray">
                Customers will begin receiving automated messages according to this sequence.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 px-4 py-3 bg-revnu-dark border border-revnu-green/30 text-white font-bold rounded-lg hover:bg-revnu-dark/50 transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmAssignment}
                className="flex-1 px-4 py-3 bg-revnu-green text-revnu-dark font-bold rounded-lg hover:bg-revnu-green/90 transition"
              >
                Confirm Assignment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assigning Overlay */}
      {assigning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
          <div className="bg-revnu-dark border-2 border-revnu-green/30 rounded-xl p-8 text-center">
            <Loader2 className="w-12 h-12 mx-auto mb-4 text-revnu-green animate-spin" />
            <p className="text-white font-bold">Assigning sequences...</p>
          </div>
        </div>
      )}
    </div>
  );
}
