import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Building2,
  MapPin,
  Calendar,
  Clock,
  Sparkles,
  GripVertical,
  MoreVertical,
  ExternalLink,
} from 'lucide-react';

export const KanbanCard = ({
  application,
  onClick,
  onGenerateEmail,
  onDelete,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: application._id,
    data: {
      type: 'Application',
      application,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // Calculate follow-up status
  let followUpInfo = null;
  if (application.followUpDate) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const fDate = new Date(application.followUpDate);
    fDate.setHours(0, 0, 0, 0);
    const diff = Math.round((fDate - today) / (1000 * 60 * 60 * 24));

    if (diff < 0) {
      followUpInfo = { label: 'Overdue', color: 'bg-rose-100 text-rose-700' };
    } else if (diff === 0) {
      followUpInfo = { label: 'Due Today', color: 'bg-amber-100 text-amber-700' };
    } else {
      followUpInfo = {
        label: `In ${diff}d`,
        color: 'bg-blue-100 text-blue-700',
      };
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative bg-white rounded-xl border border-slate-200/90 p-4 shadow-2xs hover:shadow-md hover:border-blue-300 transition-all cursor-pointer ${
        isDragging ? 'opacity-40 ring-2 ring-blue-500 shadow-xl' : ''
      }`}
      onClick={() => onClick(application)}
    >
      {/* Top row: Company & Drag Handle */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 font-bold text-xs uppercase shrink-0">
            {application.company?.charAt(0) || 'C'}
          </div>
          <div className="min-w-0">
            <h4 className="font-bold text-sm text-slate-900 truncate leading-tight group-hover:text-blue-600 transition-colors">
              {application.company}
            </h4>
            <p className="text-xs font-medium text-slate-500 truncate mt-0.5">
              {application.jobTitle}
            </p>
          </div>
        </div>

        {/* Drag Handle button */}
        <button
          {...attributes}
          {...listeners}
          onClick={(e) => e.stopPropagation()}
          className="cursor-grab active:cursor-grabbing p-1 rounded text-slate-300 hover:text-slate-600 hover:bg-slate-100 transition-colors opacity-0 group-hover:opacity-100"
          title="Drag to change column"
        >
          <GripVertical className="w-4 h-4" />
        </button>
      </div>

      {/* Middle row: Location & Salary */}
      <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
        <div className="flex items-center gap-1">
          <MapPin className="w-3 h-3 text-slate-400" />
          <span>{application.location || 'Remote'}</span>
        </div>
        {application.salary && (
          <span className="font-semibold text-slate-700 px-1.5 py-0.5 rounded bg-slate-100">
            {application.salary}
          </span>
        )}
      </div>

      {/* Bottom row: Follow up badge & quick action */}
      <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
        <div className="flex items-center gap-2">
          {followUpInfo ? (
            <span
              className={`flex items-center gap-1 px-2 py-0.5 rounded-full font-bold text-[10px] ${followUpInfo.color}`}
            >
              <Clock className="w-2.5 h-2.5" />
              {followUpInfo.label}
            </span>
          ) : (
            <span className="text-slate-400">
              {application.applicationDate
                ? new Date(application.applicationDate).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                  })
                : 'Recent'}
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onGenerateEmail(application);
          }}
          className="flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50/80 hover:bg-indigo-100 px-2 py-1 rounded-lg transition-colors"
          title="AI Cold Email"
        >
          <Sparkles className="w-3 h-3 text-indigo-500" />
          <span>Email</span>
        </button>
      </div>
    </div>
  );
};
