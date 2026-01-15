'use client';

import { useState, useEffect } from 'react';
import { Send, CheckSquare, Square, MessageSquare, Mail, AlertTriangle, CheckCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface Invoice {
  id: string;
  invoiceNumber: string;
  amountRemaining: number;
  daysPastDue: number;
  status: string;
  customer: {
    id: string;
    firstName: string;
    lastName: string;
    email: string | null;
    phone: string | null;
  };
}

export default function SendMessagesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [selectedInvoices, setSelectedInvoices] = useState<Set<string>>(new Set());
  const [channel, setChannel] = useState<'sms' | 'email'>('sms');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [results, setResults] = useState<{ success: number; failed: number; total: number } | null>(null);

  useEffect(() => {
    fetchOverdueInvoices();
  }, []);

  const fetchOverdueInvoices = async () => {
    try {
      const response = await fetch('/api/invoices?status=overdue&limit=100');
      const data = await response.json();
      setInvoices(data.invoices || []);
    } catch (error) {
      console.error('Error fetching invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleInvoice = (invoiceId: string) => {
    const newSelected = new Set(selectedInvoices);
    if (newSelected.has(invoiceId)) {
      newSelected.delete(invoiceId);
    } else {
      newSelected.add(invoiceId);
    }
    setSelectedInvoices(newSelected);
  };

  const toggleAll = () => {
    if (selectedInvoices.size === invoices.length) {
      setSelectedInvoices(new Set());
    } else {
      setSelectedInvoices(new Set(invoices.map(inv => inv.id)));
    }
  };

  const handleBulkSend = async () => {
    if (selectedInvoices.size === 0) return;

    setSending(true);
    setResults(null);

    let success = 0;
    let failed = 0;

    for (const invoiceId of selectedInvoices) {
      try {
        const response = await fetch(`/api/invoices/${invoiceId}/send-reminder`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ channel }),
        });

        if (response.ok) {
          success++;
        } else {
          failed++;
        }
      } catch (error) {
        failed++;
      }
    }

    setResults({ success, failed, total: selectedInvoices.size });
    setSelectedInvoices(new Set());
    setSending(false);

    // Refresh invoice list
    fetchOverdueInvoices();
  };

  const totalAmount = Array.from(selectedInvoices)
    .reduce((sum, id) => {
      const invoice = invoices.find(inv => inv.id === id);
      return sum + (invoice?.amountRemaining || 0);
    }, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-revnu-gray">Loading invoices...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard"
          className="p-2 hover:bg-revnu-slate/40 rounded-lg transition"
        >
          <ArrowLeft className="w-5 h-5 text-revnu-gray" />
        </Link>
        <div>
          <h1 className="text-3xl font-black text-white">Send Messages</h1>
          <p className="text-revnu-gray mt-1">Send payment reminders to multiple customers</p>
        </div>
      </div>

      {invoices.length === 0 ? (
        <div className="bg-revnu-slate/40 border border-revnu-green/20 rounded-xl p-12 text-center">
          <CheckCircle className="w-16 h-16 mx-auto mb-4 text-revnu-green opacity-50" />
          <h3 className="text-xl font-bold text-white mb-2">All Caught Up!</h3>
          <p className="text-revnu-gray">No overdue invoices to send reminders for.</p>
        </div>
      ) : (
        <>
          {/* Controls */}
          <div className="bg-revnu-slate/40 border border-revnu-green/20 rounded-xl p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Selection Info */}
              <div>
                <label className="block text-sm font-bold text-white mb-2">
                  Selected Invoices
                </label>
                <div className="text-3xl font-black text-revnu-green">
                  {selectedInvoices.size}
                </div>
                <p className="text-xs text-revnu-gray mt-1">
                  Total: ${(totalAmount / 100).toLocaleString()}
                </p>
              </div>

              {/* Channel Selection */}
              <div>
                <label className="block text-sm font-bold text-white mb-2">
                  Send Via
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setChannel('sms')}
                    className={`p-3 rounded-lg border-2 transition flex items-center justify-center gap-2 ${
                      channel === 'sms'
                        ? 'bg-revnu-green/20 border-revnu-green text-revnu-green'
                        : 'bg-revnu-dark/50 border-revnu-green/20 text-revnu-gray hover:border-revnu-green/40'
                    }`}
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span className="font-bold text-sm">SMS</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setChannel('email')}
                    className={`p-3 rounded-lg border-2 transition flex items-center justify-center gap-2 ${
                      channel === 'email'
                        ? 'bg-revnu-green/20 border-revnu-green text-revnu-green'
                        : 'bg-revnu-dark/50 border-revnu-green/20 text-revnu-gray hover:border-revnu-green/40'
                    }`}
                  >
                    <Mail className="w-4 h-4" />
                    <span className="font-bold text-sm">Email</span>
                  </button>
                </div>
              </div>

              {/* Send Button */}
              <div>
                <label className="block text-sm font-bold text-white mb-2">
                  Actions
                </label>
                <button
                  onClick={handleBulkSend}
                  disabled={sending || selectedInvoices.size === 0}
                  className="w-full px-6 py-3 bg-gradient-to-r from-revnu-green to-revnu-greenDark text-revnu-dark font-black rounded-lg hover:from-revnu-greenLight hover:to-revnu-green transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-revnu-green/20 flex items-center justify-center gap-2"
                >
                  {sending ? (
                    <>
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Send to {selectedInvoices.size}
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Results */}
            {results && (
              <div className="mt-6 p-4 bg-revnu-green/10 border border-revnu-green/30 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-revnu-green" />
                  <span className="font-bold text-white">Bulk Send Complete</span>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-revnu-gray">Sent:</span>
                    <span className="ml-2 font-bold text-revnu-green">{results.success}</span>
                  </div>
                  <div>
                    <span className="text-revnu-gray">Failed:</span>
                    <span className="ml-2 font-bold text-red-400">{results.failed}</span>
                  </div>
                  <div>
                    <span className="text-revnu-gray">Total:</span>
                    <span className="ml-2 font-bold text-white">{results.total}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Invoice List */}
          <div className="bg-revnu-slate/40 border border-revnu-green/20 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">Overdue Invoices ({invoices.length})</h3>
              <button
                onClick={toggleAll}
                className="text-sm font-bold text-revnu-green hover:text-revnu-greenLight transition flex items-center gap-2"
              >
                {selectedInvoices.size === invoices.length ? (
                  <>
                    <CheckSquare className="w-4 h-4" />
                    Deselect All
                  </>
                ) : (
                  <>
                    <Square className="w-4 h-4" />
                    Select All
                  </>
                )}
              </button>
            </div>

            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {invoices.map((invoice) => {
                const isSelected = selectedInvoices.has(invoice.id);
                return (
                  <button
                    key={invoice.id}
                    onClick={() => toggleInvoice(invoice.id)}
                    className={`w-full p-4 rounded-lg border-2 transition text-left ${
                      isSelected
                        ? 'bg-revnu-green/10 border-revnu-green'
                        : 'bg-revnu-dark/50 border-revnu-green/20 hover:border-revnu-green/40'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="mt-1">
                          {isSelected ? (
                            <CheckSquare className="w-5 h-5 text-revnu-green" />
                          ) : (
                            <Square className="w-5 h-5 text-revnu-gray" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <span className="font-bold text-white">
                              {invoice.customer.firstName} {invoice.customer.lastName}
                            </span>
                            <span className="text-xs text-revnu-gray">
                              {invoice.invoiceNumber}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-sm">
                            <span className="text-revnu-green font-bold">
                              ${(invoice.amountRemaining / 100).toFixed(2)}
                            </span>
                            <span className="text-amber-400">
                              {invoice.daysPastDue} days overdue
                            </span>
                            <span className="text-revnu-gray text-xs">
                              {channel === 'sms' ? invoice.customer.phone : invoice.customer.email}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
