"use client";

import Link from "next/link";
import { MessageSquare, CheckCircle, XCircle, TrendingUp } from "lucide-react";

export interface CommunicationsStat {
  total: number;
  sent: number;
  delivered: number;
  failed: number;
  smsCount: number;
  emailCount: number;
  deliveryRate: number;
}

interface CommunicationsActivityWidgetProps {
  stats: CommunicationsStat;
  maxItems?: number;
}

export default function CommunicationsActivityWidget({
  stats,
  maxItems = 10,
}: CommunicationsActivityWidgetProps) {
  const hasFailures = stats.failed > 0;
  const highFailureRate = stats.total > 0 && (stats.failed / stats.total) > 0.05; // >5% failure rate

  return (
    <div className="space-y-4">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Total Sent */}
        <div className="bg-revnu-dark/50 p-4 rounded-lg border border-revnu-green/20">
          <div className="flex items-center gap-2 mb-2">
            <MessageSquare className="w-4 h-4 text-revnu-green" />
            <span className="text-xs text-revnu-gray font-bold uppercase">Sent</span>
          </div>
          <div className="text-2xl font-black text-white">{stats.total}</div>
          <div className="text-xs text-revnu-gray mt-1">Last 30 days</div>
        </div>

        {/* Delivery Rate */}
        <div className="bg-revnu-dark/50 p-4 rounded-lg border border-revnu-green/20">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-revnu-green" />
            <span className="text-xs text-revnu-gray font-bold uppercase">Delivery Rate</span>
          </div>
          <div className={`text-2xl font-black ${
            stats.deliveryRate >= 95 ? "text-revnu-green" :
            stats.deliveryRate >= 85 ? "text-amber-400" :
            "text-red-400"
          }`}>
            {stats.deliveryRate.toFixed(1)}%
          </div>
          <div className="text-xs text-revnu-gray mt-1">
            {stats.delivered} delivered
          </div>
        </div>
      </div>

      {/* Channel Breakdown */}
      <div className="bg-revnu-dark/30 p-3 rounded-lg">
        <div className="text-xs text-revnu-gray font-bold uppercase mb-2">By Channel</div>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-white">SMS</span>
            <span className="text-sm font-bold text-revnu-green">{stats.smsCount}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-white">Email</span>
            <span className="text-sm font-bold text-revnu-green">{stats.emailCount}</span>
          </div>
        </div>
      </div>

      {/* Failure Alert */}
      {hasFailures && (
        <div className={`p-3 rounded-lg border ${
          highFailureRate
            ? "bg-red-500/10 border-red-500/30"
            : "bg-amber-500/10 border-amber-500/30"
        }`}>
          <div className="flex items-center gap-2 mb-1">
            <XCircle className={`w-4 h-4 ${highFailureRate ? "text-red-400" : "text-amber-400"}`} />
            <span className={`text-sm font-bold ${highFailureRate ? "text-red-400" : "text-amber-400"}`}>
              {stats.failed} Failed
            </span>
          </div>
          <p className="text-xs text-revnu-gray">
            {highFailureRate
              ? "High failure rate - check invalid contacts"
              : "Some messages failed to deliver"}
          </p>
        </div>
      )}

      {/* No Data State */}
      {stats.total === 0 && (
        <div className="text-center py-6 text-revnu-gray text-sm">
          <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>No messages sent yet</p>
          <p className="text-xs mt-1">Activate sequences to start tracking</p>
        </div>
      )}

      {/* View All Link */}
      {stats.total > 0 && (
        <Link
          href="/dashboard/communications"
          className="block text-center py-2 text-sm font-bold text-revnu-green hover:text-revnu-greenLight transition"
        >
          View All Communications →
        </Link>
      )}
    </div>
  );
}
