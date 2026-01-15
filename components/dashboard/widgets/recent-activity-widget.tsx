"use client";

import { Clock, DollarSign, Mail, MessageSquare, User } from "lucide-react";
import Link from "next/link";

export interface ActivityItem {
  id: string;
  type: "payment" | "message" | "customer" | "invoice";
  description: string;
  time: string;
  link?: string;
  amount?: number;
}

interface RecentActivityWidgetProps {
  activities: ActivityItem[];
  maxItems?: number;
}

export default function RecentActivityWidget({
  activities,
  maxItems = 10,
}: RecentActivityWidgetProps) {
  const displayedActivities = activities.slice(0, maxItems);

  const getIcon = (type: ActivityItem["type"]) => {
    switch (type) {
      case "payment":
        return <DollarSign className="w-4 h-4 text-green-400" />;
      case "message":
        return <MessageSquare className="w-4 h-4 text-blue-400" />;
      case "customer":
        return <User className="w-4 h-4 text-purple-400" />;
      case "invoice":
        return <Mail className="w-4 h-4 text-amber-400" />;
      default:
        return <Clock className="w-4 h-4 text-revnu-gray" />;
    }
  };

  const getTypeLabel = (type: ActivityItem["type"]) => {
    switch (type) {
      case "payment":
        return "Payment";
      case "message":
        return "Message";
      case "customer":
        return "Customer";
      case "invoice":
        return "Invoice";
      default:
        return "Activity";
    }
  };

  if (displayedActivities.length === 0) {
    return (
      <div className="text-center py-8 text-revnu-gray">
        <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p>No recent activity</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {displayedActivities.map((activity) => {
        const content = (
          <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-revnu-dark/30 transition group">
            <div className="flex-shrink-0 p-2 bg-revnu-dark/50 rounded-lg border border-revnu-green/20 group-hover:border-revnu-green/40 transition">
              {getIcon(activity.type)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-semibold text-revnu-green">
                  {getTypeLabel(activity.type)}
                </span>
                {activity.amount && (
                  <span className="text-xs font-bold text-green-400">
                    +${(activity.amount / 100).toLocaleString()}
                  </span>
                )}
              </div>
              <p className="text-sm text-white truncate">{activity.description}</p>
              <p className="text-xs text-revnu-gray mt-1">{activity.time}</p>
            </div>
          </div>
        );

        if (activity.link) {
          return (
            <Link key={activity.id} href={activity.link}>
              {content}
            </Link>
          );
        }

        return <div key={activity.id}>{content}</div>;
      })}
    </div>
  );
}
