import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BriefcaseBusiness,
  Bot,
  KanbanSquare,
  Sparkles,
  Plus,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  Calendar,
  Award,
  TrendingUp,
  FileCheck,
  ChevronRight,
  ExternalLink,
  Target,
  Zap,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  LineChart,
  Line,
  CartesianGrid,
} from 'recharts';
import { applicationApi, interviewApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ApplicationModal } from '../components/ApplicationModal';
import { ColdEmailModal } from '../components/ColdEmailModal';

const STATUS_COLORS = {
  Wishlist: '#94a3b8',
  Applied: '#3b82f6',
  Interview: '#a855f7',
  Offer: '#10b981',
  Rejected: '#f43f5e',
};

export const Dashboard = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [applications, setApplications] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isColdEmailModalOpen, setIsColdEmailModalOpen] = useState(false);
  const [selectedAppForEmail, setSelectedAppForEmail] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [appRes, intRes] = await Promise.all([
        applicationApi.getAll(),
        interviewApi.getAll(),
      ]);

      if (appRes.data.success) {
        setApplications(appRes.data.applications || []);
      }
      if (intRes.data.success) {
        setInterviews(intRes.data.interviews || []);
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      showToast('Failed to load dashboard data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSaveApplication = async (formData) => {
    try {
      const res = await applicationApi.create(formData);
      if (res.data.success) {
        showToast('Application added successfully!', 'success');
        setIsAddModalOpen(false);
        fetchData();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to add application', 'error');
    }
  };

  // Calculations for Application Cards
  const totalApps = applications.length;
  const appliedCount = applications.filter((a) => a.status === 'Applied').length;
  const interviewCount = applications.filter((a) => a.status === 'Interview').length;
  const offerCount = applications.filter((a) => a.status === 'Offer').length;
  const rejectedCount = applications.filter((a) => a.status === 'Rejected').length;

  // Calculations for Interview Cards
  const totalInterviews = interviews.length;
  const scoresArray = interviews.map((i) => i.scores?.overall || i.finalReport?.overallScore || 0);
  const avgScore =
    scoresArray.length > 0
      ? Math.round(scoresArray.reduce((a, b) => a + b, 0) / scoresArray.length)
      : 0;
  const bestScore = scoresArray.length > 0 ? Math.max(...scoresArray) : 0;

  // Chart Data: Status Breakdown
  const statusChartData = [
    { name: 'Wishlist', value: applications.filter((a) => a.status === 'Wishlist').length },
    { name: 'Applied', value: appliedCount },
    { name: 'Interview', value: interviewCount },
    { name: 'Offer', value: offerCount },
    { name: 'Rejected', value: rejectedCount },
  ].filter((item) => item.value > 0);

  // Chart Data: Interview Score Progress
  const scoreProgressData = [...interviews]
    .reverse()
    .slice(-7)
    .map((item, idx) => ({
      name: `Session ${idx + 1}`,
      score: item.scores?.overall || item.finalReport?.overallScore || 0,
      role: item.role,
    }));

  // Follow-ups list
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingFollowUps = applications
    .filter((a) => a.followUpDate)
    .map((app) => {
      const fDate = new Date(app.followUpDate);
      fDate.setHours(0, 0, 0, 0);
      const diff = Math.round((fDate - today) / (1000 * 60 * 60 * 24));
      let status = 'upcoming';
      if (diff < 0) status = 'overdue';
      else if (diff === 0) status = 'today';
      return { ...app, diff, followUpStatus: status };
    })
    .sort((a, b) => new Date(a.followUpDate) - new Date(b.followUpDate))
    .slice(0, 5);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Banner & Top Quick Action Buttons */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl p-6 sm:p-8 text-white shadow-md shadow-blue-500/10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-xs text-xs font-semibold mb-3 border border-white/20">
            <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
            <span>AI Powered Career Cockpit</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            Welcome back, {user?.name || 'Candidate'}!
          </h2>
          <p className="mt-1.5 text-xs sm:text-sm text-blue-100 max-w-xl leading-relaxed">
            Targeting <strong>{user?.targetRole || 'Full Stack Developer'}</strong>. You have{' '}
            <strong>{interviewCount} active interview rounds</strong> and{' '}
            <strong>{upcomingFollowUps.length} follow-up reminders</strong> pending.
          </p>
        </div>

        {/* 3 Main Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => navigate('/interview')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-indigo-700 hover:bg-indigo-50 font-bold text-xs shadow-md transition-all hover:-translate-y-0.5"
          >
            <Bot className="w-4 h-4 text-indigo-600" />
            <span>Start Mock Interview</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-500/40 hover:bg-blue-500/60 text-white font-bold text-xs border border-white/30 backdrop-blur-xs transition-all hover:-translate-y-0.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Application</span>
          </button>

          <button
            onClick={() => {
              setSelectedAppForEmail(applications[0] || null);
              setIsColdEmailModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-500/40 hover:bg-purple-500/60 text-white font-bold text-xs border border-white/30 backdrop-blur-xs transition-all hover:-translate-y-0.5"
          >
            <Sparkles className="w-4 h-4 text-yellow-300" />
            <span>Generate Cold Email</span>
          </button>
        </div>
      </div>

      {/* Row 1: Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Applications */}
        <div
          onClick={() => navigate('/applications')}
          className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Total Applications</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <BriefcaseBusiness className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-black text-slate-900">{totalApps}</span>
            <span className="text-[11px] font-bold text-blue-600 flex items-center">
              View Board <ChevronRight className="w-3 h-3" />
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Applied: {appliedCount}</span>
            <span className="font-semibold text-purple-600">Interviews: {interviewCount}</span>
          </div>
        </div>

        {/* Offers & Rejections */}
        <div
          onClick={() => navigate('/applications')}
          className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Offers & Outcomes</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-black text-emerald-600">{offerCount} Offers</span>
            <span className="text-[11px] font-bold text-rose-500">{rejectedCount} Rejected</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>
              Win Rate: {totalApps > 0 ? Math.round((offerCount / totalApps) * 100) : 0}%
            </span>
            <span className="text-slate-400">{applications.filter((a) => a.status === 'Wishlist').length} Wishlist</span>
          </div>
        </div>

        {/* Interviews Completed */}
        <div
          onClick={() => navigate('/history')}
          className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>AI Mock Interviews</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Bot className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-black text-slate-900">{totalInterviews}</span>
            <span className="text-[11px] font-bold text-indigo-600 flex items-center">
              History <ChevronRight className="w-3 h-3" />
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Sessions Completed</span>
            <span className="font-semibold text-indigo-600">Gemini Evaluated</span>
          </div>
        </div>

        {/* Score Card */}
        <div
          onClick={() => navigate('/analytics')}
          className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Average / Best Score</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-black text-slate-900">{avgScore}%</span>
            <span className="text-xs font-bold text-emerald-600 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200">
              Best: {bestScore}%
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Technical Fluency</span>
            <span className="font-semibold text-blue-600">
              {avgScore >= 80 ? 'Interview Ready' : avgScore >= 60 ? 'Improving' : 'Needs Practice'}
            </span>
          </div>
        </div>
      </div>

      {/* Row 2: Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Applications By Status */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-sm text-slate-900">Application Pipeline Status</h3>
              <p className="text-[11px] text-slate-400">Distribution across active Kanban stages</p>
            </div>
            <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
              {totalApps} Total
            </span>
          </div>

          {statusChartData.length === 0 ? (
            <div className="h-60 flex flex-col items-center justify-center text-xs text-slate-400">
              <KanbanSquare className="w-8 h-8 mb-2 text-slate-300" />
              <span>No applications added yet</span>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="mt-3 text-xs font-bold text-blue-600 hover:underline"
              >
                + Add your first application
              </button>
            </div>
          ) : (
            <div className="h-60 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {statusChartData.map((entry) => (
                      <Cell key={entry.name} fill={STATUS_COLORS[entry.name] || '#3b82f6'} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '12px',
                      border: 'none',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Legend */}
          <div className="mt-2 flex flex-wrap items-center justify-center gap-4 text-xs">
            {Object.entries(STATUS_COLORS).map(([st, color]) => (
              <div key={st} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                <span className="text-slate-600 font-medium">{st}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Interview Score Progress */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-sm text-slate-900">Interview Score Progress</h3>
              <p className="text-[11px] text-slate-400">Scores across recent mock sessions</p>
            </div>
            <button
              onClick={() => navigate('/interview')}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              <span>Practice Now</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {scoreProgressData.length === 0 ? (
            <div className="h-60 flex flex-col items-center justify-center text-xs text-slate-400">
              <Bot className="w-8 h-8 mb-2 text-slate-300" />
              <span>No mock interviews taken yet</span>
              <button
                onClick={() => navigate('/interview')}
                className="mt-3 px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs shadow-xs"
              >
                Start First AI Mock Session
              </button>
            </div>
          ) : (
            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={scoreProgressData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                  <YAxis domain={[0, 100]} stroke="#94a3b8" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '12px',
                      border: 'none',
                    }}
                    formatter={(val) => [`${val}%`, 'Score']}
                  />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="#6366f1"
                    strokeWidth={3}
                    dot={{ fill: '#6366f1', r: 5 }}
                    activeDot={{ r: 7 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Row 3: Follow-ups, Recent Applications & Recent Interviews */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 1. Upcoming Follow-ups */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-500" />
                <h3 className="font-bold text-sm text-slate-900">Upcoming Follow-ups</h3>
              </div>
              <span className="text-xs font-bold text-slate-500">
                {upcomingFollowUps.length} Scheduled
              </span>
            </div>

            <div className="space-y-2.5">
              {upcomingFollowUps.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400">
                  <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-400 mb-1" />
                  All caught up! No follow-ups pending.
                </div>
              ) : (
                upcomingFollowUps.map((item) => (
                  <div
                    key={item._id}
                    onClick={() => navigate('/applications')}
                    className="p-3 rounded-xl border border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors flex items-center justify-between"
                  >
                    <div className="min-w-0 pr-2">
                      <p className="text-xs font-bold text-slate-800 truncate">{item.company}</p>
                      <p className="text-[11px] text-slate-400 truncate">{item.jobTitle}</p>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                        item.followUpStatus === 'overdue'
                          ? 'bg-rose-100 text-rose-700'
                          : item.followUpStatus === 'today'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {item.followUpStatus === 'overdue'
                        ? 'Overdue'
                        : item.followUpStatus === 'today'
                        ? 'Due Today'
                        : new Date(item.followUpDate).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                          })}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-3 mt-4 border-t border-slate-100">
            <button
              onClick={() => navigate('/applications')}
              className="w-full text-center text-xs font-semibold text-blue-600 hover:text-blue-700"
            >
              Manage all reminders in Kanban
            </button>
          </div>
        </div>

        {/* 2. Recent Applications */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <KanbanSquare className="w-4 h-4 text-blue-600" />
                <h3 className="font-bold text-sm text-slate-900">Recent Applications</h3>
              </div>
              <button
                onClick={() => navigate('/applications')}
                className="text-xs font-semibold text-blue-600 hover:underline"
              >
                View All
              </button>
            </div>

            <div className="space-y-2.5">
              {applications.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400">
                  <BriefcaseBusiness className="w-8 h-8 mx-auto text-slate-300 mb-1" />
                  No applications added yet.
                </div>
              ) : (
                applications.slice(0, 5).map((app) => (
                  <div
                    key={app._id}
                    onClick={() => navigate('/applications')}
                    className="p-3 rounded-xl border border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors flex items-center justify-between"
                  >
                    <div className="min-w-0 pr-2">
                      <p className="text-xs font-bold text-slate-800 truncate">{app.company}</p>
                      <p className="text-[11px] text-slate-400 truncate">{app.jobTitle}</p>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                        app.status === 'Offer'
                          ? 'bg-emerald-100 text-emerald-700'
                          : app.status === 'Interview'
                          ? 'bg-purple-100 text-purple-700'
                          : app.status === 'Rejected'
                          ? 'bg-rose-100 text-rose-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {app.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-3 mt-4 border-t border-slate-100">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="w-full text-center text-xs font-semibold text-blue-600 hover:text-blue-700"
            >
              + Add New Job Opportunity
            </button>
          </div>
        </div>

        {/* 3. Recent Interview Results */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Bot className="w-4 h-4 text-indigo-600" />
                <h3 className="font-bold text-sm text-slate-900">Recent AI Interviews</h3>
              </div>
              <button
                onClick={() => navigate('/history')}
                className="text-xs font-semibold text-indigo-600 hover:underline"
              >
                View All
              </button>
            </div>

            <div className="space-y-2.5">
              {interviews.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400">
                  <Award className="w-8 h-8 mx-auto text-slate-300 mb-1" />
                  No interview sessions recorded.
                </div>
              ) : (
                interviews.slice(0, 5).map((session) => (
                  <div
                    key={session._id}
                    onClick={() => navigate('/history')}
                    className="p-3 rounded-xl border border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors flex items-center justify-between"
                  >
                    <div className="min-w-0 pr-2">
                      <p className="text-xs font-bold text-slate-800 truncate">{session.role}</p>
                      <p className="text-[11px] text-slate-400">
                        {session.interviewType} •{' '}
                        {new Date(session.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                    <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200">
                      {session.scores?.overall || session.finalReport?.overallScore || 0}%
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-3 mt-4 border-t border-slate-100">
            <button
              onClick={() => navigate('/interview')}
              className="w-full text-center text-xs font-semibold text-indigo-600 hover:text-indigo-700"
            >
              Start New Mock Interview Session
            </button>
          </div>
        </div>
      </div>

      {/* Add Application Modal */}
      <ApplicationModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleSaveApplication}
      />

      {/* Cold Email Modal */}
      <ColdEmailModal
        isOpen={isColdEmailModalOpen}
        onClose={() => setIsColdEmailModalOpen(false)}
        application={selectedAppForEmail}
      />
    </div>
  );
};
