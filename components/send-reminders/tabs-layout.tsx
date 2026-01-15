'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Send, ListTodo, Sparkles } from 'lucide-react';

interface Tab {
  id: string;
  label: string;
  icon: React.ReactNode;
  description: string;
}

interface TabsLayoutProps {
  children: (activeTab: string) => React.ReactNode;
}

export default function TabsLayout({ children }: TabsLayoutProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabFromUrl = searchParams.get('tab');

  const [activeTab, setActiveTab] = useState(tabFromUrl || 'assign');

  const tabs: Tab[] = [
    {
      id: 'assign',
      label: 'Assign to Sequence',
      icon: <ListTodo className="w-4 h-4" />,
      description: 'Select invoices and assign to automated sequences',
    },
    {
      id: 'create',
      label: 'Create Sequence',
      icon: <Sparkles className="w-4 h-4" />,
      description: 'Build new sequences with AI assistance',
    },
  ];

  useEffect(() => {
    if (tabFromUrl && tabs.some(tab => tab.id === tabFromUrl)) {
      setActiveTab(tabFromUrl);
    }
  }, [tabFromUrl]);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', tabId);
    router.push(`?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="bg-revnu-slate/40 border border-revnu-green/20 rounded-xl p-2">
        <div className="grid md:grid-cols-2 gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`p-4 rounded-lg transition-all ${
                activeTab === tab.id
                  ? 'bg-revnu-green text-revnu-dark shadow-lg shadow-revnu-green/20'
                  : 'bg-revnu-dark/50 text-revnu-gray hover:bg-revnu-dark hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3 mb-1">
                {tab.icon}
                <span className="font-bold text-sm">{tab.label}</span>
              </div>
              <p className={`text-xs ${
                activeTab === tab.id ? 'text-revnu-dark/80' : 'text-revnu-gray/60'
              }`}>
                {tab.description}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div>
        {children(activeTab)}
      </div>
    </div>
  );
}
