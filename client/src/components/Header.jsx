import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Menu,
  Bell,
  Sparkles,
  Plus,
  Bot,
  Calendar,
  CheckCircle2,
  ExternalLink,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { applicationApi } from '../services/api';

export const Header = ({ onMenuClick, title = 'Dashboard', onAddApplication }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [followUps, setFollowUps] = useState([]);

  useEffect(() => {
    const fetchFollowUps = async () => {
      try {
        const res = await applicationApi.getAll();
        if (res.data.success && res.data.applications) {
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          const items = res.data.applications
            .filter((app) => app.followUpDate)
            .map((app) => {
              const fDate = new Date(app.followUpDate);
              fDate.setHours(0, 0, 0, 0);
              const diffDays = Math.round((fDate - today) / (1000 * 60 * 60 * 24));
              let status = 'upcoming';
              if (diffDays < 0) status = 'overdue';
              else if (diffDays === 0) status = 'today';
              return { ...app, diffDays, followUpStatus: status };
            })
            .sort((a, b) => new Date(a.followUpDate) - new Date(b.followUpDate));

          setFollowUps(items);
        }
      } catch (e) {
        // silent fail for header
      }
    };

    fetchFollowUps();
  }, []);

  const urgentCount = followUps.filter(
    (f) => f.followUpStatus === 'today' || f.followUpStatus === 'overdue'
  ).length;

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="p-2 -ml-2 rounded-lg text-slate-500 hover:bg-slate-100 lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-lg font-bold text-slate-900 leading-none">{title}</h1>
          <p className="text-[12px] text-slate-400 mt-0.5 hidden sm:block">
            {user?.targetRole || 'Career Prep'} • Welcome back, {user?.name?.split(' ')[0]}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick Actions */}
        <button
          onClick={() => navigate('/interview')}
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-xs font-semibold transition-all border border-indigo-200"
        >
          <Bot className="w-3.5 h-3.5" />
          <span>AI Interview</span>
        </button>

        {onAddApplication && (
          <button
            onClick={onAddApplication}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Add Application</span>
          </button>
        )}

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowProfileMenu(false);
            }}
            className="relative p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"
          >
            <Bell className="w-4 h-4" />
            {urgentCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 p-4 z-50 animate-fade-in">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  <span className="font-bold text-sm text-slate-900">Application Follow-ups</span>
                </div>
                <button
                  onClick={() => setShowNotifications(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-3 space-y-2 max-h-72 overflow-y-auto pr-1">
                {followUps.length === 0 ? (
                  <div className="text-center py-6 text-slate-400 text-xs">
                    <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-400 mb-1" />
                    No pending follow-ups scheduled!
                  </div>
                ) : (
                  followUps.slice(0, 6).map((item) => (
                    <div
                      key={item._id}
                      onClick={() => {
                        setShowNotifications(false);
                        navigate('/applications');
                      }}
                      className="p-2.5 rounded-xl border border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors flex items-center justify-between"
                    >
                      <div className="min-w-0 pr-2">
                        <p className="text-xs font-semibold text-slate-800 truncate">
                          {item.company}
                        </p>
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
          )}
        </div>

        {/* User Profile avatar dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowProfileMenu(!showProfileMenu);
              setShowNotifications(false);
            }}
            className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-blue-100 transition-all"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 animate-fade-in">
              <div className="px-3 py-2 border-b border-slate-100 mb-1">
                <p className="text-xs font-bold text-slate-900 truncate">{user?.name}</p>
                <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
              </div>
              <button
                onClick={() => {
                  setShowProfileMenu(false);
                  navigate('/profile');
                }}
                className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Profile & Skills
              </button>
              <button
                onClick={() => {
                  setShowProfileMenu(false);
                  navigate('/settings');
                }}
                className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Account Settings
              </button>
              <div className="my-1 border-t border-slate-100" />
              <button
                onClick={() => {
                  setShowProfileMenu(false);
                  logout();
                  navigate('/login');
                }}
                className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
              >
                Log Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
