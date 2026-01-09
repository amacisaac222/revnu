"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  smsConsentGiven: boolean;
  smsOptedOut: boolean;
  invoices: Array<{
    id: string;
    amountRemaining: number;
  }>;
}

interface CustomersListProps {
  customers: Customer[];
}

export default function CustomersList({ customers }: CustomersListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "sms_ok" | "opted_out" | "no_consent">("all");
  const [sortBy, setSortBy] = useState<"name" | "invoices" | "owed">("name");
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      const response = await fetch("/api/customers/export");
      if (!response.ok) throw new Error("Export failed");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `customers-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Export error:", error);
      alert("Failed to export customers");
    } finally {
      setExporting(false);
    }
  };

  // Filter and sort customers
  const filteredAndSortedCustomers = useMemo(() => {
    let filtered = customers;

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.firstName.toLowerCase().includes(query) ||
          c.lastName.toLowerCase().includes(query) ||
          c.email?.toLowerCase().includes(query) ||
          c.phone?.includes(query)
      );
    }

    // Apply status filter
    if (statusFilter === "sms_ok") {
      filtered = filtered.filter((c) => c.smsConsentGiven && !c.smsOptedOut);
    } else if (statusFilter === "opted_out") {
      filtered = filtered.filter((c) => c.smsOptedOut);
    } else if (statusFilter === "no_consent") {
      filtered = filtered.filter((c) => !c.smsConsentGiven);
    }

    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      if (sortBy === "name") {
        return `${a.firstName} ${a.lastName}`.localeCompare(
          `${b.firstName} ${b.lastName}`
        );
      } else if (sortBy === "invoices") {
        return b.invoices.length - a.invoices.length;
      } else if (sortBy === "owed") {
        const aOwed = a.invoices.reduce((sum, inv) => sum + inv.amountRemaining, 0);
        const bOwed = b.invoices.reduce((sum, inv) => sum + inv.amountRemaining, 0);
        return bOwed - aOwed;
      }
      return 0;
    });

    return sorted;
  }, [customers, searchQuery, statusFilter, sortBy]);

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="bg-revnu-dark/50 p-4 rounded-xl border-2 border-revnu-green/10">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search customers by name, email, or phone..."
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
              <option value="all">All Customers</option>
              <option value="sms_ok">SMS OK</option>
              <option value="opted_out">Opted Out</option>
              <option value="no_consent">No SMS Consent</option>
            </select>
          </div>

          {/* Sort */}
          <div className="w-full md:w-48">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-4 py-2 bg-revnu-slate/40 border-2 border-revnu-green/20 rounded-lg text-white focus:outline-none focus:border-revnu-green/40"
            >
              <option value="name">Sort by Name</option>
              <option value="invoices">Sort by Invoices</option>
              <option value="owed">Sort by Amount Owed</option>
            </select>
          </div>

          {/* Export Button */}
          <button
            onClick={handleExport}
            disabled={exporting || customers.length === 0}
            className="px-4 py-2 bg-revnu-green/20 border-2 border-revnu-green/30 text-revnu-green font-bold rounded-lg hover:bg-revnu-green/30 transition disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          >
            {exporting ? "Exporting..." : "Export CSV"}
          </button>
        </div>

        {/* Results count */}
        <div className="mt-3 text-sm text-revnu-gray">
          Showing {filteredAndSortedCustomers.length} of {customers.length} customers
        </div>
      </div>

      {/* Customer List */}
      <div className="bg-revnu-slate/40 rounded-xl border border-revnu-green/20">
        {filteredAndSortedCustomers.length === 0 ? (
          <div className="p-12 text-center">
            <h3 className="text-lg font-bold text-white mb-2">No customers found</h3>
            <p className="text-revnu-gray">
              {searchQuery || statusFilter !== "all"
                ? "Try adjusting your search or filters"
                : "Add your first customer to get started"}
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden lg:block">
              <table className="w-full">
                <thead className="bg-revnu-dark/50 border-b border-revnu-green/20">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-revnu-gray uppercase tracking-wide">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-revnu-gray uppercase tracking-wide">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-revnu-gray uppercase tracking-wide">
                      SMS Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-revnu-gray uppercase tracking-wide">
                      Invoices
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-revnu-gray uppercase tracking-wide">
                      Total Owed
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-revnu-gray uppercase tracking-wide">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-revnu-green/10">
                  {filteredAndSortedCustomers.map((customer) => {
                    const totalOwed = customer.invoices.reduce(
                      (sum, inv) => sum + inv.amountRemaining,
                      0
                    );

                    return (
                      <tr
                        key={customer.id}
                        className="hover:bg-revnu-dark/30 transition"
                      >
                        <td className="px-6 py-4">
                          <div className="font-bold text-white">
                            {customer.firstName} {customer.lastName}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-revnu-gray">
                          <div>{customer.email || "—"}</div>
                          <div>{customer.phone || "—"}</div>
                        </td>
                        <td className="px-6 py-4">
                          {customer.smsOptedOut ? (
                            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-bold bg-red-500/20 text-red-400 border border-red-500/30">
                              Opted Out
                            </span>
                          ) : customer.smsConsentGiven ? (
                            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-bold bg-revnu-green/20 text-revnu-green border border-revnu-green/30">
                              SMS OK
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-bold bg-gray-500/20 text-gray-400 border border-gray-500/30">
                              No Consent
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 font-bold text-white">
                          {customer.invoices.length}
                        </td>
                        <td className="px-6 py-4 font-black text-revnu-green">
                          ${(totalOwed / 100).toLocaleString()}
                        </td>
                        <td className="px-6 py-4">
                          <Link
                            href={`/dashboard/customers/${customer.id}`}
                            className="text-sm font-bold text-revnu-green hover:text-revnu-greenLight"
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden divide-y divide-revnu-green/10">
              {filteredAndSortedCustomers.map((customer) => {
                const totalOwed = customer.invoices.reduce(
                  (sum, inv) => sum + inv.amountRemaining,
                  0
                );

                return (
                  <Link
                    key={customer.id}
                    href={`/dashboard/customers/${customer.id}`}
                    className="block p-4 active:bg-revnu-dark/30 transition"
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-black text-white text-base">
                          {customer.firstName} {customer.lastName}
                        </h3>
                        <p className="text-xs text-revnu-gray mt-1">
                          {customer.email || customer.phone || "No contact info"}
                        </p>
                      </div>
                      <div className="flex-shrink-0">
                        {customer.smsOptedOut ? (
                          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-bold bg-red-500/20 text-red-400 border border-red-500/30">
                            Opted Out
                          </span>
                        ) : customer.smsConsentGiven ? (
                          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-bold bg-revnu-green/20 text-revnu-green border border-revnu-green/30">
                            SMS OK
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-bold bg-gray-500/20 text-gray-400 border border-gray-500/30">
                            No Consent
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-revnu-dark/50 p-3 rounded border border-revnu-green/10">
                        <div className="text-xs text-revnu-gray font-bold uppercase tracking-wide mb-1">
                          Invoices
                        </div>
                        <div className="text-lg font-black text-white">
                          {customer.invoices.length}
                        </div>
                      </div>
                      <div className="bg-revnu-dark/50 p-3 rounded border border-revnu-green/10">
                        <div className="text-xs text-revnu-gray font-bold uppercase tracking-wide mb-1">
                          Total Owed
                        </div>
                        <div className="text-lg font-black text-revnu-green">
                          ${(totalOwed / 100).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
