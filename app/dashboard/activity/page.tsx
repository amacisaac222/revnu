"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function ActivityPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "reports");

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const tabs = [
    { id: "reports", label: "Reports", icon: "📈" },
    { id: "messages", label: "Messages", icon: "💬" },
  ];

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    router.push(`/dashboard/activity?tab=${tabId}`, { scroll: false });
  };

  return (
    <div className="min-h-screen bg-revnu-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-white mb-2">📈 Activity</h1>
          <p className="text-revnu-gray">
            View reports, analytics, and message history.
          </p>
        </div>

        {/* Tabs */}
        <div className="border-b border-revnu-slate/50 mb-8">
          <div className="flex gap-1 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 font-semibold border-b-2 transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? "border-revnu-green text-revnu-green"
                    : "border-transparent text-revnu-gray hover:text-white"
                }`}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-revnu-slate/40 border border-revnu-green/20 rounded-xl p-8">
          {activeTab === "reports" && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-4">Reports & Analytics</h2>
              <p className="text-revnu-gray mb-6">
                View performance metrics, collection rates, and financial reports.
              </p>
              <Link
                href="/dashboard/reports"
                className="inline-flex items-center gap-2 px-6 py-3 bg-revnu-green text-white font-bold rounded-lg hover:bg-revnu-greenDark transition-all"
              >
                Go to Reports →
              </Link>
            </div>
          )}

          {activeTab === "messages" && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-4">Message History</h2>
              <p className="text-revnu-gray mb-6">
                View all sent messages, delivery status, and customer communications.
              </p>
              <Link
                href="/dashboard/communications"
                className="inline-flex items-center gap-2 px-6 py-3 bg-revnu-green text-white font-bold rounded-lg hover:bg-revnu-greenDark transition-all"
              >
                Go to Messages →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
