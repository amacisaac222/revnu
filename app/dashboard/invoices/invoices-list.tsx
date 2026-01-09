"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

interface Invoice {
  id: string;
  invoiceNumber: string;
  invoiceDate: Date;
  dueDate: Date;
  amountDue: number;
  amountRemaining: number;
  status: string;
  daysPastDue: number;
  customer: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

interface InvoicesListProps {
  invoices: Invoice[];
}

export default function InvoicesList({ invoices }: InvoicesListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "outstanding" | "partial" | "paid" | "overdue">("all");
  const [sortBy, setSortBy] = useState<"due_date" | "amount" | "customer">("due_date");

  // Filter and sort invoices
  const filteredAndSortedInvoices = useMemo(() => {
    let filtered = invoices;

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (inv) =>
          inv.invoiceNumber.toLowerCase().includes(query) ||
          inv.customer.firstName.toLowerCase().includes(query) ||
          inv.customer.lastName.toLowerCase().includes(query)
      );
    }

    // Apply status filter
    if (statusFilter === "overdue") {
      filtered = filtered.filter((inv) => inv.daysPastDue > 0);
    } else if (statusFilter !== "all") {
      filtered = filtered.filter((inv) => inv.status === statusFilter);
    }

    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      if (sortBy === "due_date") {
        return new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime();
      } else if (sortBy === "amount") {
        return b.amountRemaining - a.amountRemaining;
      } else if (sortBy === "customer") {
        return `${a.customer.firstName} ${a.customer.lastName}`.localeCompare(
          `${b.customer.firstName} ${b.customer.lastName}`
        );
      }
      return 0;
    });

    return sorted;
  }, [invoices, searchQuery, statusFilter, sortBy]);

  const statusColors: Record<string, string> = {
    outstanding: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    partial: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    paid: "bg-revnu-green/20 text-revnu-green border-revnu-green/30",
    written_off: "bg-gray-500/20 text-gray-400 border-gray-500/30",
  };

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="bg-revnu-dark/50 p-4 rounded-xl border-2 border-revnu-green/10">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by invoice #, customer name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 bg-revnu-slate/40 border-2 border-revnu-green/20 rounded-lg text-white placeholder-revnu-gray focus:outline-none focus:border-revnu-green/40"
            />
          </div>

          {/* Status Filter */}
          <div className="w-full md:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full px-4 py-2 bg-revnu-slate/40 border-2 border-revnu-green/20 rounded-lg text-white focus:outline-none focus:border-revnu-green/40"
            >
              <option value="all">All Statuses</option>
              <option value="outstanding">Outstanding</option>
              <option value="partial">Partial</option>
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>

          {/* Sort */}
          <div className="w-full md:w-48">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-4 py-2 bg-revnu-slate/40 border-2 border-revnu-green/20 rounded-lg text-white focus:outline-none focus:border-revnu-green/40"
            >
              <option value="due_date">Sort by Due Date</option>
              <option value="amount">Sort by Amount</option>
              <option value="customer">Sort by Customer</option>
            </select>
          </div>
        </div>

        {/* Results count */}
        <div className="mt-3 text-sm text-revnu-gray">
          Showing {filteredAndSortedInvoices.length} of {invoices.length} invoices
        </div>
      </div>

      {/* Invoice List */}
      <div className="bg-revnu-slate/40 rounded-xl border border-revnu-green/20">
        {filteredAndSortedInvoices.length === 0 ? (
          <div className="p-12 text-center">
            <h3 className="text-lg font-bold text-white mb-2">No invoices found</h3>
            <p className="text-revnu-gray">
              {searchQuery || statusFilter !== "all"
                ? "Try adjusting your search or filters"
                : "Create your first invoice to get started"}
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-revnu-dark/50 border-b border-revnu-green/20">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-revnu-gray uppercase tracking-wide">
                      Invoice #
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-revnu-gray uppercase tracking-wide">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-revnu-gray uppercase tracking-wide">
                      Due Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-revnu-gray uppercase tracking-wide">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-revnu-gray uppercase tracking-wide">
                      Remaining
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-revnu-gray uppercase tracking-wide">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-revnu-gray uppercase tracking-wide">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-revnu-green/10">
                  {filteredAndSortedInvoices.map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-revnu-dark/30 transition">
                      <td className="px-6 py-4 font-black text-white">
                        {invoice.invoiceNumber}
                      </td>
                      <td className="px-6 py-4 text-sm text-revnu-gray">
                        <Link
                          href={`/dashboard/customers/${invoice.customer.id}`}
                          className="hover:text-revnu-green"
                        >
                          {invoice.customer.firstName} {invoice.customer.lastName}
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-sm text-revnu-gray">
                        {new Date(invoice.dueDate).toLocaleDateString()}
                        {invoice.daysPastDue > 0 && (
                          <div className="text-red-400 font-bold text-xs mt-1">
                            {invoice.daysPastDue} days overdue
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 font-bold text-white">
                        ${(invoice.amountDue / 100).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 font-black text-revnu-green">
                        ${(invoice.amountRemaining / 100).toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded text-xs font-bold border ${
                            statusColors[invoice.status]
                          }`}
                        >
                          {invoice.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <Link
                          href={`/dashboard/invoices/${invoice.id}`}
                          className="text-sm font-bold text-revnu-green hover:text-revnu-greenLight"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden divide-y divide-revnu-green/10">
              {filteredAndSortedInvoices.map((invoice) => (
                <Link
                  key={invoice.id}
                  href={`/dashboard/invoices/${invoice.id}`}
                  className="block p-4 active:bg-revnu-dark/30 transition"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="font-black text-white text-base mb-1">
                        {invoice.invoiceNumber}
                      </div>
                      <div className="text-xs text-revnu-gray">
                        {invoice.customer.firstName} {invoice.customer.lastName}
                      </div>
                      <div className="text-xs text-revnu-gray mt-1">
                        Due: {new Date(invoice.dueDate).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded text-xs font-bold border ${
                          statusColors[invoice.status]
                        }`}
                      >
                        {invoice.status}
                      </span>
                      {invoice.daysPastDue > 0 && (
                        <div className="text-red-400 font-bold text-xs mt-1">
                          {invoice.daysPastDue} days overdue
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-revnu-dark/50 p-3 rounded border border-revnu-green/10">
                      <div className="text-xs text-revnu-gray font-bold uppercase tracking-wide mb-1">
                        Amount Due
                      </div>
                      <div className="text-base font-black text-white">
                        ${(invoice.amountDue / 100).toLocaleString()}
                      </div>
                    </div>
                    <div className="bg-revnu-dark/50 p-3 rounded border border-revnu-green/10">
                      <div className="text-xs text-revnu-gray font-bold uppercase tracking-wide mb-1">
                        Remaining
                      </div>
                      <div className="text-base font-black text-revnu-green">
                        ${(invoice.amountRemaining / 100).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
