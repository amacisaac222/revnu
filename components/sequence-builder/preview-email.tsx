"use client";

interface PreviewEmailProps {
  subject: string;
  body: string;
  businessName: string;
}

export default function PreviewEmail({ subject, body, businessName }: PreviewEmailProps) {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 max-w-2xl">
      {/* Email Header */}
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-revnu-green to-revnu-greenDark rounded-full flex items-center justify-center text-white font-bold">
              {businessName.charAt(0)}
            </div>
            <div>
              <div className="font-semibold text-sm">{businessName}</div>
              <div className="text-xs text-gray-500">payment@{businessName.toLowerCase().replace(/\s+/g, '')}.com</div>
            </div>
          </div>
          <div className="text-xs text-gray-400">Just now</div>
        </div>
        <div className="text-sm">
          <span className="text-gray-500">To:</span> <span className="font-medium">customer@example.com</span>
        </div>
      </div>

      {/* Email Subject */}
      <div className="px-6 py-4 bg-white border-b border-gray-100">
        <h3 className="font-bold text-lg">{subject}</h3>
      </div>

      {/* Email Body */}
      <div className="px-6 py-6 bg-white">
        <div className="prose prose-sm max-w-none">
          <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">{body}</p>
        </div>

        {/* Mock Payment Button */}
        <div className="mt-6">
          <button className="px-6 py-3 bg-revnu-green text-revnu-dark font-bold rounded-lg hover:bg-revnu-greenLight transition-all">
            Pay Invoice Now
          </button>
        </div>
      </div>

      {/* Email Footer */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 text-xs text-gray-500">
        <p>Reply STOP to unsubscribe from payment reminders</p>
      </div>
    </div>
  );
}
