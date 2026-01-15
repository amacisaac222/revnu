"use client";

import { useState, useEffect } from "react";
import DashboardGrid, { Widget } from "./dashboard-grid";
import WidgetContainer, { WidgetSize } from "./widgets/widget-container";
import StatsWidget, { StatCard } from "./widgets/stats-widget";
import CollectionTrendsChart from "./collection-trends-chart";
import WidgetLibraryModal, { AvailableWidget } from "./widget-library-modal";
import RecentActivityWidget, { ActivityItem } from "./widgets/recent-activity-widget";
import PaymentMethodsWidget, { PaymentMethodStat } from "./widgets/payment-methods-widget";
import CollectionCalendarWidget, { CalendarEvent } from "./widgets/collection-calendar-widget";
import CommunicationsActivityWidget, { CommunicationsStat } from "./widgets/communications-activity-widget";
import LienAlertsWidget, { LienAlert } from "./widgets/lien-alerts-widget";
import Link from "next/link";
import { Send } from "lucide-react";

interface DashboardOverviewProps {
  organizationId: string;
  stats: {
    totalRevenue: number;
    collectedAmount: number;
    outstandingAmount: number;
    collectionRate: number;
    totalCustomers: number;
  };
  collectionTrendsData: Array<{
    month: string;
    invoiced: number;
    collected: number;
    outstanding: number;
  }>;
  top10Accounts: Array<{
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    totalInvoiced: number;
    totalCollected: number;
    totalOwed: number;
    invoiceCount: number;
  }>;
  activeSequences: Array<{
    id: string;
    name: string;
    isActive: boolean;
    steps: any[];
    _count: { invoices: number };
  }>;
}

const DEFAULT_WIDGETS: Widget[] = [
  { id: "quick-actions", type: "quick-actions", size: "compact", visible: true },
  { id: "stats", type: "stats", size: "normal", visible: true },
  { id: "chart", type: "chart", size: "normal", visible: true },
  { id: "top-accounts", type: "top-accounts", size: "normal", visible: true },
  { id: "sequences", type: "sequences", size: "normal", visible: true },
];

export default function DashboardOverview({
  organizationId,
  stats,
  collectionTrendsData,
  top10Accounts,
  activeSequences,
}: DashboardOverviewProps) {
  const [widgets, setWidgets] = useState<Widget[]>(DEFAULT_WIDGETS);
  const [isLoading, setIsLoading] = useState(true);
  const [isWidgetLibraryOpen, setIsWidgetLibraryOpen] = useState(false);
  const [communicationsStats, setCommunicationsStats] = useState<CommunicationsStat | null>(null);
  const [lienAlerts, setLienAlerts] = useState<LienAlert[]>([]);

  useEffect(() => {
    loadLayout();
    loadCommunicationsStats();
    loadLienAlerts();
  }, []);

  const loadLayout = async () => {
    try {
      const response = await fetch("/api/dashboard/layout");
      if (response.ok) {
        const data = await response.json();
        if (data.dashboardLayout?.overview) {
          setWidgets(data.dashboardLayout.overview);
        }
      }
    } catch (error) {
      console.error("Failed to load layout:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveLayout = async (newWidgets: Widget[]) => {
    try {
      await fetch("/api/dashboard/layout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tab: "overview",
          widgets: newWidgets,
        }),
      });
    } catch (error) {
      console.error("Failed to save layout:", error);
    }
  };

  const loadCommunicationsStats = async () => {
    try {
      // Calculate date 30 days ago
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const response = await fetch(
        `/api/communications?dateFrom=${thirtyDaysAgo.toISOString()}`
      );
      if (response.ok) {
        const data = await response.json();
        const stats = data.stats || {};
        const messages = data.messages || [];

        // Count by channel
        const smsCount = messages.filter((m: any) => m.channel === "sms").length;
        const emailCount = messages.filter((m: any) => m.channel === "email").length;

        // Calculate delivery rate
        const total = stats.total || 0;
        const delivered = stats.delivered || 0;
        const deliveryRate = total > 0 ? (delivered / total) * 100 : 0;

        setCommunicationsStats({
          total,
          sent: stats.sent || 0,
          delivered,
          failed: stats.failed || 0,
          smsCount,
          emailCount,
          deliveryRate,
        });
      }
    } catch (error) {
      console.error("Failed to load communications stats:", error);
    }
  };

  const loadLienAlerts = async () => {
    try {
      const response = await fetch("/api/reports/liens");
      if (response.ok) {
        const data = await response.json();
        const liens = data.liens || [];

        // Filter to only show liens with deadlines in next 30 days
        const upcomingLiens = liens
          .filter((lien: any) => lien.daysUntilDeadline <= 30 && lien.daysUntilDeadline >= 0)
          .map((lien: any) => ({
            invoiceId: lien.invoiceId,
            invoiceNumber: lien.invoiceNumber,
            customerName: lien.customerName,
            amountRemaining: lien.amountRemaining,
            lienFilingDeadline: new Date(lien.lienFilingDeadline),
            daysUntilDeadline: lien.daysUntilDeadline,
            warningLevel: lien.warningLevel,
            state: lien.propertyState,
            preliminaryNoticeSent: lien.preliminaryNoticeSent,
            lienFiled: lien.lienFiled,
          }));

        setLienAlerts(upcomingLiens);
      }
    } catch (error) {
      console.error("Failed to load lien alerts:", error);
    }
  };

  const handleWidgetsChange = (newWidgets: Widget[]) => {
    setWidgets(newWidgets);
    saveLayout(newWidgets);
  };

  const handleSizeChange = (widgetId: string, size: WidgetSize) => {
    const newWidgets = widgets.map((w) =>
      w.id === widgetId ? { ...w, size } : w
    );
    handleWidgetsChange(newWidgets);
  };

  const handleToggleFullWidth = (widgetId: string) => {
    const newWidgets = widgets.map((w) =>
      w.id === widgetId ? { ...w, fullWidth: !w.fullWidth } : w
    );
    handleWidgetsChange(newWidgets);
  };

  const handleRemoveWidget = (widgetId: string) => {
    const newWidgets = widgets.map((w) =>
      w.id === widgetId ? { ...w, visible: false } : w
    );
    handleWidgetsChange(newWidgets);
  };

  const handleResetLayout = () => {
    setWidgets(DEFAULT_WIDGETS);
    saveLayout(DEFAULT_WIDGETS);
  };

  const handleAddWidget = () => {
    setIsWidgetLibraryOpen(true);
  };

  const handleAddWidgetFromLibrary = (availableWidget: AvailableWidget) => {
    // Check if widget with this type already exists
    const existingWidgetIndex = widgets.findIndex(w => w.type === availableWidget.type);

    if (existingWidgetIndex !== -1) {
      // If exists, make it visible
      const newWidgets = widgets.map((w, idx) =>
        idx === existingWidgetIndex
          ? { ...w, visible: true, size: availableWidget.defaultSize }
          : w
      );
      handleWidgetsChange(newWidgets);
    } else {
      // Add as new widget
      const newWidget: Widget = {
        id: availableWidget.id,
        type: availableWidget.type,
        size: availableWidget.defaultSize,
        visible: true,
      };
      handleWidgetsChange([...widgets, newWidget]);
    }
  };

  const statCards: StatCard[] = [
    {
      id: "revenue",
      label: "Total Revenue",
      value: `$${(stats.totalRevenue / 100).toLocaleString()}`,
      color: "green",
      link: "/dashboard/invoices",
    },
    {
      id: "collected",
      label: "Collected",
      value: `$${(stats.collectedAmount / 100).toLocaleString()}`,
      color: "emerald",
      link: "/dashboard/invoices?status=paid",
    },
    {
      id: "outstanding",
      label: "Outstanding",
      value: `$${(stats.outstandingAmount / 100).toLocaleString()}`,
      color: "amber",
      link: "/dashboard/invoices?status=outstanding",
    },
    {
      id: "rate",
      label: "Collection Rate",
      value: `${stats.collectionRate.toFixed(1)}%`,
    },
    {
      id: "customers",
      label: "Customers",
      value: `${stats.totalCustomers}`,
      link: "/dashboard/customers",
    },
  ];

  if (isLoading) {
    return <div className="text-center text-revnu-gray py-12">Loading dashboard...</div>;
  }

  const renderWidget = (widget: Widget, dragHandleProps?: any) => {
    switch (widget.type) {
      case "quick-actions":
        return (
          <WidgetContainer
            id={widget.id}
            title="Quick Actions"
            size={widget.size}
            onSizeChange={(size) => handleSizeChange(widget.id, size)}
            onRemove={() => handleRemoveWidget(widget.id)}
            isFullWidth={widget.fullWidth}
            onToggleFullWidth={() => handleToggleFullWidth(widget.id)}
            dragHandleProps={dragHandleProps}
          >
            <div className="grid grid-cols-3 gap-3">
              <Link
                href="/dashboard/customers/new"
                className="p-3 bg-revnu-dark/50 border border-revnu-green/30 rounded-lg hover:border-revnu-green hover:bg-revnu-green/10 text-center text-white font-semibold transition text-sm"
              >
                + Add Customer
              </Link>
              <Link
                href="/dashboard/invoices/new"
                className="p-3 bg-revnu-dark/50 border border-revnu-green/30 rounded-lg hover:border-revnu-green hover:bg-revnu-green/10 text-center text-white font-semibold transition text-sm"
              >
                + Create Invoice
              </Link>
              <Link
                href="/dashboard/sequences"
                className="p-3 bg-gradient-to-r from-revnu-green to-revnu-greenDark text-revnu-dark font-bold rounded-lg hover:from-revnu-greenLight hover:to-revnu-green text-center transition text-sm"
              >
                Manage Sequences
              </Link>
            </div>
          </WidgetContainer>
        );

      case "stats":
        return (
          <WidgetContainer
            id={widget.id}
            title="Key Metrics"
            subtitle="Click to drill down"
            size={widget.size}
            onSizeChange={(size) => handleSizeChange(widget.id, size)}
            onRemove={() => handleRemoveWidget(widget.id)}
            isFullWidth={widget.fullWidth}
            onToggleFullWidth={() => handleToggleFullWidth(widget.id)}
            dragHandleProps={dragHandleProps}
          >
            <StatsWidget stats={statCards} columns={5} />
          </WidgetContainer>
        );

      case "chart":
        return (
          <WidgetContainer
            id={widget.id}
            title="Collection Trends"
            subtitle="Last 6 Months"
            size={widget.size}
            onSizeChange={(size) => handleSizeChange(widget.id, size)}
            onRemove={() => handleRemoveWidget(widget.id)}
            isFullWidth={widget.fullWidth}
            onToggleFullWidth={() => handleToggleFullWidth(widget.id)}
            dragHandleProps={dragHandleProps}
          >
            <CollectionTrendsChart data={collectionTrendsData} />
          </WidgetContainer>
        );

      case "top-accounts":
        return (
          <WidgetContainer
            id={widget.id}
            title="Top 10 Accounts"
            subtitle="By outstanding balance"
            size={widget.size}
            onSizeChange={(size) => handleSizeChange(widget.id, size)}
            onRemove={() => handleRemoveWidget(widget.id)}
            isFullWidth={widget.fullWidth}
            onToggleFullWidth={() => handleToggleFullWidth(widget.id)}
            dragHandleProps={dragHandleProps}
          >
            <div className="overflow-x-auto -mx-4">
              <table className="w-full text-sm">
                <thead className="bg-revnu-dark/50 border-b border-revnu-green/10">
                  <tr>
                    <th className="text-left py-2 px-3 text-xs font-bold text-revnu-gray uppercase">#</th>
                    <th className="text-left py-2 px-3 text-xs font-bold text-revnu-gray uppercase">Customer</th>
                    <th className="text-right py-2 px-3 text-xs font-bold text-revnu-gray uppercase">Outstanding</th>
                    <th className="text-right py-2 px-3 text-xs font-bold text-revnu-gray uppercase">Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-revnu-green/10">
                  {top10Accounts.slice(0, widget.size === "compact" ? 5 : widget.size === "expanded" ? 15 : 10).map((account, index) => {
                    const rate = account.totalInvoiced > 0
                      ? (account.totalCollected / account.totalInvoiced) * 100
                      : 0;

                    return (
                      <tr key={account.id} className="hover:bg-revnu-dark/30 transition">
                        <td className="py-2 px-3 text-revnu-gray text-xs">{index + 1}</td>
                        <td className="py-2 px-3">
                          <Link href={`/dashboard/customers/${account.id}`} className="block hover:text-revnu-green transition">
                            <div className="font-semibold text-white text-sm">
                              {account.firstName} {account.lastName}
                            </div>
                            {widget.size !== "compact" && (
                              <div className="text-xs text-revnu-gray truncate max-w-[200px]">{account.email}</div>
                            )}
                          </Link>
                        </td>
                        <td className="py-2 px-3 text-right text-amber-400 font-bold">
                          ${(account.totalOwed / 100).toLocaleString()}
                        </td>
                        <td className="py-2 px-3 text-right text-sm">
                          <span className={`font-semibold ${
                            rate >= 75 ? "text-emerald-400" :
                            rate >= 50 ? "text-amber-400" :
                            "text-red-400"
                          }`}>
                            {rate.toFixed(0)}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </WidgetContainer>
        );

      case "sequences":
        return (
          <WidgetContainer
            id={widget.id}
            title="Active Sequences"
            subtitle="Collection workflows"
            size={widget.size}
            onSizeChange={(size) => handleSizeChange(widget.id, size)}
            onRemove={() => handleRemoveWidget(widget.id)}
            isFullWidth={widget.fullWidth}
            onToggleFullWidth={() => handleToggleFullWidth(widget.id)}
            dragHandleProps={dragHandleProps}
          >
            <div className="space-y-2">
              {activeSequences.length === 0 ? (
                <p className="text-center text-revnu-gray text-sm py-4">
                  No sequences. <Link href="/dashboard/sequences" className="text-revnu-green font-semibold">Create one</Link>
                </p>
              ) : (
                activeSequences.slice(0, widget.size === "compact" ? 3 : widget.size === "expanded" ? 10 : 5).map((seq) => (
                  <Link
                    key={seq.id}
                    href={`/dashboard/sequences/${seq.id}`}
                    className="block p-3 bg-revnu-dark/30 rounded-lg hover:bg-revnu-dark/50 transition"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-white text-sm">{seq.name}</div>
                        {widget.size !== "compact" && (
                          <div className="text-xs text-revnu-gray mt-0.5">
                            {seq.steps.length} steps • {seq.isActive ? "Active" : "Inactive"}
                          </div>
                        )}
                      </div>
                      <div className="text-xs font-bold text-revnu-green">
                        {seq._count.invoices}
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </WidgetContainer>
        );

      case "recent-activity":
        // Mock data - replace with real data from API
        const recentActivities: ActivityItem[] = [
          {
            id: "1",
            type: "payment",
            description: "John Smith paid invoice #1001",
            time: "2 hours ago",
            amount: 45000,
            link: "/dashboard/invoices/1001",
          },
          {
            id: "2",
            type: "message",
            description: "Sent collection reminder to Jane Doe",
            time: "4 hours ago",
            link: "/dashboard/customers/2",
          },
          {
            id: "3",
            type: "customer",
            description: "New customer: Mike Johnson added",
            time: "1 day ago",
            link: "/dashboard/customers/3",
          },
          {
            id: "4",
            type: "invoice",
            description: "Invoice #1002 created for Sarah Williams",
            time: "2 days ago",
            link: "/dashboard/invoices/1002",
          },
        ];

        return (
          <WidgetContainer
            id={widget.id}
            title="Recent Activity"
            subtitle="Latest events"
            size={widget.size}
            onSizeChange={(size) => handleSizeChange(widget.id, size)}
            onRemove={() => handleRemoveWidget(widget.id)}
            isFullWidth={widget.fullWidth}
            onToggleFullWidth={() => handleToggleFullWidth(widget.id)}
            dragHandleProps={dragHandleProps}
          >
            <RecentActivityWidget
              activities={recentActivities}
              maxItems={widget.size === "compact" ? 5 : widget.size === "expanded" ? 15 : 10}
            />
          </WidgetContainer>
        );

      case "payment-methods":
        // Mock data - replace with real data from API
        const paymentMethods: PaymentMethodStat[] = [
          {
            method: "Credit Card",
            count: 45,
            totalAmount: 12500000,
            percentage: 62.5,
          },
          {
            method: "ACH / Bank Transfer",
            count: 28,
            totalAmount: 5000000,
            percentage: 25.0,
          },
          {
            method: "Venmo / Zelle",
            count: 15,
            totalAmount: 1500000,
            percentage: 7.5,
          },
          {
            method: "Check",
            count: 8,
            totalAmount: 1000000,
            percentage: 5.0,
          },
        ];

        return (
          <WidgetContainer
            id={widget.id}
            title="Payment Methods"
            subtitle="Breakdown by type"
            size={widget.size}
            onSizeChange={(size) => handleSizeChange(widget.id, size)}
            onRemove={() => handleRemoveWidget(widget.id)}
            isFullWidth={widget.fullWidth}
            onToggleFullWidth={() => handleToggleFullWidth(widget.id)}
            dragHandleProps={dragHandleProps}
          >
            <PaymentMethodsWidget paymentMethods={paymentMethods} />
          </WidgetContainer>
        );

      case "collection-calendar":
        // Mock data - replace with real data from API
        const today = new Date();
        const calendarEvents: CalendarEvent[] = [
          {
            id: "1",
            date: new Date(today.getTime()),
            type: "overdue",
            customerName: "John Smith",
            amount: 75000,
            invoiceNumber: "INV-1001",
            link: "/dashboard/invoices/1001",
          },
          {
            id: "2",
            date: new Date(today.getTime()),
            type: "scheduled_message",
            customerName: "Jane Doe",
            invoiceNumber: "INV-1002",
            link: "/dashboard/customers/2",
          },
          {
            id: "3",
            date: new Date(today.getTime() + 86400000), // Tomorrow
            type: "due",
            customerName: "Mike Johnson",
            amount: 125000,
            invoiceNumber: "INV-1003",
            link: "/dashboard/invoices/1003",
          },
          {
            id: "4",
            date: new Date(today.getTime() + 86400000 * 2), // 2 days
            type: "scheduled_message",
            customerName: "Sarah Williams",
            invoiceNumber: "INV-1004",
            link: "/dashboard/customers/4",
          },
          {
            id: "5",
            date: new Date(today.getTime() + 86400000 * 3), // 3 days
            type: "due",
            customerName: "Robert Brown",
            amount: 95000,
            invoiceNumber: "INV-1005",
            link: "/dashboard/invoices/1005",
          },
        ];

        return (
          <WidgetContainer
            id={widget.id}
            title="Collection Calendar"
            subtitle="Upcoming due dates"
            size={widget.size}
            onSizeChange={(size) => handleSizeChange(widget.id, size)}
            onRemove={() => handleRemoveWidget(widget.id)}
            isFullWidth={widget.fullWidth}
            onToggleFullWidth={() => handleToggleFullWidth(widget.id)}
            dragHandleProps={dragHandleProps}
          >
            <CollectionCalendarWidget
              events={calendarEvents}
              daysAhead={14}
            />
          </WidgetContainer>
        );

      case "communications-activity":
        return (
          <WidgetContainer
            id={widget.id}
            title="Communications Activity"
            subtitle="Last 30 days"
            size={widget.size}
            onSizeChange={(size) => handleSizeChange(widget.id, size)}
            onRemove={() => handleRemoveWidget(widget.id)}
            isFullWidth={widget.fullWidth}
            onToggleFullWidth={() => handleToggleFullWidth(widget.id)}
            dragHandleProps={dragHandleProps}
          >
            {communicationsStats ? (
              <CommunicationsActivityWidget
                stats={communicationsStats}
                maxItems={widget.size === "compact" ? 5 : widget.size === "expanded" ? 15 : 10}
              />
            ) : (
              <div className="text-center py-6 text-revnu-gray text-sm">
                Loading communications data...
              </div>
            )}
          </WidgetContainer>
        );

      case "lien-alerts":
        return (
          <WidgetContainer
            id={widget.id}
            title="Lien Alerts"
            subtitle="Protect your payment rights"
            size={widget.size}
            onSizeChange={(size) => handleSizeChange(widget.id, size)}
            onRemove={() => handleRemoveWidget(widget.id)}
            isFullWidth={widget.fullWidth}
            onToggleFullWidth={() => handleToggleFullWidth(widget.id)}
            dragHandleProps={dragHandleProps}
          >
            <LienAlertsWidget
              alerts={lienAlerts}
              maxItems={widget.size === "compact" ? 3 : widget.size === "expanded" ? 10 : 5}
            />
          </WidgetContainer>
        );

      default:
        return null;
    }
  };

  const staticWidgets = ['quick-actions', 'stats', 'chart'];
  const dynamicWidgets = widgets.filter(w => !staticWidgets.includes(w.type));

  return (
    <div className="space-y-6">
      {/* PROMINENT: Send Reminders CTA - Most Important Action */}
      <Link
        href="/dashboard/send-reminders"
        className="block p-6 bg-gradient-to-r from-revnu-green to-revnu-greenDark rounded-xl hover:from-revnu-greenLight hover:to-revnu-green transition group"
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Send className="w-6 h-6 text-revnu-dark" />
              <h3 className="text-xl font-black text-revnu-dark">Send Payment Reminders</h3>
            </div>
            <p className="text-revnu-dark/80 font-semibold">
              Send SMS and email reminders with live previews • See exactly what your customers receive
            </p>
          </div>
          <div className="text-4xl font-black text-revnu-dark/20 group-hover:text-revnu-dark/40 transition">
            →
          </div>
        </div>
      </Link>

      {/* Static Top Section - Quick Actions */}
      <div className="bg-revnu-slate/40 p-6 rounded-lg border border-revnu-green/20">
        <h3 className="text-sm font-bold text-white mb-4">Quick Actions</h3>
        <div className="grid grid-cols-3 gap-3">
          <Link
            href="/dashboard/customers/new"
            className="p-3 bg-revnu-dark/50 border border-revnu-green/30 rounded-lg hover:border-revnu-green hover:bg-revnu-green/10 text-center text-white font-semibold transition text-sm"
          >
            + Add Customer
          </Link>
          <Link
            href="/dashboard/invoices/new"
            className="p-3 bg-revnu-dark/50 border border-revnu-green/30 rounded-lg hover:border-revnu-green hover:bg-revnu-green/10 text-center text-white font-semibold transition text-sm"
          >
            + Create Invoice
          </Link>
          <Link
            href="/dashboard/sequences"
            className="p-3 bg-gradient-to-r from-revnu-green to-revnu-greenDark text-revnu-dark font-bold rounded-lg hover:from-revnu-greenLight hover:to-revnu-green text-center transition text-sm"
          >
            Manage Sequences
          </Link>
        </div>
      </div>

      {/* Static Stats Grid */}
      <div className="bg-revnu-slate/40 p-6 rounded-lg border border-revnu-green/20">
        <h3 className="text-sm font-bold text-white mb-4">Key Metrics</h3>
        <StatsWidget stats={statCards} columns={5} />
      </div>

      {/* Static Chart */}
      <div className="bg-revnu-slate/40 p-6 rounded-lg border border-revnu-green/20">
        <h3 className="text-sm font-bold text-white mb-4">Collection Trends</h3>
        <CollectionTrendsChart data={collectionTrendsData} />
      </div>

      {/* Dynamic Widgets Grid */}
      <DashboardGrid
        widgets={dynamicWidgets}
        onWidgetsChange={handleWidgetsChange}
        onResetLayout={handleResetLayout}
        onAddWidget={handleAddWidget}
      >
        {renderWidget}
      </DashboardGrid>

      <WidgetLibraryModal
        isOpen={isWidgetLibraryOpen}
        onClose={() => setIsWidgetLibraryOpen(false)}
        onAddWidget={handleAddWidgetFromLibrary}
        existingWidgetIds={widgets.filter(w => w.visible).map(w => w.id)}
      />
    </div>
  );
}
