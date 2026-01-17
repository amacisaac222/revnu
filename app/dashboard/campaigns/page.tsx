'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Loader2, Play, Pause, StopCircle, Eye, Users, MessageSquare, Calendar } from 'lucide-react';

interface Campaign {
  campaignId: string;
  campaignName: string | null;
  sequenceId: string;
  sequenceName: string;
  totalSteps: number;
  launchedAt: string;
  recipientCount: number;
  stats: {
    total: number;
    active: number;
    paused: number;
    completed: number;
    stopped: number;
    messagesSent: number;
    messagesPending: number;
    messagesFailed: number;
  };
}

export default function CampaignsPage() {
  const [loading, setLoading] = useState(true);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [filter, setFilter] = useState<string>('all'); // all, active, paused, completed, stopped
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const response = await fetch('/api/campaigns');
      const data = await response.json();
      setCampaigns(data.campaigns || []);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (campaignId: string, action: 'pause' | 'resume' | 'stop') => {
    const confirmMessages = {
      pause: 'Are you sure you want to pause this campaign? All scheduled messages will be paused.',
      resume: 'Resume this campaign? Scheduled messages will continue sending.',
      stop: 'Are you sure you want to stop this campaign? This cannot be undone and all pending messages will be cancelled.',
    };

    if (!confirm(confirmMessages[action])) return;

    setActionLoading(campaignId);
    try {
      const response = await fetch(`/api/campaigns/${campaignId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });

      if (response.ok) {
        await fetchCampaigns(); // Refresh list
      } else {
        alert('Failed to ' + action + ' campaign');
      }
    } catch (error) {
      console.error('Error updating campaign:', error);
      alert('Failed to ' + action + ' campaign');
    } finally {
      setActionLoading(null);
    }
  };

  const filteredCampaigns = campaigns.filter((campaign) => {
    if (filter === 'all') return true;
    if (filter === 'active') return campaign.stats.active > 0;
    if (filter === 'paused') return campaign.stats.paused > 0;
    if (filter === 'completed') return campaign.stats.completed > 0;
    if (filter === 'stopped') return campaign.stats.stopped > 0;
    return true;
  });

  const getStatusBadge = (campaign: Campaign) => {
    if (campaign.stats.active > 0)
      return <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs font-bold rounded">Active</span>;
    if (campaign.stats.paused > 0)
      return <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs font-bold rounded">Paused</span>;
    if (campaign.stats.stopped > 0)
      return <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs font-bold rounded">Stopped</span>;
    if (campaign.stats.completed === campaign.stats.total)
      return <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs font-bold rounded">Completed</span>;
    return <span className="px-2 py-1 bg-revnu-slate/20 text-revnu-gray text-xs font-bold rounded">Mixed</span>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 text-revnu-green animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-white">Campaign Management</h1>
        <p className="text-revnu-gray mt-1">
          View and manage your active message campaigns
        </p>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        {['all', 'active', 'paused', 'completed', 'stopped'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg font-bold text-sm transition ${
              filter === f
                ? 'bg-revnu-green text-revnu-dark'
                : 'bg-revnu-dark border border-revnu-slate/30 text-revnu-gray hover:text-white'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
            {f !== 'all' && (
              <span className="ml-2 opacity-70">
                ({campaigns.filter((c) => {
                  if (f === 'active') return c.stats.active > 0;
                  if (f === 'paused') return c.stats.paused > 0;
                  if (f === 'completed') return c.stats.completed > 0;
                  if (f === 'stopped') return c.stats.stopped > 0;
                  return false;
                }).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Empty State */}
      {filteredCampaigns.length === 0 && (
        <div className="text-center py-12 bg-revnu-dark border border-revnu-slate/30 rounded-xl">
          <MessageSquare className="w-16 h-16 text-revnu-gray mx-auto mb-4 opacity-50" />
          <h3 className="text-xl font-bold text-white mb-2">No Campaigns Found</h3>
          <p className="text-revnu-gray mb-6">
            {filter === 'all'
              ? "You haven't launched any campaigns yet."
              : `No ${filter} campaigns found.`}
          </p>
          <Link
            href="/dashboard/send-reminders"
            className="inline-block px-6 py-3 bg-revnu-green text-revnu-dark font-bold rounded-lg hover:bg-revnu-greenLight transition"
          >
            Launch Your First Campaign
          </Link>
        </div>
      )}

      {/* Campaigns Table */}
      {filteredCampaigns.length > 0 && (
        <div className="bg-revnu-dark border border-revnu-slate/30 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-revnu-darker border-b border-revnu-slate/30">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-revnu-gray uppercase tracking-wider">
                    Campaign
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-revnu-gray uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-revnu-gray uppercase tracking-wider">
                    Recipients
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-revnu-gray uppercase tracking-wider">
                    Progress
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-revnu-gray uppercase tracking-wider">
                    Messages
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-revnu-gray uppercase tracking-wider">
                    Launched
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-revnu-gray uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-revnu-slate/30">
                {filteredCampaigns.map((campaign) => {
                  const hasActive = campaign.stats.active > 0;
                  const hasPaused = campaign.stats.paused > 0;
                  const canResume = hasPaused && !hasActive;
                  const canPause = hasActive;
                  const canStop = hasActive || hasPaused;

                  return (
                    <tr key={campaign.campaignId} className="hover:bg-revnu-darker/50 transition">
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-bold text-white">
                            {campaign.campaignName || `Campaign ${campaign.campaignId.slice(0, 8)}`}
                          </div>
                          <div className="text-sm text-revnu-gray">{campaign.sequenceName}</div>
                          <div className="text-xs text-revnu-gray/70">{campaign.totalSteps} steps</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">{getStatusBadge(campaign)}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-white">
                          <Users className="w-4 h-4 text-revnu-green" />
                          <span className="font-bold">{campaign.recipientCount}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <div className="text-white">
                            <span className="text-green-400 font-bold">{campaign.stats.active}</span> active
                          </div>
                          {campaign.stats.paused > 0 && (
                            <div className="text-yellow-400 text-xs">
                              {campaign.stats.paused} paused
                            </div>
                          )}
                          {campaign.stats.completed > 0 && (
                            <div className="text-blue-400 text-xs">
                              {campaign.stats.completed} completed
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <div className="text-white">
                            <span className="text-revnu-green font-bold">{campaign.stats.messagesSent}</span> sent
                          </div>
                          {campaign.stats.messagesPending > 0 && (
                            <div className="text-revnu-gray text-xs">
                              {campaign.stats.messagesPending} pending
                            </div>
                          )}
                          {campaign.stats.messagesFailed > 0 && (
                            <div className="text-red-400 text-xs">
                              {campaign.stats.messagesFailed} failed
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-revnu-gray">
                          <div>{new Date(campaign.launchedAt).toLocaleDateString()}</div>
                          <div className="text-xs">{new Date(campaign.launchedAt).toLocaleTimeString()}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/dashboard/campaigns/${campaign.campaignId}`}
                            className="p-2 text-revnu-gray hover:text-revnu-green hover:bg-revnu-green/10 rounded-lg transition"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          {canPause && (
                            <button
                              onClick={() => handleAction(campaign.campaignId, 'pause')}
                              disabled={actionLoading === campaign.campaignId}
                              className="p-2 text-revnu-gray hover:text-yellow-400 hover:bg-yellow-400/10 rounded-lg transition disabled:opacity-50"
                              title="Pause Campaign"
                            >
                              {actionLoading === campaign.campaignId ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Pause className="w-4 h-4" />
                              )}
                            </button>
                          )}
                          {canResume && (
                            <button
                              onClick={() => handleAction(campaign.campaignId, 'resume')}
                              disabled={actionLoading === campaign.campaignId}
                              className="p-2 text-revnu-gray hover:text-green-400 hover:bg-green-400/10 rounded-lg transition disabled:opacity-50"
                              title="Resume Campaign"
                            >
                              {actionLoading === campaign.campaignId ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Play className="w-4 h-4" />
                              )}
                            </button>
                          )}
                          {canStop && (
                            <button
                              onClick={() => handleAction(campaign.campaignId, 'stop')}
                              disabled={actionLoading === campaign.campaignId}
                              className="p-2 text-revnu-gray hover:text-red-400 hover:bg-red-400/10 rounded-lg transition disabled:opacity-50"
                              title="Stop Campaign"
                            >
                              {actionLoading === campaign.campaignId ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <StopCircle className="w-4 h-4" />
                              )}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
