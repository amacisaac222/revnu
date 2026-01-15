"use client";

import { Calendar, Bell, DollarSign, AlertCircle } from "lucide-react";
import Link from "next/link";

export interface CalendarEvent {
  id: string;
  date: Date;
  type: "due" | "scheduled_message" | "overdue";
  customerName: string;
  amount?: number;
  invoiceNumber?: string;
  link?: string;
}

interface CollectionCalendarWidgetProps {
  events: CalendarEvent[];
  daysAhead?: number;
}

export default function CollectionCalendarWidget({
  events,
  daysAhead = 14,
}: CollectionCalendarWidgetProps) {
  // Group events by date
  const eventsByDate = events.reduce((acc, event) => {
    const dateKey = event.date.toISOString().split("T")[0];
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(event);
    return acc;
  }, {} as Record<string, CalendarEvent[]>);

  // Sort dates
  const sortedDates = Object.keys(eventsByDate).sort();

  const getEventIcon = (type: CalendarEvent["type"]) => {
    switch (type) {
      case "due":
        return <DollarSign className="w-4 h-4 text-amber-400" />;
      case "scheduled_message":
        return <Bell className="w-4 h-4 text-blue-400" />;
      case "overdue":
        return <AlertCircle className="w-4 h-4 text-red-400" />;
      default:
        return <Calendar className="w-4 h-4 text-revnu-gray" />;
    }
  };

  const getEventTypeLabel = (type: CalendarEvent["type"]) => {
    switch (type) {
      case "due":
        return "Due";
      case "scheduled_message":
        return "Message";
      case "overdue":
        return "Overdue";
      default:
        return "Event";
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    }
    if (date.toDateString() === tomorrow.toDateString()) {
      return "Tomorrow";
    }

    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  if (sortedDates.length === 0) {
    return (
      <div className="text-center py-8 text-revnu-gray">
        <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p>No upcoming events</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {sortedDates.slice(0, 7).map((dateKey) => {
        const dateEvents = eventsByDate[dateKey];

        return (
          <div key={dateKey} className="space-y-2">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-revnu-green" />
              <h4 className="text-sm font-bold text-white">{formatDate(dateKey)}</h4>
              <span className="text-xs text-revnu-gray">
                ({dateEvents.length} event{dateEvents.length !== 1 ? 's' : ''})
              </span>
            </div>

            <div className="space-y-2 pl-6">
              {dateEvents.map((event) => {
                const content = (
                  <div className="flex items-start gap-3 p-2.5 rounded-lg bg-revnu-dark/30 border border-revnu-green/10 hover:border-revnu-green/30 transition group">
                    <div className="flex-shrink-0 p-1.5 bg-revnu-dark/50 rounded">
                      {getEventIcon(event.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold text-revnu-green">
                          {getEventTypeLabel(event.type)}
                        </span>
                        {event.invoiceNumber && (
                          <span className="text-xs text-revnu-gray">
                            {event.invoiceNumber}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-white truncate">{event.customerName}</p>
                      {event.amount && (
                        <p className="text-xs font-bold text-amber-400 mt-1">
                          ${(event.amount / 100).toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                );

                if (event.link) {
                  return (
                    <Link key={event.id} href={event.link}>
                      {content}
                    </Link>
                  );
                }

                return <div key={event.id}>{content}</div>;
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
