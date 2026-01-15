"use client";

import { useEffect, useState } from "react";

interface Message {
  id: string;
  createdAt: string;
  channel: string;
  direction: string;
  status: string;
  subject: string | null;
  body: string;
  sentAt: string | null;
  deliveredAt: string | null;
  failedAt: string | null;
  errorMessage: string | null;
  sentFromNumber: string | null;
  sentFromEmail: string | null;
  isAutomated: boolean;
  customer: {
    id: string;
    firstName: string;
    lastName: string;
    email: string | null;
    phone: string | null;
  };
  invoice: {
    id: string;
    invoiceNumber: string;
    amountDue: number;
    amountRemaining: number;
  } | null;
}

interface MessageDetailModalProps {
  message: Message;
  onClose: () => void;
}

export default function MessageDetailModal({
  message,
  onClose,
}: MessageDetailModalProps) {
  const [relatedMessages, setRelatedMessages] = useState<Message[]>([]);
  const [loadingRelated, setLoadingRelated] = useState(false);

  // Fetch related messages (conversation thread)
  useEffect(() => {
    if (!message.invoice) return;

    setLoadingRelated(true);
    const params = new URLSearchParams({
      customerId: message.customer.id,
      invoiceId: message.invoice.id,
    });

    fetch(`/api/communications?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        // Filter out the current message
        const related = data.messages.filter((m: Message) => m.id !== message.id);
        setRelatedMessages(related);
      })
      .catch((err) => console.error("Error fetching related messages:", err))
      .finally(() => setLoadingRelated(false));
  }, [message.id, message.customer.id, message.invoice?.id]);

  const statusColors = {
    sent: "bg-revnu-green/20 text-revnu-green border-revnu-green/30",
    delivered: "bg-revnu-green/20 text-revnu-green border-revnu-green/30",
    failed: "bg-red-500/20 text-red-400 border-red-500/30",
    pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    queued: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    bounced: "bg-red-500/20 text-red-400 border-red-500/30",
  };

  // Handle click outside modal
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Handle ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  return (
    <div
      onClick={handleBackdropClick}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
    >
      <div className="bg-revnu-darker border border-revnu-green/20 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto my-8">
        {/* Header */}
        <div className="sticky top-0 bg-revnu-darker border-b border-revnu-green/20 p-6 flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-black text-white mb-1">
              Message Details
            </h2>
            <p className="text-sm text-revnu-gray">
              {message.customer.firstName} {message.customer.lastName}
              {message.invoice && ` · ${message.invoice.invoiceNumber}`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-revnu-gray hover:text-white transition text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Message Content */}
        <div className="p-6 space-y-6">
          {/* Status Badge */}
          <div className="flex items-center gap-3 flex-wrap">
            <span
              className={`inline-flex items-center px-3 py-1.5 rounded text-sm font-bold border ${
                statusColors[message.status as keyof typeof statusColors] ||
                "bg-revnu-slate/40 text-revnu-gray border-revnu-green/10"
              }`}
            >
              {message.status}
            </span>
            <span className="inline-flex items-center px-3 py-1.5 rounded text-sm font-bold bg-revnu-slate/40 text-white border border-revnu-green/10 uppercase">
              {message.channel}
            </span>
            <span className="inline-flex items-center px-3 py-1.5 rounded text-sm font-bold bg-revnu-slate/40 text-white border border-revnu-green/10 capitalize">
              {message.direction}
            </span>
            {message.isAutomated && (
              <span className="inline-flex items-center px-3 py-1.5 rounded text-sm font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                🤖 Automated
              </span>
            )}
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-revnu-slate/40 p-4 rounded-lg border border-revnu-green/10">
              <div className="text-xs text-revnu-gray font-bold uppercase tracking-wide mb-1">
                Created At
              </div>
              <div className="text-white font-bold">
                {new Date(message.createdAt).toLocaleString()}
              </div>
            </div>

            {message.sentAt && (
              <div className="bg-revnu-slate/40 p-4 rounded-lg border border-revnu-green/10">
                <div className="text-xs text-revnu-gray font-bold uppercase tracking-wide mb-1">
                  Sent At
                </div>
                <div className="text-white font-bold">
                  {new Date(message.sentAt).toLocaleString()}
                </div>
              </div>
            )}

            {message.deliveredAt && (
              <div className="bg-revnu-slate/40 p-4 rounded-lg border border-revnu-green/10">
                <div className="text-xs text-revnu-gray font-bold uppercase tracking-wide mb-1">
                  Delivered At
                </div>
                <div className="text-white font-bold">
                  {new Date(message.deliveredAt).toLocaleString()}
                </div>
              </div>
            )}

            {message.failedAt && (
              <div className="bg-red-500/10 p-4 rounded-lg border border-red-500/30">
                <div className="text-xs text-red-400 font-bold uppercase tracking-wide mb-1">
                  Failed At
                </div>
                <div className="text-red-400 font-bold">
                  {new Date(message.failedAt).toLocaleString()}
                </div>
              </div>
            )}

            {(message.sentFromNumber || message.sentFromEmail) && (
              <div className="bg-revnu-slate/40 p-4 rounded-lg border border-revnu-green/10">
                <div className="text-xs text-revnu-gray font-bold uppercase tracking-wide mb-1">
                  Sent From
                </div>
                <div className="text-white font-bold">
                  {message.sentFromNumber || message.sentFromEmail}
                </div>
              </div>
            )}

            <div className="bg-revnu-slate/40 p-4 rounded-lg border border-revnu-green/10">
              <div className="text-xs text-revnu-gray font-bold uppercase tracking-wide mb-1">
                Customer Contact
              </div>
              <div className="text-white font-bold">
                {message.customer.email || message.customer.phone || "N/A"}
              </div>
            </div>
          </div>

          {/* Error Message */}
          {message.errorMessage && (
            <div className="bg-red-500/10 p-4 rounded-lg border border-red-500/30">
              <div className="text-xs text-red-400 font-bold uppercase tracking-wide mb-2">
                Error Details
              </div>
              <div className="text-red-400 text-sm">{message.errorMessage}</div>
            </div>
          )}

          {/* Message Content */}
          <div className="bg-revnu-slate/40 p-6 rounded-lg border border-revnu-green/10">
            {message.subject && (
              <>
                <div className="text-xs text-revnu-gray font-bold uppercase tracking-wide mb-2">
                  Subject
                </div>
                <div className="text-white font-bold mb-4">
                  {message.subject}
                </div>
              </>
            )}
            <div className="text-xs text-revnu-gray font-bold uppercase tracking-wide mb-2">
              {message.subject ? "Body" : "Message"}
            </div>
            <div className="text-white whitespace-pre-wrap">{message.body}</div>
          </div>

          {/* Invoice Details */}
          {message.invoice && (
            <div className="bg-revnu-slate/40 p-4 rounded-lg border border-revnu-green/10">
              <div className="text-xs text-revnu-gray font-bold uppercase tracking-wide mb-2">
                Invoice Details
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <div className="text-xs text-revnu-gray mb-1">Number</div>
                  <div className="text-white font-bold">
                    {message.invoice.invoiceNumber}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-revnu-gray mb-1">Total Due</div>
                  <div className="text-white font-bold">
                    ${(message.invoice.amountDue / 100).toFixed(2)}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-revnu-gray mb-1">Remaining</div>
                  <div className="text-white font-bold">
                    ${(message.invoice.amountRemaining / 100).toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Conversation Thread */}
          {message.invoice && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-black text-white">
                  Conversation Thread
                </h3>
                <span className="text-sm text-revnu-gray">
                  {relatedMessages.length} related message
                  {relatedMessages.length !== 1 ? "s" : ""}
                </span>
              </div>

              {loadingRelated ? (
                <div className="text-center py-8 text-revnu-gray">
                  Loading conversation...
                </div>
              ) : relatedMessages.length === 0 ? (
                <div className="bg-revnu-slate/40 p-6 rounded-lg border border-revnu-green/10 text-center text-revnu-gray">
                  This is the only message for this invoice
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                  {relatedMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className="bg-revnu-slate/40 p-4 rounded-lg border border-revnu-green/10 hover:border-revnu-green/30 transition"
                    >
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div>
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded text-xs font-bold border ${
                              statusColors[
                                msg.status as keyof typeof statusColors
                              ] ||
                              "bg-revnu-slate/40 text-revnu-gray border-revnu-green/10"
                            }`}
                          >
                            {msg.status}
                          </span>
                          <span className="ml-2 text-xs text-revnu-gray uppercase font-bold">
                            {msg.channel}
                          </span>
                        </div>
                        <div className="text-xs text-revnu-gray">
                          {new Date(msg.createdAt).toLocaleDateString(
                            undefined,
                            {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </div>
                      </div>
                      <div className="text-sm text-white line-clamp-3">
                        {msg.subject && (
                          <div className="font-bold mb-1">{msg.subject}</div>
                        )}
                        {msg.body}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-revnu-darker border-t border-revnu-green/20 p-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-revnu-slate/40 border border-revnu-green/20 text-white font-bold rounded-lg hover:border-revnu-green transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
