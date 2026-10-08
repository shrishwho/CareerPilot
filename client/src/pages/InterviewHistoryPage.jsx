import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  History,
  Bot,
  Award,
  Calendar,
  ChevronRight,
  Sparkles,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  FileText,
  RotateCcw,
} from 'lucide-react';
import { interviewApi } from '../services/api';
import { useToast } from '../context/ToastContext';
import { Modal } from '../components/Modal';

export const InterviewHistoryPage = () => {
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const fetchInterviews = async () => {
    try {
      setLoading(true);
      const res = await interviewApi.getAll();
      if (res.data.success) {
        setInterviews(res.data.interviews || []);
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to load interview history', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInterviews();
  }, []);

  const handleOpenInterview = async (id) => {
    setIsModalOpen(true);
    setLoadingDetails(true);
    try {
      const res = await interviewApi.getById(id);
      if (res.data.success) {
        setSelectedInterview(res.data.interview);
      }
    } catch (err) {
      showToast('Failed to load interview details', 'error');
      setIsModalOpen(false);
    } finally {
      setLoadingDetails(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <History className="w-5 h-5 text-indigo-600" />
            <span>AI Mock Interview History</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Review past mock sessions, AI evaluations, and personalized study recommendations.
          </p>
        </div>

        <button
          onClick={() => navigate('/interview')}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-all"
        >
          <Bot className="w-4 h-4" />
          <span>New Mock Session</span>
        </button>
      </div>

      {/* Interviews Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-44 bg-white rounded-2xl border border-slate-200 animate-pulse" />
          ))}
        </div>
      ) : interviews.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
            <Bot className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-base text-slate-900">No mock interview history yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Take your first AI mock interview to receive real-time answers evaluation and a performance report.
          </p>
          <button
            onClick={() => navigate('/interview')}
            className="mt-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs shadow-xs hover:bg-indigo-700 transition-colors inline-flex items-center gap-2"
          >
            <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
            <span>Start First Mock Interview</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {interviews.map((session) => {
            const overallScore = session.scores?.overall || session.finalReport?.overallScore || 0;
            return (
              <div
                key={session._id}
                onClick={() => handleOpenInterview(session._id)}
                className="group bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs hover:shadow-md hover:border-indigo-300 transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs">
                      <Bot className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-black px-2.5 py-1 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                      {overallScore}%
                    </span>
                  </div>

                  <h3 className="mt-3 font-bold text-base text-slate-900 group-hover:text-indigo-600 transition-colors">
                    {session.role}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {session.interviewType} Interview
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>
                      {new Date(session.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-indigo-600 font-semibold text-[11px]">
                    <span>View Report</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Complete Report Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Complete Mock Interview Report"
        maxWidth="max-w-3xl"
      >
        {loadingDetails || !selectedInterview ? (
          <div className="py-12 flex flex-col items-center justify-center space-y-3">
            <div className="w-8 h-8 rounded-full border-3 border-indigo-200 border-t-indigo-600 animate-spin" />
            <p className="text-xs text-slate-500">Loading interview details...</p>
          </div>
        ) : (
          <div className="space-y-6 max-h-[75vh] overflow-y-auto pr-2">
            {/* Header info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-xl font-bold text-slate-900">{selectedInterview.role}</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Type: {selectedInterview.interviewType} • Date:{' '}
                  {new Date(selectedInterview.createdAt).toLocaleDateString()}
                </p>
              </div>

              <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-200 px-4 py-2 rounded-xl">
                <Award className="w-5 h-5 text-indigo-600" />
                <span className="text-lg font-black text-indigo-900">
                  {selectedInterview.scores?.overall || selectedInterview.finalReport?.overallScore || 0}%
                </span>
              </div>
            </div>

            {/* Score Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400">Overall</span>
                <p className="text-lg font-bold text-slate-900">
                  {selectedInterview.scores?.overall || selectedInterview.finalReport?.overallScore || 0}%
                </p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400">Technical</span>
                <p className="text-lg font-bold text-blue-600">
                  {selectedInterview.scores?.technical || selectedInterview.finalReport?.technicalScore || 0}%
                </p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400">Communication</span>
                <p className="text-lg font-bold text-purple-600">
                  {selectedInterview.scores?.communication || selectedInterview.finalReport?.communicationScore || 0}%
                </p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400">Confidence</span>
                <p className="text-lg font-bold text-emerald-600">
                  {selectedInterview.scores?.confidence || selectedInterview.finalReport?.confidenceScore || 0}%
                </p>
              </div>
            </div>

            {/* Summary */}
            {selectedInterview.finalReport?.summary && (
              <div className="p-3.5 bg-indigo-50/60 rounded-xl border border-indigo-100 text-xs text-indigo-950">
                <span className="font-bold">Executive Summary: </span>
                {selectedInterview.finalReport.summary}
              </div>
            )}

            {/* Strong & Weak Areas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200">
                <h4 className="font-bold text-emerald-900 mb-2 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Strong Areas</span>
                </h4>
                <ul className="space-y-1 list-disc list-inside text-emerald-800">
                  {selectedInterview.finalReport?.strongAreas?.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-200">
                <h4 className="font-bold text-amber-900 mb-2 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  <span>Areas for Improvement</span>
                </h4>
                <ul className="space-y-1 list-disc list-inside text-amber-800">
                  {selectedInterview.finalReport?.weakAreas?.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Q&A Breakdown */}
            {selectedInterview.answers?.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-slate-500" />
                  <span>Questions & Evaluated Answers</span>
                </h4>

                <div className="space-y-3">
                  {selectedInterview.answers.map((qa, i) => (
                    <div
                      key={i}
                      className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-bold text-slate-900">
                          Q{i + 1}: {qa.question}
                        </span>
                        <span className="font-black px-2 py-0.5 rounded bg-indigo-100 text-indigo-700 shrink-0">
                          {qa.score}/10
                        </span>
                      </div>

                      <div className="text-slate-700 bg-white p-2.5 rounded-lg border border-slate-200 font-mono text-[11px] whitespace-pre-wrap">
                        {qa.answer || '(No answer recorded)'}
                      </div>

                      {qa.feedback && (
                        <p className="text-slate-600">
                          <span className="font-semibold text-slate-800">Feedback: </span>
                          {qa.feedback}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};
