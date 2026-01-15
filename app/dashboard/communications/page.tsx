"use client";

import { useState, useEffect } from "react";
import FilterBar from "@/components/communications/filter-bar";
import MessageDetailModal from "@/components/communications/message-detail-modal";

interface Message {
  id: string;
  createdAt: string;
  channel: string;
  direction: string;
  status: string;
  subject: string | null;
  body: string;
  sentAt: string | null;
  deliveredAt: string | null;
  failedAt: string | null;
  errorMessage: string | null;
  sentFromNumber: string | null;
  sentFromEmail: string | null;
  isAutomated: boolean;
  customer: {
    id: string;
    firstName: string;
    lastName: string;
    email: string | null;
    phone: string | null;
  };
  invoice: {
    id: string;
    invoiceNumber: string;
    amountDue: number;
    amountRemaining: number;
  } | null;
}

interface Stats {
  total: number;
  sent: number;
  delivered: number;
  failed: number;
  pending: number;
}

export default function CommunicationsPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    sent: 0,
    delivered: 0,
    failed: 0,
    pending: 0,
  });
  const [customers, setCustomers] = useState<
    Array<{ id: string; firstName: string; lastName: string }>
  >([]);
  const [filters, setFilters] = useState<any>({});
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  // Fetch customers for filter dropdown
  useEffect(() => {
    fetch("/api/customers")
      .then((res) => res.json())
      .then((data) => setCustomers(data))
      .catch((err) => console.error("Error fetching customers:", err));
  }, []);

  // Fetch messages
  const fetchMessages = async (cursor?: string, append = false) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (cursor) params.set("cursor", cursor);
      if (filters.customerId) params.set("customerId", filters.customerId);
      if (filters.channel) params.set("channel", filters.channel);
      if (filters.status) params.set("status", filters.status);
      if (filters.direction) params.set("direction", filters.direction);
      if (filters.dateFrom) params.set("dateFrom", filters.dateFrom);
      if (filters.dateTo) params.set("dateTo", filters.dateTo);
      if (filters.search) params.set("search", filters.search);

      const res = await fetch(`/api/communications?${params.toString()}`);
      const data = await res.json();

      if (append) {
        setMessages((prev) => [...prev, ...data.messages]);
      } else {
        setMessages(data.messages);
      }

      setStats(data.stats);
      setNextCursor(data.pagination.nextCursor);
      setHasNextPage(data.pagination.hasNextPage);
    } catch (error) {
      console.error("Error fetching communications:", error);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchMessages();
  }, []);

  // Handle filter changes
  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
    setMessages([]); // Clear current messages
    setNextCursor(null);
    // Fetch with new filters (no cursor = start from beginning)
    const params = new URLSearchParams();
    if (newFilters.customerId) params.set("customerId", newFilters.customerId);
    if (newFilters.channel) params.set("channel", newFilters.channel);
    if (newFilters.status) params.set("status", newFilters.status);
    if (newFilters.direction) params.set("direction", newFilters.direction);
    if (newFilters.dateFrom) params.set("dateFrom", newFilters.dateFrom);
    if (newFilters.dateTo) params.set("dateTo", newFilters.dateTo);
    if (newFilters.search) params.set("search", newFilters.search);

    fetch(`/api/communications?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        setMessages(data.messages);
        setStats(data.stats);
        setNextCursor(data.pagination.nextCursor);
        setHasNextPage(data.pagination.hasNextPage);
      })
      .catch((err) => console.error("Error applying filters:", err));
  };

  // Handle export
  const handleExport = async () => {
    try {
      setIsExporting(true);
      const params = new URLSearchParams();
      if (filters.customerId) params.set("customerId", filters.customerId);
      if (filters.channel) params.set("channel", filters.channel);
      if (filters.status) params.set("status", filters.status);
      if (filters.direction) params.set("direction", filters.direction);
      if (filters.dateFrom) params.set("dateFrom", filters.dateFrom);
      if (filters.dateTo) params.set("dateTo", filters.dateTo);
      if (filters.search) params.set("search", filters.search);

      const res = await fetch(`/api/communications/export?${params.toString()}`);
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `revnu-communications-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exporting communications:", error);
      alert("Failed to export communications. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  const statusColors = {
    sent: "bg-revnu-green/20 text-revnu-green border-revnu-green/30",
    delivered: "bg-revnu-green/20 text-revnu-green border-revnu-green/30",
    failed: "bg-red-500/20 text-red-400 border-red-500/30",
    pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    queued: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    bounced: "bg-red-500/20 text-red-400 border-red-500/30",
  };

  return (
    <div className="space-y-6 md:space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-black text-white">
          Communications
        </h1>
        <p className="text-sm md:text-base text-revnu-gray mt-1">
          View, search, and export all customer communications
        </p>
      </div>

      {/* Stats - Mobile optimized */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-revnu-slate/40 p-4 md:p-6 rounded-xl border border-revnu-green/20">
          <div className="text-xs text-revnu-gray font-bold uppercase tracking-wide mb-1">
            Total
          </div>
          <div className="text-2xl md:text-3xl font-black text-white">
            {stats.total}
          </div>
        </div>
        <div className="bg-revnu-slate/40 p-4 md:p-6 rounded-xl border border-revnu-green/20">
          <div className="text-xs text-revnu-gray font-bold uppercase tracking-wide mb-1">
            Sent
          </div>
          <div className="text-2xl md:text-3xl font-black text-revnu-green">
            {stats.sent}
          </div>
        </div>
        <div className="bg-revnu-slate/40 p-4 md:p-6 rounded-xl border border-revnu-green/20">
          <div className="text-xs text-revnu-gray font-bold uppercase tracking-wide mb-1">
            Delivered
          </div>
          <div className="text-2xl md:text-3xl font-black text-revnu-green">
            {stats.delivered}
          </div>
        </div>
        <div className="bg-revnu-slate/40 p-4 md:p-6 rounded-xl border border-revnu-green/20">
          <div className="text-xs text-revnu-gray font-bold uppercase tracking-wide mb-1">
            Failed
          </div>
          <div className="text-2xl md:text-3xl font-black text-red-400">
            {stats.failed}
          </div>
        </div>
        <div className="bg-revnu-slate/40 p-4 md:p-6 rounded-xl border border-revnu-green/20">
          <div className="text-xs text-revnu-gray font-bold uppercase tracking-wide mb-1">
            Pending
          </div>
          <div className="text-2xl md:text-3xl font-black text-yellow-400">
            {stats.pending}
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <FilterBar
        customers={customers}
        onFilterChange={handleFilterChange}
        onExport={handleExport}
        isExporting={isExporting}
      />

      {/* Messages List */}
      <div className="bg-revnu-slate/40 rounded-xl border border-revnu-green/20">
        {loading && messages.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-lg font-bold text-white mb-2">
              Loading communications...
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="p-12 text-center">
            <h3 className="text-lg font-bold text-white mb-2">
              No messages found
            </h3>
            <p className="text-revnu-gray">
              {Object.keys(filters).length > 0
                ? "Try adjusting your filters"
                : "Messages will appear here when you activate payment sequences"}
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden lg:block">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-revnu-dark/50 border-b border-revnu-green/20">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-bold text-revnu-gray uppercase tracking-wide">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-revnu-gray uppercase tracking-wide">
                        Customer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-revnu-gray uppercase tracking-wide">
                        Invoice
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-revnu-gray uppercase tracking-wide">
                        Channel
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-revnu-gray uppercase tracking-wide">
                        Direction
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-revnu-gray uppercase tracking-wide">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-revnu-gray uppercase tracking-wide">
                        Message
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-revnu-green/10">
                    {messages.map((message) => (
                      <tr
                        key={message.id}
                        onClick={() => setSelectedMessage(message)}
                        className="hover:bg-revnu-dark/30 transition cursor-pointer"
                      >
                        <td className="px-6 py-4 text-sm text-revnu-gray whitespace-nowrap">
                          {new Date(message.createdAt).toLocaleDateString(
                            undefined,
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            }
                          )}
                          <br />
                          <span className="text-xs">
                            {new Date(message.createdAt).toLocaleTimeString(
                              undefined,
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-bold text-white">
                          {message.customer.firstName}{" "}
                          {message.customer.lastName}
                        </td>
                        <td className="px-6 py-4 text-sm text-revnu-gray">
                          {message.invoice?.invoiceNumber || "-"}
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-bold bg-revnu-slate/40 text-white border border-revnu-green/10 uppercase">
                            {message.channel}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-revnu-gray capitalize">
                          {message.direction}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded text-xs font-bold border ${
                              statusColors[
                                message.status as keyof typeof statusColors
                              ] ||
                              "bg-revnu-slate/40 text-revnu-gray border-revnu-green/10"
                            }`}
                          >
                            {message.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-white max-w-md truncate">
                          {message.subject || message.body}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden divide-y divide-revnu-green/10">
              {messages.map((message) => (
                <div
                  key={message.id}
                  onClick={() => setSelectedMessage(message)}
                  className="p-4 active:bg-revnu-dark/30 transition cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="font-black text-white text-base">
                        {message.customer.firstName}{" "}
                        {message.customer.lastName}
                      </div>
                      <div className="text-sm text-revnu-gray mt-1">
                        {message.invoice?.invoiceNumber || "No invoice"}
                      </div>
                      <div className="text-xs text-revnu-gray mt-1">
                        {new Date(message.createdAt).toLocaleDateString(
                          undefined,
                          {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </div>
                    </div>
                    <div className="flex-shrink-0 text-right space-y-1">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded text-xs font-bold border ${
                          statusColors[
                            message.status as keyof typeof statusColors
                          ] ||
                          "bg-revnu-slate/40 text-revnu-gray border-revnu-green/10"
                        }`}
                      >
                        {message.status}
                      </span>
                      <div>
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-bold bg-revnu-slate/40 text-white border border-revnu-green/10 uppercase">
                          {message.channel}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-revnu-dark/50 p-3 rounded border border-revnu-green/10">
                    <div className="text-xs text-revnu-gray font-bold uppercase tracking-wide mb-2">
                      Message
                    </div>
                    <div className="text-sm text-white line-clamp-3">
                      {message.subject && (
                        <div className="font-bold mb-1">{message.subject}</div>
                      )}
                      {message.body}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Load More Button */}
            {hasNextPage && (
              <div className="p-6 text-center border-t border-revnu-green/10">
                <button
                  onClick={() => fetchMessages(nextCursor!, true)}
                  disabled={loading}
                  className="px-6 py-3 bg-revnu-green text-revnu-dark font-black rounded-lg hover:bg-revnu-greenLight transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Loading..." : "Load More"}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Message Detail Modal */}
      {selectedMessage && (
        <MessageDetailModal
          message={selectedMessage}
          onClose={() => setSelectedMessage(null)}
        />
      )}
    </div>
  );
}
