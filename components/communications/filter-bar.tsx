"use client";

import { useState } from "react";

interface FilterBarProps {
  customers: Array<{ id: string; firstName: string; lastName: string }>;
  onFilterChange: (filters: {
    customerId?: string;
    channel?: string;
    status?: string;
    direction?: string;
    dateFrom?: string;
    dateTo?: string;
    search?: string;
  }) => void;
  onExport: () => void;
  isExporting?: boolean;
}

export default function FilterBar({
  customers,
  onFilterChange,
  onExport,
  isExporting = false,
}: FilterBarProps) {
  const [customerId, setCustomerId] = useState("");
  const [channel, setChannel] = useState("");
  const [status, setStatus] = useState("");
  const [direction, setDirection] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const handleApplyFilters = () => {
    const filters: any = {};
    if (customerId) filters.customerId = customerId;
    if (channel) filters.channel = channel;
    if (status) filters.status = status;
    if (direction) filters.direction = direction;
    if (dateFrom) filters.dateFrom = dateFrom;
    if (dateTo) filters.dateTo = dateTo;
    if (search) filters.search = search;
    onFilterChange(filters);
  };

  const handleClearFilters = () => {
    setCustomerId("");
    setChannel("");
    setStatus("");
    setDirection("");
    setDateFrom("");
    setDateTo("");
    setSearch("");
    onFilterChange({});
  };

  const hasActiveFilters =
    customerId || channel || status || direction || dateFrom || dateTo || search;

  return (
    <div className="bg-revnu-slate/40 rounded-xl border border-revnu-green/20 p-4">
      {/* Search Bar - Always visible */}
      <div className="flex flex-col md:flex-row gap-3 mb-3">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search messages..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleApplyFilters()}
            className="w-full px-4 py-2 bg-revnu-dark border border-revnu-green/20 rounded-lg text-white placeholder-revnu-gray focus:outline-none focus:border-revnu-green"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-2 bg-revnu-dark border border-revnu-green/20 rounded-lg text-white font-bold hover:border-revnu-green transition whitespace-nowrap"
          >
            {showFilters ? "Hide" : "Show"} Filters
            {hasActiveFilters && (
              <span className="ml-2 px-2 py-0.5 bg-revnu-green/20 text-revnu-green text-xs rounded-full">
                {[customerId, channel, status, direction, dateFrom, dateTo, search]
                  .filter(Boolean).length}
              </span>
            )}
          </button>
          <button
            onClick={onExport}
            disabled={isExporting}
            className="px-4 py-2 bg-revnu-green text-revnu-dark font-black rounded-lg hover:bg-revnu-greenLight transition disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          >
            {isExporting ? "Exporting..." : "📥 Export CSV"}
          </button>
        </div>
      </div>

      {/* Advanced Filters - Collapsible */}
      {showFilters && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-3 border-t border-revnu-green/10">
          {/* Customer Filter */}
          <div>
            <label className="block text-xs text-revnu-gray font-bold uppercase tracking-wide mb-1">
              Customer
            </label>
            <select
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              className="w-full px-3 py-2 bg-revnu-dark border border-revnu-green/20 rounded-lg text-white focus:outline-none focus:border-revnu-green text-sm"
            >
              <option value="">All Customers</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.firstName} {c.lastName}
                </option>
              ))}
            </select>
          </div>

          {/* Channel Filter */}
          <div>
            <label className="block text-xs text-revnu-gray font-bold uppercase tracking-wide mb-1">
              Channel
            </label>
            <select
              value={channel}
              onChange={(e) => setChannel(e.target.value)}
              className="w-full px-3 py-2 bg-revnu-dark border border-revnu-green/20 rounded-lg text-white focus:outline-none focus:border-revnu-green text-sm"
            >
              <option value="">All Channels</option>
              <option value="sms">SMS</option>
              <option value="email">Email</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-xs text-revnu-gray font-bold uppercase tracking-wide mb-1">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 bg-revnu-dark border border-revnu-green/20 rounded-lg text-white focus:outline-none focus:border-revnu-green text-sm"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="sent">Sent</option>
              <option value="delivered">Delivered</option>
              <option value="failed">Failed</option>
              <option value="bounced">Bounced</option>
            </select>
          </div>

          {/* Direction Filter */}
          <div>
            <label className="block text-xs text-revnu-gray font-bold uppercase tracking-wide mb-1">
              Direction
            </label>
            <select
              value={direction}
              onChange={(e) => setDirection(e.target.value)}
              className="w-full px-3 py-2 bg-revnu-dark border border-revnu-green/20 rounded-lg text-white focus:outline-none focus:border-revnu-green text-sm"
            >
              <option value="">All Directions</option>
              <option value="outbound">Outbound</option>
              <option value="inbound">Inbound</option>
            </select>
          </div>

          {/* Date From */}
          <div>
            <label className="block text-xs text-revnu-gray font-bold uppercase tracking-wide mb-1">
              Date From
            </label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full px-3 py-2 bg-revnu-dark border border-revnu-green/20 rounded-lg text-white focus:outline-none focus:border-revnu-green text-sm"
            />
          </div>

          {/* Date To */}
          <div>
            <label className="block text-xs text-revnu-gray font-bold uppercase tracking-wide mb-1">
              Date To
            </label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full px-3 py-2 bg-revnu-dark border border-revnu-green/20 rounded-lg text-white focus:outline-none focus:border-revnu-green text-sm"
            />
          </div>

          {/* Filter Actions */}
          <div className="md:col-span-2 lg:col-span-3 flex gap-3 pt-3">
            <button
              onClick={handleApplyFilters}
              className="px-6 py-2 bg-revnu-green text-revnu-dark font-black rounded-lg hover:bg-revnu-greenLight transition"
            >
              Apply Filters
            </button>
            {hasActiveFilters && (
              <button
                onClick={handleClearFilters}
                className="px-6 py-2 bg-revnu-dark border border-revnu-green/20 text-white font-bold rounded-lg hover:border-revnu-green transition"
              >
                Clear All
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
