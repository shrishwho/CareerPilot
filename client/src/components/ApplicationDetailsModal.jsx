import React from 'react';
import { Modal } from './Modal';
import {
  Building2,
  Briefcase,
  MapPin,
  DollarSign,
  Calendar,
  ExternalLink,
  User,
  Mail,
  FileText,
  Sparkles,
  Edit2,
  Trash2,
  Clock,
} from 'lucide-react';

const STATUS_COLORS = {
  Wishlist: 'bg-slate-100 text-slate-700 border-slate-200',
  Applied: 'bg-blue-100 text-blue-700 border-blue-200',
  Interview: 'bg-purple-100 text-purple-700 border-purple-200',
  Offer: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  Rejected: 'bg-rose-100 text-rose-700 border-rose-200',
};

export const ApplicationDetailsModal = ({
  isOpen,
  onClose,
  application,
  onEdit,
  onDelete,
  onGenerateEmail,
}) => {
  if (!application) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Application Details"
      maxWidth="max-w-xl"
    >
      <div className="space-y-5">
        {/* Header Title with Company & Status */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900">{application.company}</h2>
              {application.jobUrl && (
                <a
                  href={application.jobUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 transition-colors p-1"
                  title="Open Job URL"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
            <p className="text-sm font-semibold text-slate-600 mt-0.5">{application.jobTitle}</p>
          </div>

          <span
            className={`px-3 py-1 rounded-full text-xs font-bold border ${
              STATUS_COLORS[application.status] || STATUS_COLORS.Applied
            }`}
          >
            {application.status}
          </span>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
            <div className="flex items-center gap-1.5 text-slate-400 font-medium">
              <MapPin className="w-3.5 h-3.5" />
              <span>Location</span>
            </div>
            <p className="font-semibold text-slate-800">{application.location || 'Remote'}</p>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
            <div className="flex items-center gap-1.5 text-slate-400 font-medium">
              <Briefcase className="w-3.5 h-3.5" />
              <span>Job Type</span>
            </div>
            <p className="font-semibold text-slate-800">{application.jobType || 'Full-time'}</p>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
            <div className="flex items-center gap-1.5 text-slate-400 font-medium">
              <DollarSign className="w-3.5 h-3.5" />
              <span>Salary</span>
            </div>
            <p className="font-semibold text-slate-800">{application.salary || 'Not specified'}</p>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
            <div className="flex items-center gap-1.5 text-slate-400 font-medium">
              <Calendar className="w-3.5 h-3.5" />
              <span>Applied Date</span>
            </div>
            <p className="font-semibold text-slate-800">
              {application.applicationDate
                ? new Date(application.applicationDate).toLocaleDateString()
                : 'N/A'}
            </p>
          </div>
        </div>

        {/* Follow-up & Contact info */}
        {(application.followUpDate || application.contactPerson || application.contactEmail) && (
          <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100/80 space-y-2 text-xs">
            <div className="font-semibold text-blue-900 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-blue-600" />
              <span>Follow-up & Contact Information</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-700">
              {application.followUpDate && (
                <div>
                  <span className="text-slate-400">Follow-up: </span>
                  <span className="font-semibold text-slate-900">
                    {new Date(application.followUpDate).toLocaleDateString()}
                  </span>
                </div>
              )}
              {application.contactPerson && (
                <div>
                  <span className="text-slate-400">Contact: </span>
                  <span className="font-semibold text-slate-900">{application.contactPerson}</span>
                </div>
              )}
              {application.contactEmail && (
                <div className="sm:col-span-2">
                  <span className="text-slate-400">Email: </span>
                  <a
                    href={`mailto:${application.contactEmail}`}
                    className="font-medium text-blue-600 hover:underline"
                  >
                    {application.contactEmail}
                  </a>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Notes */}
        {application.notes && (
          <div className="space-y-1 text-xs">
            <div className="font-semibold text-slate-700 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              <span>Notes</span>
            </div>
            <p className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-slate-600 leading-relaxed whitespace-pre-wrap">
              {application.notes}
            </p>
          </div>
        )}

        {/* Actions Bar */}
        <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
          <button
            onClick={() => {
              onClose();
              onGenerateEmail(application);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-xs font-semibold border border-indigo-200 transition-colors shadow-2xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Generate Cold Email</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onEdit(application);
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-100 text-xs font-semibold transition-colors"
            >
              <Edit2 className="w-3.5 h-3.5 text-slate-500" />
              <span>Edit</span>
            </button>
            <button
              onClick={() => {
                onClose();
                onDelete(application);
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 text-xs font-semibold transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
