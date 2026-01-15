"use client";

import Link from "next/link";
import { Shield, AlertTriangle, Clock, CheckCircle } from "lucide-react";

export interface LienAlert {
  invoiceId: string;
  invoiceNumber: string;
  customerName: string;
  amountRemaining: number;
  lienFilingDeadline: Date;
  daysUntilDeadline: number;
  warningLevel: "green" | "yellow" | "red";
  state: string;
  preliminaryNoticeSent: boolean;
  lienFiled: boolean;
}

interface LienAlertsWidgetProps {
  alerts: LienAlert[];
  maxItems?: number;
}

export default function LienAlertsWidget({
  alerts,
  maxItems = 3,
}: LienAlertsWidgetProps) {
  const urgentAlerts = alerts.filter(a => a.daysUntilDeadline <= 14);
  const upcomingAlerts = alerts.filter(a => a.daysUntilDeadline > 14 && a.daysUntilDeadline <= 30);

  const displayAlerts = alerts
    .sort((a, b) => a.daysUntilDeadline - b.daysUntilDeadline)
    .slice(0, maxItems);

  return (
    <div className="space-y-4">
      {/* Alert Summary */}
      <div className="grid grid-cols-2 gap-3">
        {/* Urgent Count */}
        <div className={`p-4 rounded-lg border-2 ${
          urgentAlerts.length > 0
            ? "bg-red-500/10 border-red-500/50"
            : "bg-revnu-dark/50 border-revnu-green/20"
        }`}>
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className={`w-4 h-4 ${
              urgentAlerts.length > 0 ? "text-red-400" : "text-revnu-gray"
            }`} />
            <span className="text-xs text-revnu-gray font-bold uppercase">Urgent</span>
          </div>
          <div className={`text-2xl font-black ${
            urgentAlerts.length > 0 ? "text-red-400" : "text-white"
          }`}>
            {urgentAlerts.length}
          </div>
          <div className="text-xs text-revnu-gray mt-1">&lt;14 days left</div>
        </div>

        {/* Upcoming Count */}
        <div className={`p-4 rounded-lg border ${
          upcomingAlerts.length > 0
            ? "bg-amber-500/10 border-amber-500/30"
            : "bg-revnu-dark/50 border-revnu-green/20"
        }`}>
          <div className="flex items-center gap-2 mb-2">
            <Clock className={`w-4 h-4 ${
              upcomingAlerts.length > 0 ? "text-amber-400" : "text-revnu-gray"
            }`} />
            <span className="text-xs text-revnu-gray font-bold uppercase">Upcoming</span>
          </div>
          <div className={`text-2xl font-black ${
            upcomingAlerts.length > 0 ? "text-amber-400" : "text-white"
          }`}>
            {upcomingAlerts.length}
          </div>
          <div className="text-xs text-revnu-gray mt-1">14-30 days</div>
        </div>
      </div>

      {/* Alert List */}
      {displayAlerts.length > 0 ? (
        <div className="space-y-2">
          <div className="text-xs text-revnu-gray font-bold uppercase mb-2">
            Most Urgent
          </div>
          {displayAlerts.map((alert) => (
            <Link
              key={alert.invoiceId}
              href={`/dashboard/invoices/${alert.invoiceId}`}
              className={`block p-3 rounded-lg border transition hover:scale-[1.02] ${
                alert.warningLevel === "red"
                  ? "bg-red-500/10 border-red-500/30 hover:bg-red-500/20"
                  : alert.warningLevel === "yellow"
                  ? "bg-amber-500/10 border-amber-500/30 hover:bg-amber-500/20"
                  : "bg-revnu-dark/30 border-revnu-green/20 hover:bg-revnu-dark/50"
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-white text-sm truncate">
                    {alert.customerName}
                  </div>
                  <div className="text-xs text-revnu-gray">
                    {alert.invoiceNumber} • {alert.state}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className={`text-lg font-black ${
                    alert.warningLevel === "red"
                      ? "text-red-400"
                      : alert.warningLevel === "yellow"
                      ? "text-amber-400"
                      : "text-revnu-green"
                  }`}>
                    {alert.daysUntilDeadline}
                  </div>
                  <div className="text-xs text-revnu-gray">days left</div>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-revnu-gray">
                  ${(alert.amountRemaining / 100).toLocaleString()}
                </span>
                <div className="flex items-center gap-2">
                  {alert.preliminaryNoticeSent && (
                    <span className="text-revnu-green flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      Notice
                    </span>
                  )}
                  {alert.lienFiled && (
                    <span className="text-revnu-green flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      Filed
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-6 text-revnu-gray text-sm">
          <Shield className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>No lien deadlines in next 30 days</p>
          <p className="text-xs mt-1">All invoices are protected</p>
        </div>
      )}

      {/* View All Link */}
      {alerts.length > 0 && (
        <Link
          href="/dashboard/reports/liens"
          className="block text-center py-2 text-sm font-bold text-revnu-green hover:text-revnu-greenLight transition"
        >
          View All Lien Alerts ({alerts.length}) →
        </Link>
      )}

      {/* Educational Note */}
      {alerts.length > 0 && (
        <div className="mt-2 p-3 bg-revnu-dark/30 rounded-lg border border-revnu-green/20">
          <p className="text-xs text-revnu-gray">
            <strong className="text-white">⚡ Quick Tip:</strong> Missing a lien filing deadline
            can eliminate your payment rights. File early to protect your money.
          </p>
        </div>
      )}
    </div>
  );
}
