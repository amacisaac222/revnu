"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Shield, AlertTriangle, Download, CheckCircle, Clock, XCircle, ChevronLeft } from "lucide-react";

interface LienData {
  invoiceId: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  description: string | null;
  amountDue: number;
  amountRemaining: number;
  status: string;
  customerId: string;
  customerName: string;
  customerEmail: string | null;
  customerPhone: string | null;
  propertyAddress: string | null;
  propertyCity: string | null;
  propertyState: string | null;
  propertyZip: string | null;
  firstWorkDate: string | null;
  lastWorkDate: string | null;
  preliminaryNoticeSent: boolean;
  preliminaryNoticeSentAt: string | null;
  lienFiled: boolean;
  lienFiledAt: string | null;
  lienFilingReference: string | null;
  lienFilingDeadline: string | null;
  daysUntilDeadline: number;
  warningLevel: "green" | "yellow" | "red";
  preliminaryNoticeRequired: boolean;
  preliminaryNoticeDeadline: string | null;
}

interface Summary {
  total: number;
  urgent: number;
  upcoming: number;
  safe: number;
  totalAmountAtRisk: number;
  urgentAmountAtRisk: number;
  byState: Array<{
    state: string;
    count: number;
    totalAmount: number;
    urgent: number;
  }>;
}

export default function LienReportPage() {
  const [liens, setLiens] = useState<LienData[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "urgent" | "upcoming">("all");
  const [sortBy, setSortBy] = useState<"deadline" | "amount" | "customer">("deadline");

  useEffect(() => {
    fetchLienData();
  }, []);

  const fetchLienData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/reports/liens");
      const data = await res.json();
      setLiens(data.liens);
      setSummary(data.summary);
    } catch (error) {
      console.error("Error fetching lien data:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredLiens = liens.filter((lien) => {
    if (filter === "urgent") return lien.daysUntilDeadline <= 14;
    if (filter === "upcoming")
      return lien.daysUntilDeadline > 14 && lien.daysUntilDeadline <= 30;
    return true;
  });

  const sortedLiens = [...filteredLiens].sort((a, b) => {
    if (sortBy === "deadline") return a.daysUntilDeadline - b.daysUntilDeadline;
    if (sortBy === "amount") return b.amountRemaining - a.amountRemaining;
    if (sortBy === "customer") return a.customerName.localeCompare(b.customerName);
    return 0;
  });

  const handleExport = () => {
    const csv = [
      [
        "Invoice",
        "Customer",
        "State",
        "Amount Remaining",
        "Work Completion",
        "Filing Deadline",
        "Days Until Deadline",
        "Warning",
        "Preliminary Notice",
        "Lien Filed",
      ].join(","),
      ...sortedLiens.map((lien) =>
        [
          lien.invoiceNumber,
          `"${lien.customerName}"`,
          lien.propertyState,
          (lien.amountRemaining / 100).toFixed(2),
          lien.lastWorkDate
            ? new Date(lien.lastWorkDate).toLocaleDateString()
            : "",
          lien.lienFilingDeadline
            ? new Date(lien.lienFilingDeadline).toLocaleDateString()
            : "",
          lien.daysUntilDeadline,
          lien.warningLevel,
          lien.preliminaryNoticeSent ? "Yes" : "No",
          lien.lienFiled ? "Yes" : "No",
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `lien-report-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="text-center py-12 text-revnu-gray">Loading lien report...</div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Link
        href="/dashboard/reports"
        className="inline-flex items-center gap-2 text-sm text-revnu-gray hover:text-revnu-green transition"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to Reports
      </Link>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-white">
            Mechanics Lien Report
          </h1>
          <p className="text-sm md:text-base text-revnu-gray mt-1">
            Track filing deadlines and protect your payment rights
          </p>
        </div>
        {liens.length > 0 && (
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-revnu-green text-revnu-dark font-black rounded-lg hover:bg-revnu-greenLight transition flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        )}
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-revnu-slate/40 p-6 rounded-xl border border-revnu-green/20">
            <div className="text-xs text-revnu-gray font-bold uppercase tracking-wide mb-1">
              Total Liens
            </div>
            <div className="text-3xl font-black text-white">{summary.total}</div>
            <div className="text-sm text-revnu-gray mt-1">
              ${(summary.totalAmountAtRisk / 100).toLocaleString()} at risk
            </div>
          </div>

          <div className={`p-6 rounded-xl border-2 ${
            summary.urgent > 0
              ? "bg-red-500/10 border-red-500/50"
              : "bg-revnu-slate/40 border-revnu-green/20"
          }`}>
            <div className="text-xs text-revnu-gray font-bold uppercase tracking-wide mb-1">
              Urgent (&lt;14 days)
            </div>
            <div className={`text-3xl font-black ${
              summary.urgent > 0 ? "text-red-400" : "text-white"
            }`}>
              {summary.urgent}
            </div>
            <div className="text-sm text-revnu-gray mt-1">
              ${(summary.urgentAmountAtRisk / 100).toLocaleString()}
            </div>
          </div>

          <div className="bg-revnu-slate/40 p-6 rounded-xl border border-revnu-green/20">
            <div className="text-xs text-revnu-gray font-bold uppercase tracking-wide mb-1">
              Upcoming (14-30 days)
            </div>
            <div className="text-3xl font-black text-amber-400">
              {summary.upcoming}
            </div>
          </div>

          <div className="bg-revnu-slate/40 p-6 rounded-xl border border-revnu-green/20">
            <div className="text-xs text-revnu-gray font-bold uppercase tracking-wide mb-1">
              Safe (&gt;30 days)
            </div>
            <div className="text-3xl font-black text-revnu-green">
              {summary.safe}
            </div>
          </div>
        </div>
      )}

      {/* State Breakdown */}
      {summary && summary.byState.length > 0 && (
        <div className="bg-revnu-slate/40 p-6 rounded-xl border border-revnu-green/20">
          <h3 className="text-lg font-bold text-white mb-4">By State</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {summary.byState.map((state) => (
              <div
                key={state.state}
                className="bg-revnu-dark/30 p-3 rounded-lg"
              >
                <div className="text-sm font-bold text-white mb-1">
                  {state.state}
                </div>
                <div className="text-xs text-revnu-gray">
                  {state.count} liens • {state.urgent} urgent
                </div>
                <div className="text-xs text-revnu-gray">
                  ${(state.totalAmount / 100).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      {liens.length > 0 && (
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex gap-2">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2 rounded-lg font-bold transition ${
                filter === "all"
                  ? "bg-revnu-green text-revnu-dark"
                  : "bg-revnu-slate/40 text-white border border-revnu-green/20 hover:border-revnu-green"
              }`}
            >
              All ({liens.length})
            </button>
            <button
              onClick={() => setFilter("urgent")}
              className={`px-4 py-2 rounded-lg font-bold transition ${
                filter === "urgent"
                  ? "bg-red-500 text-white"
                  : "bg-revnu-slate/40 text-white border border-revnu-green/20 hover:border-revnu-green"
              }`}
            >
              Urgent ({summary?.urgent || 0})
            </button>
            <button
              onClick={() => setFilter("upcoming")}
              className={`px-4 py-2 rounded-lg font-bold transition ${
                filter === "upcoming"
                  ? "bg-amber-500 text-white"
                  : "bg-revnu-slate/40 text-white border border-revnu-green/20 hover:border-revnu-green"
              }`}
            >
              Upcoming ({summary?.upcoming || 0})
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-revnu-gray">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 bg-revnu-dark border border-revnu-green/20 rounded-lg text-white text-sm focus:outline-none focus:border-revnu-green"
            >
              <option value="deadline">Deadline</option>
              <option value="amount">Amount</option>
              <option value="customer">Customer</option>
            </select>
          </div>
        </div>
      )}

      {/* Table */}
      {sortedLiens.length === 0 ? (
        <div className="bg-revnu-slate/40 p-12 rounded-xl border border-revnu-green/20 text-center">
          <Shield className="w-16 h-16 mx-auto mb-4 text-revnu-gray opacity-50" />
          <h3 className="text-lg font-bold text-white mb-2">
            No Lien-Eligible Invoices
          </h3>
          <p className="text-revnu-gray">
            {filter === "all"
              ? "Invoices with mechanics lien protection will appear here"
              : "No invoices match the selected filter"}
          </p>
        </div>
      ) : (
        <div className="bg-revnu-slate/40 rounded-xl border border-revnu-green/20 overflow-hidden">
          {/* Desktop View */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-revnu-dark/50 border-b border-revnu-green/20">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-bold text-revnu-gray uppercase">
                    Invoice
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-revnu-gray uppercase">
                    Customer
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-revnu-gray uppercase">
                    State
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-revnu-gray uppercase">
                    Amount
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-revnu-gray uppercase">
                    Deadline
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-bold text-revnu-gray uppercase">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-revnu-green/10">
                {sortedLiens.map((lien) => (
                  <tr
                    key={lien.invoiceId}
                    className="hover:bg-revnu-dark/30 transition"
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/dashboard/invoices/${lien.invoiceId}`}
                        className="font-bold text-white hover:text-revnu-green"
                      >
                        {lien.invoiceNumber}
                      </Link>
                      <div className="text-xs text-revnu-gray truncate max-w-[150px]">
                        {lien.description || "No description"}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/dashboard/customers/${lien.customerId}`}
                        className="text-white hover:text-revnu-green"
                      >
                        {lien.customerName}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-white font-semibold">
                      {lien.propertyState}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-white">
                      ${(lien.amountRemaining / 100).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <div
                        className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg ${
                          lien.warningLevel === "red"
                            ? "bg-red-500/20 text-red-400"
                            : lien.warningLevel === "yellow"
                            ? "bg-amber-500/20 text-amber-400"
                            : "bg-revnu-green/20 text-revnu-green"
                        }`}
                      >
                        <Clock className="w-3 h-3" />
                        <span className="text-sm font-bold">
                          {lien.daysUntilDeadline} days
                        </span>
                      </div>
                      {lien.lienFilingDeadline && (
                        <div className="text-xs text-revnu-gray mt-1">
                          {new Date(lien.lienFilingDeadline).toLocaleDateString()}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        {lien.preliminaryNoticeSent ? (
                          <CheckCircle className="w-4 h-4 text-revnu-green" title="Notice sent" />
                        ) : lien.preliminaryNoticeRequired ? (
                          <XCircle className="w-4 h-4 text-amber-400" title="Notice required" />
                        ) : (
                          <span className="text-xs text-revnu-gray">N/A</span>
                        )}
                        {lien.lienFiled ? (
                          <Shield className="w-4 h-4 text-revnu-green" title="Lien filed" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-amber-400" title="Not filed" />
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile View */}
          <div className="lg:hidden divide-y divide-revnu-green/10">
            {sortedLiens.map((lien) => (
              <div key={lien.invoiceId} className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <Link
                      href={`/dashboard/invoices/${lien.invoiceId}`}
                      className="font-bold text-white hover:text-revnu-green text-base"
                    >
                      {lien.invoiceNumber}
                    </Link>
                    <Link
                      href={`/dashboard/customers/${lien.customerId}`}
                      className="text-sm text-revnu-gray hover:text-revnu-green block mt-1"
                    >
                      {lien.customerName}
                    </Link>
                  </div>
                  <div
                    className={`px-3 py-1 rounded-lg text-sm font-bold ${
                      lien.warningLevel === "red"
                        ? "bg-red-500/20 text-red-400"
                        : lien.warningLevel === "yellow"
                        ? "bg-amber-500/20 text-amber-400"
                        : "bg-revnu-green/20 text-revnu-green"
                    }`}
                  >
                    {lien.daysUntilDeadline}d
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-revnu-gray">State:</span>{" "}
                    <span className="text-white font-semibold">
                      {lien.propertyState}
                    </span>
                  </div>
                  <div>
                    <span className="text-revnu-gray">Amount:</span>{" "}
                    <span className="text-white font-bold">
                      ${(lien.amountRemaining / 100).toLocaleString()}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-revnu-gray">Deadline:</span>{" "}
                    <span className="text-white">
                      {lien.lienFilingDeadline
                        ? new Date(lien.lienFilingDeadline).toLocaleDateString()
                        : "Not set"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 mt-3 pt-3 border-t border-revnu-green/10">
                  <div className="flex items-center gap-1 text-xs">
                    {lien.preliminaryNoticeSent ? (
                      <>
                        <CheckCircle className="w-3 h-3 text-revnu-green" />
                        <span className="text-revnu-green">Notice Sent</span>
                      </>
                    ) : lien.preliminaryNoticeRequired ? (
                      <>
                        <XCircle className="w-3 h-3 text-amber-400" />
                        <span className="text-amber-400">Notice Needed</span>
                      </>
                    ) : null}
                  </div>
                  <div className="flex items-center gap-1 text-xs">
                    {lien.lienFiled ? (
                      <>
                        <Shield className="w-3 h-3 text-revnu-green" />
                        <span className="text-revnu-green">Filed</span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="w-3 h-3 text-amber-400" />
                        <span className="text-amber-400">Not Filed</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
