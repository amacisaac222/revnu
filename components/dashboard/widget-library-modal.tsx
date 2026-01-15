"use client";

import { X } from "lucide-react";

export interface AvailableWidget {
  id: string;
  type: string;
  name: string;
  description: string;
  icon: string;
  defaultSize: "compact" | "normal" | "expanded";
}

const AVAILABLE_WIDGETS: AvailableWidget[] = [
  {
    id: "quick-actions",
    type: "quick-actions",
    name: "Quick Actions",
    description: "Fast access to create customers, invoices, and manage sequences",
    icon: "⚡",
    defaultSize: "compact",
  },
  {
    id: "stats",
    type: "stats",
    name: "Stats Overview",
    description: "Key metrics: revenue, collected, outstanding, collection rate",
    icon: "📊",
    defaultSize: "normal",
  },
  {
    id: "chart",
    type: "chart",
    name: "Collection Trends",
    description: "Visual chart showing invoiced, collected, and outstanding over time",
    icon: "📈",
    defaultSize: "normal",
  },
  {
    id: "top-accounts",
    type: "top-accounts",
    name: "Top 10 Accounts",
    description: "Customers with highest outstanding balances",
    icon: "👥",
    defaultSize: "normal",
  },
  {
    id: "sequences",
    type: "sequences",
    name: "Active Sequences",
    description: "Your collection sequences and their status",
    icon: "🔄",
    defaultSize: "normal",
  },
  {
    id: "recent-activity",
    type: "recent-activity",
    name: "Recent Activity",
    description: "Latest customer actions, payments, and messages",
    icon: "🕐",
    defaultSize: "normal",
  },
  {
    id: "payment-methods",
    type: "payment-methods",
    name: "Payment Methods",
    description: "Breakdown of payment methods used",
    icon: "💳",
    defaultSize: "compact",
  },
  {
    id: "collection-calendar",
    type: "collection-calendar",
    name: "Collection Calendar",
    description: "Upcoming payment due dates and scheduled messages",
    icon: "📅",
    defaultSize: "expanded",
  },
  {
    id: "communications-activity",
    type: "communications-activity",
    name: "Communications Activity",
    description: "Track message delivery rates and channel performance (last 30 days)",
    icon: "💬",
    defaultSize: "compact",
  },
  {
    id: "lien-alerts",
    type: "lien-alerts",
    name: "Lien Alerts",
    description: "Urgent mechanics lien filing deadlines and protection status",
    icon: "🛡️",
    defaultSize: "normal",
  },
];

interface WidgetLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddWidget: (widget: AvailableWidget) => void;
  existingWidgetIds: string[];
}

export default function WidgetLibraryModal({
  isOpen,
  onClose,
  onAddWidget,
  existingWidgetIds,
}: WidgetLibraryModalProps) {
  if (!isOpen) return null;

  const handleAddWidget = (widget: AvailableWidget) => {
    onAddWidget(widget);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-revnu-dark border-2 border-revnu-green/30 rounded-2xl max-w-4xl w-full max-h-[85vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-revnu-green/20 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-white">Widget Library</h2>
            <p className="text-sm text-revnu-gray mt-1">Choose a widget to add to your dashboard</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-revnu-green/10 rounded-lg transition"
          >
            <X className="w-5 h-5 text-revnu-gray" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {AVAILABLE_WIDGETS.map((widget) => {
              const isAlreadyAdded = existingWidgetIds.includes(widget.id);

              return (
                <button
                  key={widget.id}
                  onClick={() => !isAlreadyAdded && handleAddWidget(widget)}
                  disabled={isAlreadyAdded}
                  className={`
                    p-5 rounded-xl border-2 text-left transition
                    ${isAlreadyAdded
                      ? "border-revnu-green/10 bg-revnu-slate/20 opacity-50 cursor-not-allowed"
                      : "border-revnu-green/20 bg-revnu-slate/40 hover:border-revnu-green hover:bg-revnu-green/10"
                    }
                  `}
                >
                  <div className="flex items-start gap-3">
                    <div className="text-3xl">{widget.icon}</div>
                    <div className="flex-1">
                      <h3 className="text-white font-bold mb-1 flex items-center gap-2">
                        {widget.name}
                        {isAlreadyAdded && (
                          <span className="text-xs px-2 py-0.5 bg-revnu-green/20 text-revnu-green rounded">
                            Added
                          </span>
                        )}
                      </h3>
                      <p className="text-sm text-revnu-gray">{widget.description}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export { AVAILABLE_WIDGETS };
