'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, TrendingUp, Users, MousePointerClick, Clock, Globe, Smartphone } from 'lucide-react';

export default function AdminAnalyticsPage() {
  const [posthogConfigured, setPosthogConfigured] = useState(false);

  useEffect(() => {
    // Check if PostHog is configured
    setPosthogConfigured(!!process.env.NEXT_PUBLIC_POSTHOG_KEY);
  }, []);

  return (
    <div className="min-h-screen bg-revnu-dark">
      {/* Header */}
      <div className="bg-revnu-darker border-b border-revnu-slate/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <Link
              href="/admin"
              className="p-2 hover:bg-revnu-slate/40 rounded-lg transition"
            >
              <ArrowLeft className="w-5 h-5 text-revnu-gray" />
            </Link>
            <div>
              <h1 className="text-3xl font-black text-white">Analytics Dashboard</h1>
              <p className="text-revnu-gray mt-1">PostHog insights and user behavior</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {!posthogConfigured ? (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-8">
            <h3 className="text-xl font-bold text-amber-400 mb-4">PostHog Not Configured</h3>
            <p className="text-revnu-gray mb-6">
              To enable analytics tracking, you need to add your PostHog credentials to your environment variables.
            </p>

            <div className="bg-revnu-dark/50 border border-revnu-green/20 rounded-lg p-6 space-y-4">
              <h4 className="font-bold text-white mb-2">Setup Instructions:</h4>

              <ol className="list-decimal list-inside space-y-3 text-sm text-revnu-gray">
                <li>
                  <span className="text-white font-semibold">Create a PostHog account</span> at{' '}
                  <a href="https://posthog.com" target="_blank" rel="noopener noreferrer" className="text-revnu-green hover:underline">
                    posthog.com
                  </a>
                </li>
                <li>
                  <span className="text-white font-semibold">Create a new project</span> in your PostHog dashboard
                </li>
                <li>
                  <span className="text-white font-semibold">Copy your Project API Key</span> (starts with "phc_")
                </li>
                <li>
                  <span className="text-white font-semibold">Get your Personal API Key</span> from Settings → Personal API Keys (starts with "phx_")
                </li>
                <li>
                  <span className="text-white font-semibold">Add to your .env file:</span>
                  <div className="mt-2 p-3 bg-revnu-darker rounded font-mono text-xs text-revnu-green">
                    NEXT_PUBLIC_POSTHOG_KEY="phc_..."<br />
                    NEXT_PUBLIC_POSTHOG_HOST="https://us.i.posthog.com"<br />
                    POSTHOG_API_KEY="phx_..."
                  </div>
                </li>
                <li>
                  <span className="text-white font-semibold">Restart your dev server</span>
                </li>
              </ol>
            </div>

            <div className="mt-6">
              <a
                href="https://posthog.com/docs"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-revnu-green text-revnu-dark font-bold rounded-lg hover:bg-revnu-greenLight transition"
              >
                <Globe className="w-4 h-4" />
                View PostHog Documentation
              </a>
            </div>
          </div>
        ) : (
          <>
            {/* PostHog Embed */}
            <div className="bg-revnu-slate/40 border border-revnu-green/20 rounded-xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">Analytics Overview</h3>
              <p className="text-revnu-gray mb-6">
                View detailed analytics and user behavior in your PostHog dashboard.
              </p>

              <div className="space-y-4">
                <a
                  href="https://us.posthog.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-revnu-green text-revnu-dark font-bold rounded-lg hover:bg-revnu-greenLight transition"
                >
                  <TrendingUp className="w-4 h-4" />
                  Open PostHog Dashboard
                </a>
              </div>
            </div>

            {/* Quick Insights Placeholders */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-revnu-slate/40 border border-revnu-green/20 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-revnu-green/20 rounded-lg">
                    <Users className="w-5 h-5 text-revnu-green" />
                  </div>
                  <h4 className="font-bold text-white">Active Users</h4>
                </div>
                <p className="text-sm text-revnu-gray">View in PostHog dashboard for real-time data</p>
              </div>

              <div className="bg-revnu-slate/40 border border-revnu-green/20 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-blue-500/20 rounded-lg">
                    <MousePointerClick className="w-5 h-5 text-blue-400" />
                  </div>
                  <h4 className="font-bold text-white">Page Views</h4>
                </div>
                <p className="text-sm text-revnu-gray">Track most visited pages</p>
              </div>

              <div className="bg-revnu-slate/40 border border-revnu-green/20 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-purple-500/20 rounded-lg">
                    <Clock className="w-5 h-5 text-purple-400" />
                  </div>
                  <h4 className="font-bold text-white">Session Duration</h4>
                </div>
                <p className="text-sm text-revnu-gray">Average time spent on platform</p>
              </div>

              <div className="bg-revnu-slate/40 border border-revnu-green/20 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-amber-500/20 rounded-lg">
                    <Smartphone className="w-5 h-5 text-amber-400" />
                  </div>
                  <h4 className="font-bold text-white">Device Breakdown</h4>
                </div>
                <p className="text-sm text-revnu-gray">Desktop vs mobile usage</p>
              </div>
            </div>

            {/* Key Events to Track */}
            <div className="bg-revnu-slate/40 border border-revnu-green/20 rounded-xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">Key Events Being Tracked</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-revnu-dark/50 rounded-lg">
                  <h4 className="font-semibold text-white mb-2">User Events</h4>
                  <ul className="space-y-1 text-sm text-revnu-gray">
                    <li>• User signup</li>
                    <li>• User login</li>
                    <li>• Organization created</li>
                    <li>• Onboarding completed</li>
                  </ul>
                </div>

                <div className="p-4 bg-revnu-dark/50 rounded-lg">
                  <h4 className="font-semibold text-white mb-2">Feature Usage</h4>
                  <ul className="space-y-1 text-sm text-revnu-gray">
                    <li>• Invoice created</li>
                    <li>• Sequence activated</li>
                    <li>• Message sent</li>
                    <li>• Payment received</li>
                  </ul>
                </div>

                <div className="p-4 bg-revnu-dark/50 rounded-lg">
                  <h4 className="font-semibold text-white mb-2">Page Views</h4>
                  <ul className="space-y-1 text-sm text-revnu-gray">
                    <li>• Dashboard views</li>
                    <li>• Invoices page</li>
                    <li>• Sequences page</li>
                    <li>• Reports accessed</li>
                  </ul>
                </div>

                <div className="p-4 bg-revnu-dark/50 rounded-lg">
                  <h4 className="font-semibold text-white mb-2">Engagement</h4>
                  <ul className="space-y-1 text-sm text-revnu-gray">
                    <li>• Session duration</li>
                    <li>• Feature adoption rate</li>
                    <li>• Return visits</li>
                    <li>• Demo data usage</li>
                  </ul>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
