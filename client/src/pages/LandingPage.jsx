import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  BriefcaseBusiness,
  Bot,
  KanbanSquare,
  Sparkles,
  Mic,
  BarChart3,
  Mail,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Zap,
  Target,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LandingPage = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleStartInterview = () => {
    navigate(isAuthenticated ? '/interview' : '/login?redirect=/interview');
  };

  const handleTrackApps = () => {
    navigate(isAuthenticated ? '/applications' : '/login?redirect=/applications');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col selection:bg-blue-100 selection:text-blue-900">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <BriefcaseBusiness className="w-5 h-5" />
            </div>
            <div className="font-bold text-slate-900 text-lg tracking-tight">
              CareerPilot <span className="text-xs px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 font-semibold">AI</span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a href="#features" className="hover:text-blue-600 transition-colors">Features</a>
            <a href="#modules" className="hover:text-blue-600 transition-colors">How It Works</a>
            <a href="#testimonials" className="hover:text-blue-600 transition-colors">Success Stories</a>
          </nav>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-all shadow-xs"
              >
                <span>Go to Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-all shadow-xs"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 lg:pt-24 lg:pb-32 overflow-hidden">
        <div className="absolute inset-0 -z-10 flex items-center justify-center">
          <div className="w-[600px] h-[600px] bg-gradient-to-tr from-blue-200/40 via-indigo-100/30 to-purple-200/40 rounded-full blur-3xl" />
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
          {/* Pill Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 text-xs font-semibold mb-6 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Next-Gen Career Acceleration Powered by Google Gemini</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
            Prepare smarter. Apply better.{' '}
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Get hired.
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            CareerPilot AI combines an <strong>AI Mock Interview Coach</strong> with an intuitive <strong>Job Application Kanban Tracker</strong>. Practice voice-enabled interviews with instant feedback and manage your entire application pipeline in one unified platform.
          </p>

          {/* Action Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <button
              onClick={handleStartInterview}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-md shadow-blue-500/20 transition-all hover:-translate-y-0.5"
            >
              <Bot className="w-4 h-4" />
              <span>Start Mock Interview</span>
            </button>

            <button
              onClick={handleTrackApps}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-semibold text-sm border border-slate-200 shadow-2xs transition-all hover:-translate-y-0.5"
            >
              <KanbanSquare className="w-4 h-4 text-slate-600" />
              <span>Track Applications</span>
            </button>
          </div>

          {/* Social Proof Stats */}
          <div className="mt-12 pt-8 border-t border-slate-200/60 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto text-left">
            <div className="p-3 bg-white/60 backdrop-blur-xs rounded-xl border border-slate-200/60">
              <div className="text-2xl font-black text-slate-900">100%</div>
              <div className="text-xs text-slate-500 mt-0.5">Real Drag-and-Drop</div>
            </div>
            <div className="p-3 bg-white/60 backdrop-blur-xs rounded-xl border border-slate-200/60">
              <div className="text-2xl font-black text-blue-600">Speech-to-Text</div>
              <div className="text-xs text-slate-500 mt-0.5">Web Speech API Voice</div>
            </div>
            <div className="p-3 bg-white/60 backdrop-blur-xs rounded-xl border border-slate-200/60">
              <div className="text-2xl font-black text-indigo-600">Gemini AI</div>
              <div className="text-xs text-slate-500 mt-0.5">Instant Deep Feedback</div>
            </div>
            <div className="p-3 bg-white/60 backdrop-blur-xs rounded-xl border border-slate-200/60">
              <div className="text-2xl font-black text-emerald-600">Cold Emails</div>
              <div className="text-xs text-slate-500 mt-0.5">Automated Outreach</div>
            </div>
          </div>
        </div>
      </section>

      {/* Dual Core Modules Showcase */}
      <section id="modules" className="py-16 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-xs font-bold text-blue-600 uppercase tracking-wider">Two Modules. One Platform.</h2>
            <p className="mt-2 text-3xl font-extrabold text-slate-900 tracking-tight">
              Everything you need from prep to offer
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Module 1: Mock Interview */}
            <div className="p-8 rounded-2xl bg-gradient-to-br from-indigo-50/50 to-white border border-indigo-100/80 shadow-xs flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center mb-6 shadow-md shadow-indigo-500/20">
                  <Bot className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Module 1: AI Mock Interview Coach</h3>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                  Practice one question at a time for roles like Frontend, Backend, Full Stack, Software Engineer, or custom Job Descriptions. Speak your answers via voice or type them, then get instantaneous scores on relevance, technical accuracy, and communication.
                </p>

                <ul className="mt-6 space-y-3 text-xs text-slate-700">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span>Role-tailored technical & behavioral question banks</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span>Live speech-to-text voice answer recording</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span>Final comprehensive report with strong areas and study topics</span>
                  </li>
                </ul>
              </div>

              <div className="mt-8 pt-6 border-t border-indigo-100">
                <button
                  onClick={handleStartInterview}
                  className="flex items-center gap-2 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
                >
                  <span>Launch Mock Interview</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Module 2: Job Application Tracker */}
            <div className="p-8 rounded-2xl bg-gradient-to-br from-blue-50/50 to-white border border-blue-100/80 shadow-xs flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center mb-6 shadow-md shadow-blue-500/20">
                  <KanbanSquare className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Module 2: Job Application Kanban Tracker</h3>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                  Never lose track of an opportunity. Organize your applications across Wishlist, Applied, Interview, Offer, and Rejected columns with smooth drag-and-drop. Set follow-up alerts and generate high-converting cold outreach emails.
                </p>

                <ul className="mt-6 space-y-3 text-xs text-slate-700">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>Real-time interactive Kanban board with dnd-kit</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>Automated follow-up scheduling and overdue indicators</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>1-click AI Cold Email generator customized to recruiters</span>
                  </li>
                </ul>
              </div>

              <div className="mt-8 pt-6 border-t border-blue-100">
                <button
                  onClick={handleTrackApps}
                  className="flex items-center gap-2 text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors"
                >
                  <span>View Application Board</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Features Built for Candidates</h2>
            <p className="mt-2 text-3xl font-extrabold text-slate-900 tracking-tight">
              Powerful tools designed to accelerate your career
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-2xs hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                <Bot className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900 text-base">AI Mock Interviews</h4>
              <p className="mt-2 text-xs text-slate-500 leading-relaxed">
                Generate realistic interview questions calibrated to specific tech stacks and seniority levels using Google Gemini.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-2xs hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4">
                <Mic className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900 text-base">Voice & Text Input</h4>
              <p className="mt-2 text-xs text-slate-500 leading-relaxed">
                Simulate real interview conditions by speaking aloud with browser-native Web Speech API speech-to-text recognition.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-2xs hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                <Target className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900 text-base">Instant AI Feedback</h4>
              <p className="mt-2 text-xs text-slate-500 leading-relaxed">
                Get scored on relevance, technical correctness, and clarity after every answer with actionable tips for improvement.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-2xs hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
                <KanbanSquare className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900 text-base">Job Application Kanban</h4>
              <p className="mt-2 text-xs text-slate-500 leading-relaxed">
                Effortlessly manage application stages with real drag-and-drop functionality and detailed tracking records.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-2xs hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
                <Mail className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900 text-base">AI Cold Email Generator</h4>
              <p className="mt-2 text-xs text-slate-500 leading-relaxed">
                Craft human-sounding, high-converting recruiter cold emails personalized with your background and target role.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-2xs hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900 text-base">Application Analytics</h4>
              <p className="mt-2 text-xs text-slate-500 leading-relaxed">
                Visualize pipeline conversion rates, weekly application volume, and interview score trends with interactive charts.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Footer Banner */}
      <section className="py-16 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Ready to ace your next technical interview?
          </h2>
          <p className="mt-4 text-blue-100 text-sm sm:text-base max-w-xl mx-auto">
            Join candidates using CareerPilot AI to practice mock questions and organize their dream job applications.
          </p>
          <div className="mt-8 flex justify-center">
            <button
              onClick={() => navigate('/register')}
              className="px-8 py-3.5 rounded-xl bg-white text-blue-700 font-bold text-sm shadow-lg hover:bg-blue-50 transition-all hover:-translate-y-0.5"
            >
              Create Free Account
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 text-xs py-10 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-xs">
              <BriefcaseBusiness className="w-3.5 h-3.5" />
            </div>
            <span className="text-slate-200 font-semibold">CareerPilot AI</span>
            <span>© {new Date().getFullYear()} All rights reserved.</span>
          </div>
          <div className="flex items-center gap-6">
            <span>Prepare smarter. Apply better. Get hired.</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
