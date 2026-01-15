'use client';

import { useRouter } from 'next/navigation';
import { CheckCircle, BarChart3, MessageSquare, Plus } from 'lucide-react';

interface SequenceTemplate {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  isDefault: boolean;
  triggerDaysPastDue: number;
  steps: any[];
}

interface WizardStep5Props {
  enrolledCount: number;
  sequence: SequenceTemplate;
  onStartNew: () => void;
}

export default function WizardStep5Success({ enrolledCount, sequence, onStartNew }: WizardStep5Props) {
  const router = useRouter();

  return (
    <div className="space-y-6">
      {/* Success Animation */}
      <div className="bg-gradient-to-br from-revnu-green/20 to-revnu-slate/40 border-2 border-revnu-green rounded-xl p-12 text-center">
        <div className="inline-block animate-bounce">
          <div className="w-24 h-24 mx-auto mb-6 bg-revnu-green rounded-full flex items-center justify-center shadow-lg shadow-revnu-green/50">
            <CheckCircle className="w-16 h-16 text-revnu-dark" />
          </div>
        </div>

        <h2 className="text-4xl font-black text-white mb-4">Campaign Launched Successfully!</h2>
        <p className="text-xl text-revnu-gray mb-2">
          <span className="text-revnu-green font-bold text-2xl">{enrolledCount} customers</span> have been enrolled in
        </p>
        <p className="text-2xl font-bold text-white">"{sequence.name}"</p>

        <div className="mt-8 p-6 bg-revnu-dark/50 border border-revnu-green/20 rounded-lg inline-block">
          <p className="text-revnu-gray text-sm mb-2">Messages will start sending when invoice is</p>
          <p className="text-lg font-bold text-white">
            {sequence.triggerDaysPastDue === 0 ? 'On due date' : `${sequence.triggerDaysPastDue} days past due`}
          </p>
          <p className="text-revnu-gray text-sm mt-3">
            {sequence.steps.length} automated messages will be sent per customer
          </p>
        </div>
      </div>

      {/* What Happens Next */}
      <div className="bg-revnu-slate/40 border border-revnu-green/20 rounded-xl p-6">
        <h3 className="text-lg font-bold text-white mb-4">What Happens Next</h3>
        <div className="space-y-3 text-revnu-gray">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-revnu-green/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-revnu-green text-sm font-bold">1</span>
            </div>
            <p>Customers will automatically receive messages according to the sequence schedule</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-revnu-green/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-revnu-green text-sm font-bold">2</span>
            </div>
            <p>Messages will only be sent to customers with proper consent (SMS/Email)</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-revnu-green/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-revnu-green text-sm font-bold">3</span>
            </div>
            <p>Track campaign performance and message delivery in real-time</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-revnu-green/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-revnu-green text-sm font-bold">4</span>
            </div>
            <p>Customers can opt-out at any time by replying STOP</p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid md:grid-cols-2 gap-4">
        <button
          onClick={() => router.push(`/dashboard/sequences/${sequence.id}`)}
          className="p-6 bg-revnu-slate/40 border-2 border-revnu-green/30 hover:border-revnu-green rounded-xl transition group"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-revnu-green/20 rounded-full flex items-center justify-center group-hover:bg-revnu-green/30 transition">
              <BarChart3 className="w-7 h-7 text-revnu-green" />
            </div>
            <div className="text-left">
              <h4 className="font-bold text-white text-lg mb-1">View Sequence Details</h4>
              <p className="text-sm text-revnu-gray">See sequence performance and enrolled customers</p>
            </div>
          </div>
        </button>

        <button
          onClick={() => router.push('/dashboard/communications')}
          className="p-6 bg-revnu-slate/40 border-2 border-revnu-green/30 hover:border-revnu-green rounded-xl transition group"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-blue-500/20 rounded-full flex items-center justify-center group-hover:bg-blue-500/30 transition">
              <MessageSquare className="w-7 h-7 text-blue-400" />
            </div>
            <div className="text-left">
              <h4 className="font-bold text-white text-lg mb-1">View Messages</h4>
              <p className="text-sm text-revnu-gray">Track all message delivery and responses</p>
            </div>
          </div>
        </button>
      </div>

      {/* Start New Campaign */}
      <div className="flex justify-center pt-6">
        <button
          onClick={onStartNew}
          className="px-8 py-4 bg-revnu-green text-revnu-dark font-bold rounded-lg text-lg hover:bg-revnu-green/90 transition flex items-center gap-3"
        >
          <Plus className="w-6 h-6" />
          Start New Campaign
        </button>
      </div>
    </div>
  );
}
