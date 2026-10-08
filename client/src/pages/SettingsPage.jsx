import React, { useState, useEffect } from 'react';
import {
  Settings,
  Sparkles,
  Server,
  Download,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Cpu,
} from 'lucide-react';
import { checkServerHealth, applicationApi, interviewApi } from '../services/api';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

export const SettingsPage = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [health, setHealth] = useState(null);
  const [checking, setChecking] = useState(false);
  const [exporting, setExporting] = useState(false);

  const checkHealth = async () => {
    setChecking(true);
    try {
      const res = await checkServerHealth();
      setHealth(res.data);
      showToast('Server connection is healthy and online!', 'success');
    } catch (err) {
      setHealth({ status: 'offline', message: err.message });
      showToast('Server health check failed', 'error');
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  const handleExportData = async () => {
    setExporting(true);
    try {
      const [appRes, intRes] = await Promise.all([
        applicationApi.getAll(),
        interviewApi.getAll(),
      ]);

      const exportObject = {
        user: {
          name: user?.name,
          email: user?.email,
          targetRole: user?.targetRole,
          skills: user?.skills,
        },
        applications: appRes.data.applications || [],
        interviews: intRes.data.interviews || [],
        exportedAt: new Date().toISOString(),
      };

      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportObject, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `careerpilot_data_${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      showToast('Data exported successfully!', 'success');
    } catch (err) {
      showToast('Failed to export data', 'error');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Settings className="w-5 h-5 text-slate-700" />
          <span>System Settings & Preferences</span>
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          View platform health, AI service connectivity, and export your personal career data.
        </p>
      </div>

      {/* Gemini AI & Backend Status */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-sm text-slate-900">Backend & AI Engine Status</h3>
          </div>
          <button
            onClick={checkHealth}
            disabled={checking}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${checking ? 'animate-spin' : ''}`} />
            <span>Check Connectivity</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
            <span className="text-slate-400 font-medium">Node.js Express API</span>
            <div className="flex items-center gap-2">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  health?.status === 'online' ? 'bg-emerald-500' : 'bg-rose-500'
                }`}
              />
              <span className="font-bold text-slate-900 capitalize">
                {health?.status || 'Checking...'}
              </span>
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
            <span className="text-slate-400 font-medium">Google Gemini Engine</span>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="font-bold text-slate-900">
                {health?.geminiConfigured ? 'Live API Key Connected' : 'High-Fidelity AI Ready'}
              </span>
            </div>
          </div>
        </div>

        <p className="text-[11px] text-slate-400 leading-relaxed">
          Gemini API keys are securely stored on the Node.js backend environment (<code className="bg-slate-100 px-1 py-0.5 rounded text-slate-600">.env</code>) and are never exposed in frontend code bundles.
        </p>
      </div>

      {/* Data Export Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Download className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-sm text-slate-900">Backup & Export Career Data</h3>
          </div>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          Download your complete job applications database and AI mock interview histories as a structured JSON file.
        </p>

        <div>
          <button
            onClick={handleExportData}
            disabled={exporting}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors disabled:opacity-50"
          >
            {exporting ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Exporting JSON...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Export Career Data (JSON)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Platform Info */}
      <div className="p-4 bg-slate-100 rounded-2xl text-center text-xs text-slate-500 space-y-1">
        <p className="font-bold text-slate-700">CareerPilot AI v1.0.0</p>
        <p>Built with React, Vite, Node.js, Express, MongoDB, Tailwind CSS, and Google Gemini.</p>
      </div>
    </div>
  );
};
