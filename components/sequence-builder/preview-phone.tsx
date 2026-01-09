"use client";

interface PreviewPhoneProps {
  message: string;
  businessName: string;
}

export default function PreviewPhone({ message, businessName }: PreviewPhoneProps) {
  return (
    <div className="relative mx-auto" style={{ width: "320px" }}>
      {/* iPhone Frame */}
      <div className="relative bg-gray-900 rounded-[3rem] p-3 shadow-2xl border-8 border-gray-800">
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-gray-900 rounded-b-2xl z-10"></div>

        {/* Screen */}
        <div className="bg-gray-100 rounded-[2.5rem] h-[600px] overflow-hidden">
          {/* Status Bar */}
          <div className="bg-white px-6 py-3 flex items-center justify-between text-xs">
            <span className="font-semibold">9:41</span>
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z"/>
              </svg>
            </div>
          </div>

          {/* Messages Header */}
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-revnu-green to-revnu-greenDark rounded-full flex items-center justify-center text-white font-bold">
                {businessName.charAt(0)}
              </div>
              <div>
                <div className="font-semibold text-sm">{businessName}</div>
                <div className="text-xs text-gray-500">Text Message</div>
              </div>
            </div>
          </div>

          {/* Message Bubbles */}
          <div className="p-4 space-y-4 bg-gray-50 h-full overflow-y-auto">
            <div className="flex justify-start">
              <div className="max-w-[85%]">
                <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                  <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                    {message}
                  </p>
                </div>
                <div className="text-xs text-gray-400 mt-1 px-2">Just now</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
