'use client';

import { Mail, MessageSquare } from 'lucide-react';

interface SequenceStep {
  id: string;
  stepNumber: number;
  delayDays: number;
  channel: string;
  subject?: string | null;
  body: string;
}

interface SequenceTimelineProps {
  steps: SequenceStep[];
  triggerDaysPastDue: number;
  onStepClick?: (step: SequenceStep) => void;
}

export default function SequenceTimeline({
  steps,
  triggerDaysPastDue,
  onStepClick,
}: SequenceTimelineProps) {
  const sortedSteps = [...steps].sort((a, b) => a.stepNumber - b.stepNumber);

  const calculateDayNumber = (stepNumber: number, delayDays: number) => {
    if (stepNumber === 1) {
      return triggerDaysPastDue;
    }
    const previousSteps = sortedSteps.filter(s => s.stepNumber < stepNumber);
    const totalDays = previousSteps.reduce((sum, s) => sum + s.delayDays, 0) + delayDays + triggerDaysPastDue;
    return totalDays;
  };

  const getChannelIcon = (channel: string) => {
    return channel === 'email' ? (
      <Mail className="w-5 h-5 text-blue-400" />
    ) : (
      <MessageSquare className="w-5 h-5 text-revnu-green" />
    );
  };

  const getChannelColor = (channel: string) => {
    return channel === 'email' ? 'bg-blue-400/20 border-blue-400/40' : 'bg-revnu-green/20 border-revnu-green/40';
  };

  return (
    <div className="relative">
      {/* Timeline Line */}
      <div className="absolute left-[52px] top-8 bottom-8 w-0.5 bg-revnu-green/20"></div>

      {/* Steps */}
      <div className="space-y-6">
        {sortedSteps.map((step, index) => {
          const dayNumber = calculateDayNumber(step.stepNumber, step.delayDays);
          const isClickable = !!onStepClick;

          return (
            <div
              key={step.id}
              onClick={() => isClickable && onStepClick(step)}
              className={`flex items-start gap-4 ${isClickable ? 'cursor-pointer' : ''}`}
            >
              {/* Day Marker */}
              <div className="flex-shrink-0 w-24 text-right">
                <div className="inline-block px-3 py-1.5 bg-revnu-dark border border-revnu-green/30 rounded-lg">
                  <div className="text-xs font-bold text-revnu-green">
                    Day {dayNumber}
                  </div>
                  {dayNumber === 0 && (
                    <div className="text-[10px] text-revnu-gray">Due date</div>
                  )}
                  {index > 0 && (
                    <div className="text-[10px] text-revnu-gray">+{step.delayDays}d</div>
                  )}
                </div>
              </div>

              {/* Step Icon */}
              <div className={`relative z-10 flex-shrink-0 w-12 h-12 rounded-full border-2 flex items-center justify-center ${getChannelColor(step.channel)} ${
                isClickable ? 'hover:scale-110 transition-transform' : ''
              }`}>
                {getChannelIcon(step.channel)}
                {/* Pulse Animation for Active Steps */}
                <div className={`absolute inset-0 rounded-full ${getChannelColor(step.channel)} animate-ping opacity-25`}></div>
              </div>

              {/* Step Details */}
              <div className={`flex-1 p-4 rounded-lg border ${
                isClickable
                  ? 'bg-revnu-dark/50 border-revnu-green/20 hover:border-revnu-green/40 hover:bg-revnu-dark transition'
                  : 'bg-revnu-dark/30 border-revnu-green/10'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-bold text-white">
                    Step {step.stepNumber}
                  </span>
                  <span className="text-xs px-2 py-0.5 bg-revnu-green/10 text-revnu-green rounded font-bold">
                    {step.channel === 'email' ? 'EMAIL' : 'SMS'}
                  </span>
                </div>

                {/* Email Subject */}
                {step.channel === 'email' && step.subject && (
                  <div className="text-sm font-semibold text-white mb-1">
                    {step.subject}
                  </div>
                )}

                {/* Body Preview (truncated) */}
                <div className="text-sm text-revnu-gray line-clamp-2">
                  {step.body}
                </div>

                {/* Expand Hint */}
                {isClickable && (
                  <div className="text-xs text-revnu-green mt-2">
                    Click to view full message →
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* End Marker */}
      {sortedSteps.length > 0 && (
        <div className="flex items-start gap-4 mt-6">
          <div className="flex-shrink-0 w-24"></div>
          <div className="flex-shrink-0 w-12 flex justify-center">
            <div className="w-3 h-3 rounded-full bg-revnu-green/40"></div>
          </div>
          <div className="flex-1 text-sm text-revnu-gray italic">
            Sequence complete
          </div>
        </div>
      )}
    </div>
  );
}
