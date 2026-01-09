"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ConsentWarningModal from "./consent-warning-modal";
import MessageTemplateSelector from "@/components/message-template-selector";
import { MessageTemplate } from "@/lib/message-templates";

interface SendReminderButtonProps {
  invoiceId: string;
  invoiceNumber: string;
  customerFirstName: string;
  customerLastName: string;
  canSendSMS: boolean;
  canSendEmail: boolean;
  smsConsentMethod?: string | null;
  smsConsentDate?: Date | null;
  emailConsentGiven?: boolean;
  daysPastDue: number;
  amountRemaining: number;
  dueDate: Date;
  businessName: string;
  businessPhone?: string;
  businessEmail?: string;
}

export default function SendReminderButton({
  invoiceId,
  invoiceNumber,
  customerFirstName,
  customerLastName,
  canSendSMS,
  canSendEmail,
  smsConsentMethod,
  smsConsentDate,
  emailConsentGiven,
  daysPastDue,
  amountRemaining,
  dueDate,
  businessName,
  businessPhone,
  businessEmail,
}: SendReminderButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [pendingChannel, setPendingChannel] = useState<"sms" | "email" | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<MessageTemplate | null>(null);
  const [messageContent, setMessageContent] = useState<{ sms?: string; emailSubject?: string; emailBody?: string } | null>(null);

  const customerName = `${customerFirstName} ${customerLastName}`;

  const showTemplateSelection = (channel: "sms" | "email") => {
    setPendingChannel(channel);
    setShowTemplateSelector(true);
    setShowMenu(false);
  };

  const handleTemplateSelect = (
    template: MessageTemplate,
    filledContent: { sms?: string; emailSubject?: string; emailBody?: string }
  ) => {
    setSelectedTemplate(template);
    setMessageContent(filledContent);
    setShowTemplateSelector(false);
    setShowConsentModal(true);
  };

  const sendReminder = async () => {
    if (!pendingChannel || !messageContent) return;

    setLoading(true);
    setShowConsentModal(false);

    try {
      const response = await fetch(`/api/invoices/${invoiceId}/send-reminder`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channel: pendingChannel,
          templateId: selectedTemplate?.id,
          content: messageContent,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to send reminder");
      }

      alert(`Reminder sent via ${pendingChannel.toUpperCase()} to ${customerName}`);
      router.refresh();
    } catch (error: any) {
      console.error("Error sending reminder:", error);
      alert(error.message || "Failed to send reminder. Please try again.");
    } finally {
      setLoading(false);
      setPendingChannel(null);
      setSelectedTemplate(null);
      setMessageContent(null);
    }
  };

  // If can't send either, show disabled button
  if (!canSendSMS && !canSendEmail) {
    return (
      <button
        disabled
        className="px-4 py-2 bg-gray-600 text-gray-400 font-bold rounded-lg cursor-not-allowed text-center"
        title="Customer has not consented to SMS or Email"
      >
        Send Reminder
      </button>
    );
  }

  // If can only send one type, show direct button
  if (canSendSMS && !canSendEmail) {
    return (
      <>
        <button
          onClick={() => showTemplateSelection("sms")}
          disabled={loading}
          className="px-4 py-2 bg-gradient-to-r from-revnu-green to-revnu-greenDark text-revnu-dark font-black rounded-lg hover:from-revnu-greenLight hover:to-revnu-green transition shadow-lg shadow-revnu-green/20 text-center disabled:opacity-50"
        >
          {loading ? "Sending..." : "Send SMS Reminder"}
        </button>

        {showTemplateSelector && pendingChannel && (
          <MessageTemplateSelector
            channel={pendingChannel}
            daysPastDue={daysPastDue}
            customerFirstName={customerFirstName}
            customerFullName={customerName}
            businessName={businessName}
            invoiceNumber={invoiceNumber}
            invoiceAmount={(amountRemaining / 100).toFixed(2)}
            dueDate={new Date(dueDate).toLocaleDateString()}
            paymentLink={`https://pay.revnu.com/${invoiceId}`}
            businessPhone={businessPhone}
            businessEmail={businessEmail}
            onSelect={handleTemplateSelect}
            onCancel={() => {
              setShowTemplateSelector(false);
              setPendingChannel(null);
            }}
          />
        )}

        {showConsentModal && pendingChannel && (
          <ConsentWarningModal
            channel={pendingChannel}
            customerName={customerName}
            hasConsent={pendingChannel === "sms" ? canSendSMS : !!emailConsentGiven}
            consentMethod={smsConsentMethod}
            consentDate={smsConsentDate}
            onConfirm={sendReminder}
            onCancel={() => {
              setShowConsentModal(false);
              setPendingChannel(null);
              setSelectedTemplate(null);
              setMessageContent(null);
            }}
          />
        )}
      </>
    );
  }

  if (!canSendSMS && canSendEmail) {
    return (
      <>
        <button
          onClick={() => showTemplateSelection("email")}
          disabled={loading}
          className="px-4 py-2 bg-gradient-to-r from-revnu-green to-revnu-greenDark text-revnu-dark font-black rounded-lg hover:from-revnu-greenLight hover:to-revnu-green transition shadow-lg shadow-revnu-green/20 text-center disabled:opacity-50"
        >
          {loading ? "Sending..." : "Send Email Reminder"}
        </button>

        {showTemplateSelector && pendingChannel && (
          <MessageTemplateSelector
            channel={pendingChannel}
            daysPastDue={daysPastDue}
            customerFirstName={customerFirstName}
            customerFullName={customerName}
            businessName={businessName}
            invoiceNumber={invoiceNumber}
            invoiceAmount={(amountRemaining / 100).toFixed(2)}
            dueDate={new Date(dueDate).toLocaleDateString()}
            paymentLink={`https://pay.revnu.com/${invoiceId}`}
            businessPhone={businessPhone}
            businessEmail={businessEmail}
            onSelect={handleTemplateSelect}
            onCancel={() => {
              setShowTemplateSelector(false);
              setPendingChannel(null);
            }}
          />
        )}

        {showConsentModal && pendingChannel && (
          <ConsentWarningModal
            channel={pendingChannel}
            customerName={customerName}
            hasConsent={!!emailConsentGiven}
            onConfirm={sendReminder}
            onCancel={() => {
              setShowConsentModal(false);
              setPendingChannel(null);
              setSelectedTemplate(null);
              setMessageContent(null);
            }}
          />
        )}
      </>
    );
  }

  // Can send both - show dropdown
  return (
    <>
      <div className="relative">
        <button
          onClick={() => setShowMenu(!showMenu)}
          disabled={loading}
          className="px-4 py-2 bg-gradient-to-r from-revnu-green to-revnu-greenDark text-revnu-dark font-black rounded-lg hover:from-revnu-greenLight hover:to-revnu-green transition shadow-lg shadow-revnu-green/20 text-center disabled:opacity-50 w-full sm:w-auto"
        >
          {loading ? "Sending..." : "Send Reminder"}
        </button>

        {showMenu && !loading && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setShowMenu(false)}
            />
            <div className="absolute right-0 mt-2 w-48 bg-revnu-dark border-2 border-revnu-green/30 rounded-lg shadow-lg z-20">
              <button
                onClick={() => showTemplateSelection("sms")}
                className="w-full px-4 py-3 text-left text-white hover:bg-revnu-green/20 transition font-bold text-sm border-b border-revnu-green/10"
              >
                Send via SMS
              </button>
              <button
                onClick={() => showTemplateSelection("email")}
                className="w-full px-4 py-3 text-left text-white hover:bg-revnu-green/20 transition font-bold text-sm"
              >
                Send via Email
              </button>
            </div>
          </>
        )}
      </div>

      {showTemplateSelector && pendingChannel && (
        <MessageTemplateSelector
          channel={pendingChannel}
          daysPastDue={daysPastDue}
          customerFirstName={customerFirstName}
          customerFullName={customerName}
          businessName={businessName}
          invoiceNumber={invoiceNumber}
          invoiceAmount={(amountRemaining / 100).toFixed(2)}
          dueDate={new Date(dueDate).toLocaleDateString()}
          paymentLink={`https://pay.revnu.com/${invoiceId}`}
          businessPhone={businessPhone}
          businessEmail={businessEmail}
          onSelect={handleTemplateSelect}
          onCancel={() => {
            setShowTemplateSelector(false);
            setPendingChannel(null);
          }}
        />
      )}

      {showConsentModal && pendingChannel && (
        <ConsentWarningModal
          channel={pendingChannel}
          customerName={customerName}
          hasConsent={pendingChannel === "sms" ? canSendSMS : !!emailConsentGiven}
          consentMethod={smsConsentMethod}
          consentDate={smsConsentDate}
          onConfirm={sendReminder}
          onCancel={() => {
            setShowConsentModal(false);
            setPendingChannel(null);
            setSelectedTemplate(null);
            setMessageContent(null);
          }}
        />
      )}
    </>
  );
}
