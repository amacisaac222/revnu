'use client';

import { useState } from 'react';
import { Sparkles, Save, Eye, X, Loader2, Mail, MessageSquare } from 'lucide-react';

interface MessageEditorProps {
  channel: 'sms' | 'email';
  initialContent: {
    sms?: string;
    emailSubject?: string;
    emailBody?: string;
  };
  invoiceData: {
    customerName: string;
    invoiceNumber: string;
    amountDue: string;
    daysPastDue: number;
  };
  onSave: (content: { sms?: string; emailSubject?: string; emailBody?: string }) => void;
  onCancel: () => void;
  onSaveAsTemplate?: (name: string, content: { sms?: string; emailSubject?: string; emailBody?: string }) => void;
}

export default function MessageEditor({
  channel,
  initialContent,
  invoiceData,
  onSave,
  onCancel,
  onSaveAsTemplate,
}: MessageEditorProps) {
  const [content, setContent] = useState(initialContent);
  const [showPreview, setShowPreview] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [showSaveTemplate, setShowSaveTemplate] = useState(false);
  const [templateName, setTemplateName] = useState('');

  const variables = [
    { key: '{{customerName}}', label: 'Customer Name', value: invoiceData.customerName },
    { key: '{{invoiceNumber}}', label: 'Invoice #', value: invoiceData.invoiceNumber },
    { key: '{{amountDue}}', label: 'Amount Due', value: invoiceData.amountDue },
    { key: '{{daysPastDue}}', label: 'Days Past Due', value: invoiceData.daysPastDue.toString() },
    { key: '{{paymentLink}}', label: 'Payment Link', value: 'pay.revnu.com/abc123' },
  ];

  const insertVariable = (variableKey: string, field: 'sms' | 'emailSubject' | 'emailBody') => {
    const currentValue = content[field] || '';
    setContent({
      ...content,
      [field]: currentValue + ' ' + variableKey,
    });
  };

  const fillVariables = (text: string) => {
    let filled = text;
    variables.forEach(v => {
      filled = filled.replace(new RegExp(v.key.replace(/[{}]/g, '\\$&'), 'g'), v.value);
    });
    return filled;
  };

  const handleAIEnhance = async (tone: 'friendly' | 'firm' | 'urgent') => {
    setAiLoading(true);
    try {
      const response = await fetch('/api/messages/enhance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channel,
          content: channel === 'sms' ? content.sms : {
            subject: content.emailSubject,
            body: content.emailBody,
          },
          tone,
          invoiceData,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        if (channel === 'sms') {
          setContent({ ...content, sms: data.content });
        } else {
          setContent({
            ...content,
            emailSubject: data.content.subject,
            emailBody: data.content.body,
          });
        }
      }
    } catch (error) {
      console.error('AI enhancement failed:', error);
    } finally {
      setAiLoading(false);
    }
  };

  const handleSaveAsTemplate = async () => {
    if (!templateName.trim() || !onSaveAsTemplate) return;

    await onSaveAsTemplate(templateName, content);
    setShowSaveTemplate(false);
    setTemplateName('');
  };

  const characterCount = channel === 'sms' ? (content.sms?.length || 0) : 0;
  const messageCount = Math.ceil(characterCount / 160);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-revnu-dark border-2 border-revnu-green/30 rounded-xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-revnu-green/10">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-black text-white flex items-center gap-2">
                {channel === 'sms' ? <MessageSquare className="w-6 h-6" /> : <Mail className="w-6 h-6" />}
                Customize {channel === 'sms' ? 'SMS' : 'Email'} Message
              </h3>
              <p className="text-revnu-gray text-sm mt-1">
                For: {invoiceData.customerName} • {invoiceData.invoiceNumber} • ${invoiceData.amountDue}
              </p>
            </div>
            <button
              onClick={onCancel}
              className="p-2 hover:bg-revnu-slate/40 rounded-lg transition"
            >
              <X className="w-6 h-6 text-revnu-gray" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Editor Side */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-bold text-white">Edit Message</h4>
                <div className="flex items-center gap-2">
                  {aiLoading ? (
                    <div className="flex items-center gap-2 text-revnu-gray">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm">AI enhancing...</span>
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={() => handleAIEnhance('friendly')}
                        className="px-3 py-1.5 bg-revnu-green/10 border border-revnu-green/30 text-revnu-green text-xs font-bold rounded hover:bg-revnu-green/20 transition flex items-center gap-1"
                      >
                        <Sparkles className="w-3 h-3" />
                        Friendly
                      </button>
                      <button
                        onClick={() => handleAIEnhance('firm')}
                        className="px-3 py-1.5 bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs font-bold rounded hover:bg-orange-500/20 transition flex items-center gap-1"
                      >
                        <Sparkles className="w-3 h-3" />
                        Firm
                      </button>
                      <button
                        onClick={() => handleAIEnhance('urgent')}
                        className="px-3 py-1.5 bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold rounded hover:bg-red-500/20 transition flex items-center gap-1"
                      >
                        <Sparkles className="w-3 h-3" />
                        Urgent
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Variables */}
              <div>
                <label className="block text-sm font-bold text-white mb-2">Insert Variables:</label>
                <div className="flex flex-wrap gap-2">
                  {variables.map(v => (
                    <button
                      key={v.key}
                      onClick={() => insertVariable(v.key, channel === 'sms' ? 'sms' : 'emailBody')}
                      className="px-2 py-1 bg-revnu-dark border border-revnu-green/20 text-revnu-green text-xs rounded hover:border-revnu-green/40 transition"
                    >
                      {v.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Email Subject */}
              {channel === 'email' && (
                <div>
                  <label className="block text-sm font-bold text-white mb-2">Subject:</label>
                  <input
                    type="text"
                    value={content.emailSubject || ''}
                    onChange={(e) => setContent({ ...content, emailSubject: e.target.value })}
                    className="w-full px-4 py-2 bg-revnu-dark border border-revnu-green/30 rounded-lg text-white focus:outline-none focus:border-revnu-green"
                    placeholder="Email subject line..."
                  />
                </div>
              )}

              {/* Message Body */}
              <div>
                <label className="block text-sm font-bold text-white mb-2">
                  {channel === 'sms' ? 'SMS Message:' : 'Email Body:'}
                </label>
                <textarea
                  value={channel === 'sms' ? (content.sms || '') : (content.emailBody || '')}
                  onChange={(e) => setContent(
                    channel === 'sms'
                      ? { ...content, sms: e.target.value }
                      : { ...content, emailBody: e.target.value }
                  )}
                  rows={channel === 'sms' ? 6 : 12}
                  className="w-full px-4 py-3 bg-revnu-dark border border-revnu-green/30 rounded-lg text-white focus:outline-none focus:border-revnu-green font-mono text-sm"
                  placeholder={channel === 'sms' ? 'Your SMS message...' : 'Your email message...'}
                />
                {channel === 'sms' && (
                  <div className="flex items-center justify-between mt-2 text-xs">
                    <span className={`font-bold ${characterCount > 160 ? 'text-orange-400' : 'text-revnu-gray'}`}>
                      {characterCount} characters
                    </span>
                    <span className="text-revnu-gray">
                      {messageCount} message{messageCount !== 1 ? 's' : ''}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Preview Side */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-bold text-white">Live Preview</h4>
                <button
                  onClick={() => setShowPreview(!showPreview)}
                  className="text-sm font-bold text-revnu-green hover:text-revnu-greenLight transition flex items-center gap-1"
                >
                  <Eye className="w-4 h-4" />
                  {showPreview ? 'Hide' : 'Show'}
                </button>
              </div>

              {showPreview && (
                <>
                  {channel === 'sms' ? (
                    /* SMS Phone Mockup */
                    <div className="bg-revnu-darker border-2 border-revnu-green/20 rounded-3xl p-6 max-w-sm mx-auto shadow-xl">
                      <div className="bg-revnu-dark rounded-2xl p-4 shadow-inner">
                        <div className="text-xs text-revnu-gray mb-2">Your Business</div>
                        <div className="bg-revnu-green/20 text-white p-3 rounded-2xl rounded-tl-sm text-sm whitespace-pre-wrap">
                          {fillVariables(content.sms || '')}
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Email Preview */
                    <div className="bg-revnu-darker border-2 border-revnu-green/20 rounded-lg overflow-hidden">
                      <div className="bg-revnu-dark/50 border-b border-revnu-green/10 p-4">
                        <div className="text-xs text-revnu-gray mb-1">Subject:</div>
                        <div className="text-sm font-bold text-white">
                          {fillVariables(content.emailSubject || 'No subject')}
                        </div>
                      </div>
                      <div className="p-4 text-sm text-revnu-gray/90 whitespace-pre-wrap">
                        {fillVariables(content.emailBody || '')}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-revnu-green/10 flex items-center justify-between">
          <div>
            {onSaveAsTemplate && !showSaveTemplate && (
              <button
                onClick={() => setShowSaveTemplate(true)}
                className="px-4 py-2 bg-revnu-dark border border-revnu-green/30 text-revnu-green font-bold rounded-lg hover:bg-revnu-dark/50 transition flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Save as Template
              </button>
            )}
            {showSaveTemplate && (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="Template name..."
                  className="px-3 py-2 bg-revnu-dark border border-revnu-green/30 rounded-lg text-white focus:outline-none focus:border-revnu-green"
                />
                <button
                  onClick={handleSaveAsTemplate}
                  disabled={!templateName.trim()}
                  className="px-4 py-2 bg-revnu-green text-revnu-dark font-bold rounded-lg hover:bg-revnu-greenLight transition disabled:opacity-50"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setShowSaveTemplate(false);
                    setTemplateName('');
                  }}
                  className="px-4 py-2 text-revnu-gray hover:text-white transition"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onCancel}
              className="px-6 py-2 bg-revnu-slate/40 text-white font-bold rounded-lg hover:bg-revnu-slate/60 transition"
            >
              Cancel
            </button>
            <button
              onClick={() => onSave(content)}
              className="px-6 py-2 bg-revnu-green text-revnu-dark font-bold rounded-lg hover:bg-revnu-greenLight transition"
            >
              Send Message
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
