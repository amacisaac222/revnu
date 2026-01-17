'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Loader2,
  ArrowLeft,
  Play,
  Pause,
  StopCircle,
  Edit2,
  Check,
  X,
  Mail,
  MessageSquare,
  Clock,
  CheckCircle2,
  AlertCircle,
  User,
  FileText,
} from 'lucide-react';

interface CampaignDetailProps {
  params: Promise<{
    id: string;
  }>;
}

export default function CampaignDetailPage({ params }: CampaignDetailProps) {
  const { id: campaignId } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [campaign, setCampaign] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState('');
  const [filter, setFilter] = useState<string>('all'); // all, active, paused, completed, stopped

  useEffect(() => {
    fetchCampaignDetails();
  }, [campaignId]);

  const fetchCampaignDetails = async () => {
    try {
      const response = await fetch(`/api/campaigns/${campaignId}`);
      const data = await response.json();
      if (response.ok) {
        setCampaign(data.campaign);
        setNewName(data.campaign.campaignName || '');
      } else {
        alert('Campaign not found');
        router.push('/dashboard/campaigns');
      }
    } catch (error) {
      console.error('Error fetching campaign:', error);
      alert('Failed to load campaign');
      router.push('/dashboard/campaigns');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (action: 'pause' | 'resume' | 'stop') => {
    const confirmMessages = {
      pause: 'Pause this campaign? All scheduled messages will be paused.',
      resume: 'Resume this campaign? Scheduled messages will continue sending.',
      stop: 'Stop this campaign? This cannot be undone and all pending messages will be cancelled.',
    };

    if (!confirm(confirmMessages[action])) return;

    setActionLoading(true);
    try {
      const response = await fetch(`/api/campaigns/${campaignId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });

      if (response.ok) {
        await fetchCampaignDetails();
      } else {
        alert('Failed to ' + action + ' campaign');
      }
    } catch (error) {
      console.error('Error updating campaign:', error);
      alert('Failed to ' + action + ' campaign');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRename = async () => {
    if (!newName.trim()) {
      alert('Campaign name cannot be empty');
      return;
    }

    setActionLoading(true);
    try {
      const response = await fetch(`/api/campaigns/${campaignId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'rename', campaignName: newName.trim() }),
      });

      if (response.ok) {
        setEditingName(false);
        await fetchCampaignDetails();
      } else {
        alert('Failed to rename campaign');
      }
    } catch (error) {
      console.error('Error renaming campaign:', error);
      alert('Failed to rename campaign');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 text-revnu-green animate-spin" />
      </div>
    );
  }

  if (!campaign) {
    return null;
  }

  const filteredEnrollments = campaign.enrollments.filter((enrollment: any) => {
    if (filter === 'all') return true;
    return enrollment.status === filter;
  });

  const hasActive = campaign.stats.active > 0;
  const hasPaused = campaign.stats.paused > 0;
  const canResume = hasPaused && !hasActive;
  const canPause = hasActive;
  const canStop = hasActive || hasPaused;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-400 bg-green-500/20';
      case 'paused':
        return 'text-yellow-400 bg-yellow-500/20';
      case 'completed':
        return 'text-blue-400 bg-blue-500/20';
      case 'stopped':
        return 'text-red-400 bg-red-500/20';
      case 'cancelled':
        return 'text-gray-400 bg-gray-500/20';
      default:
        return 'text-revnu-gray bg-revnu-slate/20';
    }
  };

  const getMessageStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <CheckCircle2 className="w-4 h-4 text-green-400" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-400" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-400" />;
      case 'cancelled':
        return <X className="w-4 h-4 text-gray-400" />;
      default:
        return <Clock className="w-4 h-4 text-revnu-gray" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/dashboard/campaigns"
          className="inline-flex items-center gap-2 text-revnu-gray hover:text-white transition mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Campaigns
        </Link>

        <div className="flex items-start justify-between">
          <div className="flex-1">
            {editingName ? (
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="px-4 py-2 bg-revnu-darker border border-revnu-slate/30 rounded-lg text-white text-2xl font-bold focus:outline-none focus:border-revnu-green"
                  placeholder="Campaign Name"
                  autoFocus
                />
                <button
                  onClick={handleRename}
                  disabled={actionLoading}
                  className="p-2 bg-revnu-green text-revnu-dark rounded-lg hover:bg-revnu-greenLight transition disabled:opacity-50"
                >
                  <Check className="w-5 h-5" />
                </button>
                <button
                  onClick={() => {
                    setEditingName(false);
                    setNewName(campaign.campaignName || '');
                  }}
                  disabled={actionLoading}
                  className="p-2 bg-revnu-dark border border-revnu-slate/30 text-revnu-gray rounded-lg hover:text-white transition disabled:opacity-50"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-black text-white">
                  {campaign.campaignName || `Campaign ${campaignId.slice(0, 8)}`}
                </h1>
                <button
                  onClick={() => setEditingName(true)}
                  className="p-2 text-revnu-gray hover:text-revnu-green hover:bg-revnu-green/10 rounded-lg transition"
                  title="Rename Campaign"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>
            )}
            <p className="text-revnu-gray mt-1">{campaign.sequence.name}</p>
            <p className="text-sm text-revnu-gray/70 mt-1">
              Launched {new Date(campaign.launchedAt).toLocaleString()}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {canPause && (
              <button
                onClick={() => handleAction('pause')}
                disabled={actionLoading}
                className="px-3 py-1.5 bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 font-semibold text-sm rounded-md hover:bg-yellow-500/30 transition disabled:opacity-50 flex items-center gap-1.5"
              >
                {actionLoading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Pause className="w-3.5 h-3.5" />
                )}
                Pause
              </button>
            )}
            {canResume && (
              <button
                onClick={() => handleAction('resume')}
                disabled={actionLoading}
                className="px-3 py-1.5 bg-green-500/20 border border-green-500/30 text-green-400 font-semibold text-sm rounded-md hover:bg-green-500/30 transition disabled:opacity-50 flex items-center gap-1.5"
              >
                {actionLoading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Play className="w-3.5 h-3.5" />
                )}
                Resume
              </button>
            )}
            {canStop && (
              <button
                onClick={() => handleAction('stop')}
                disabled={actionLoading}
                className="px-3 py-1.5 bg-red-500/20 border border-red-500/30 text-red-400 font-semibold text-sm rounded-md hover:bg-red-500/30 transition disabled:opacity-50 flex items-center gap-1.5"
              >
                {actionLoading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <StopCircle className="w-3.5 h-3.5" />
                )}
                Stop
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-revnu-dark border border-revnu-slate/30 rounded-xl p-6">
          <div className="text-revnu-gray text-sm font-bold mb-2">Total Recipients</div>
          <div className="text-3xl font-black text-white">{campaign.stats.total}</div>
        </div>
        <div className="bg-revnu-dark border border-revnu-slate/30 rounded-xl p-6">
          <div className="text-revnu-gray text-sm font-bold mb-2">Messages Sent</div>
          <div className="text-3xl font-black text-revnu-green">{campaign.stats.messagesSent}</div>
        </div>
        <div className="bg-revnu-dark border border-revnu-slate/30 rounded-xl p-6">
          <div className="text-revnu-gray text-sm font-bold mb-2">Pending</div>
          <div className="text-3xl font-black text-yellow-400">{campaign.stats.messagesPending}</div>
        </div>
        <div className="bg-revnu-dark border border-revnu-slate/30 rounded-xl p-6">
          <div className="text-revnu-gray text-sm font-bold mb-2">Failed</div>
          <div className="text-3xl font-black text-red-400">{campaign.stats.messagesFailed}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {['all', 'active', 'paused', 'completed', 'stopped', 'cancelled'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-md font-semibold text-xs transition ${
              filter === f
                ? 'bg-revnu-green text-revnu-dark'
                : 'bg-revnu-dark border border-revnu-slate/30 text-revnu-gray hover:text-white'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
            <span className="ml-1.5 opacity-70">
              ({f === 'all' ? campaign.enrollments.length : campaign.stats[f as keyof typeof campaign.stats]})
            </span>
          </button>
        ))}
      </div>

      {/* Enrollments Table */}
      <div className="bg-revnu-dark border border-revnu-slate/30 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-revnu-darker border-b border-revnu-slate/30">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-revnu-gray uppercase tracking-wider">
                  Recipient
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-revnu-gray uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-revnu-gray uppercase tracking-wider">
                  Current Step
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-revnu-gray uppercase tracking-wider">
                  Messages
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-revnu-gray uppercase tracking-wider">
                  Last Contact
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-revnu-slate/30">
              {filteredEnrollments.map((enrollment: any) => (
                <tr key={enrollment.id} className="hover:bg-revnu-darker/50 transition">
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-bold text-white flex items-center gap-2">
                        <User className="w-4 h-4 text-revnu-green" />
                        {enrollment.customer.firstName} {enrollment.customer.lastName}
                      </div>
                      <div className="text-sm text-revnu-gray">
                        {enrollment.customer.email || enrollment.customer.phone}
                      </div>
                      {enrollment.invoice && (
                        <div className="text-xs text-revnu-gray/70 flex items-center gap-1 mt-1">
                          <FileText className="w-3 h-3" />
                          Invoice #{enrollment.invoice.invoiceNumber} - $
                          {(enrollment.invoice.amountRemaining / 100).toFixed(2)}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-bold rounded ${getStatusColor(enrollment.status)}`}>
                      {enrollment.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-white">
                      Step {enrollment.currentStep} of {campaign.sequence.steps.length}
                    </div>
                    <div className="w-full bg-revnu-darker rounded-full h-2 mt-2">
                      <div
                        className="bg-revnu-green h-2 rounded-full transition-all"
                        style={{
                          width: `${(enrollment.currentStep / campaign.sequence.steps.length) * 100}%`,
                        }}
                      />
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      {enrollment.scheduledMessages.slice(0, 3).map((msg: any) => (
                        <div key={msg.id} className="flex items-center gap-2 text-sm">
                          {getMessageStatusIcon(msg.status)}
                          {msg.channel === 'email' ? (
                            <Mail className="w-3 h-3 text-revnu-gray" />
                          ) : (
                            <MessageSquare className="w-3 h-3 text-revnu-gray" />
                          )}
                          <span className="text-revnu-gray text-xs">
                            {msg.status === 'sent' && msg.sentAt
                              ? new Date(msg.sentAt).toLocaleDateString()
                              : msg.status}
                          </span>
                        </div>
                      ))}
                      {enrollment.scheduledMessages.length > 3 && (
                        <div className="text-xs text-revnu-gray/70">
                          +{enrollment.scheduledMessages.length - 3} more
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-revnu-gray">
                      {enrollment.lastMessageSentAt
                        ? new Date(enrollment.lastMessageSentAt).toLocaleString()
                        : 'Not contacted yet'}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredEnrollments.length === 0 && (
          <div className="text-center py-12 text-revnu-gray">
            No {filter !== 'all' && filter} enrollments found
          </div>
        )}
      </div>
    </div>
  );
}
