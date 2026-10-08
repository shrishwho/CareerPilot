import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { Sparkles, Copy, Check, RefreshCw, Send, Mail, Building2, User } from 'lucide-react';
import { aiApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const ColdEmailModal = ({
  isOpen,
  onClose,
  application = null,
}) => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const generateEmail = async () => {
    setLoading(true);
    try {
      const res = await aiApi.generateColdEmail({
        applicationId: application?._id,
        applicationData: application,
        customProfile: user,
      });

      if (res.data.success && res.data.email) {
        setSubject(res.data.email.subject || '');
        setBody(res.data.email.body || '');
        showToast('AI Cold Email generated successfully!', 'success');
      }
    } catch (err) {
      console.error('Cold email error:', err);
      showToast('Failed to generate cold email. Using template.', 'warning');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && application) {
      generateEmail();
    } else {
      setSubject('');
      setBody('');
      setCopied(false);
    }
  }, [isOpen, application]);

  const handleCopy = () => {
    const fullText = `Subject: ${subject}\n\n${body}`;
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    showToast('Copied email to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="AI Cold Outreach Email Generator"
      maxWidth="max-w-2xl"
    >
      <div className="space-y-4">
        {/* Context Bar */}
        <div className="p-3 bg-indigo-50/60 border border-indigo-100 rounded-xl flex items-center justify-between text-xs text-indigo-900">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-indigo-600" />
            <span className="font-semibold">{application?.company || 'Company'}</span>
            <span>•</span>
            <span>{application?.jobTitle || 'Target Role'}</span>
          </div>
          {application?.contactPerson && (
            <div className="flex items-center gap-1.5 text-indigo-700 font-medium">
              <User className="w-3.5 h-3.5" />
              <span>To: {application.contactPerson}</span>
            </div>
          )}
        </div>

        {/* Loading State or Result */}
        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center space-y-3">
            <div className="relative">
              <div className="w-12 h-12 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin" />
              <Sparkles className="w-5 h-5 text-indigo-600 absolute inset-0 m-auto" />
            </div>
            <p className="text-xs font-semibold text-slate-600 animate-pulse">
              Gemini AI is crafting your personalized cold email...
            </p>
          </div>
        ) : (
          <>
            {/* Subject Line */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Subject Line
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Subject line..."
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition-all"
              />
            </div>

            {/* Email Body */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email Body
              </label>
              <textarea
                rows={10}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Email content will appear here..."
                className="w-full p-3 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition-all resize-none font-mono"
              />
            </div>

            {/* Action Bar */}
            <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
              <button
                type="button"
                onClick={generateEmail}
                disabled={loading}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors border border-indigo-200"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>Regenerate with Gemini</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Email</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};
