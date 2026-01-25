"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function AutomationPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "quick-send");

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const tabs = [
    { id: "quick-send", label: "Quick Send", icon: "💌" },
    { id: "campaigns", label: "Campaigns", icon: "🎯" },
    { id: "sequences", label: "Sequences", icon: "📬" },
  ];

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    router.push(`/dashboard/automation?tab=${tabId}`, { scroll: false });
  };

  return (
    <div className="min-h-screen bg-revnu-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-white mb-2">🤖 Automation</h1>
          <p className="text-revnu-gray">
            Automate your payment reminders with quick sends, campaigns, and sequences.
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
          {activeTab === "quick-send" && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-4">Quick Send</h2>
              <p className="text-revnu-gray mb-6">
                Send one-time reminders to individual customers or groups.
              </p>
              <Link
                href="/dashboard/send-reminders"
                className="inline-flex items-center gap-2 px-6 py-3 bg-revnu-green text-white font-bold rounded-lg hover:bg-revnu-greenDark transition-all"
              >
                Go to Quick Send →
              </Link>
            </div>
          )}

          {activeTab === "campaigns" && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-4">Campaigns</h2>
              <p className="text-revnu-gray mb-6">
                Run bulk reminder campaigns for multiple invoices at once.
              </p>
              <Link
                href="/dashboard/campaigns"
                className="inline-flex items-center gap-2 px-6 py-3 bg-revnu-green text-white font-bold rounded-lg hover:bg-revnu-greenDark transition-all"
              >
                Go to Campaigns →
              </Link>
            </div>
          )}

          {activeTab === "sequences" && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-4">Sequences</h2>
              <p className="text-revnu-gray mb-6">
                Create automated reminder sequences and templates.
              </p>
              <Link
                href="/dashboard/sequences"
                className="inline-flex items-center gap-2 px-6 py-3 bg-revnu-green text-white font-bold rounded-lg hover:bg-revnu-greenDark transition-all"
              >
                Go to Sequences →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
