import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { KanbanCard } from './KanbanCard';
import { Plus } from 'lucide-react';

const COLUMN_THEMES = {
  Wishlist: {
    badge: 'bg-slate-100 text-slate-700 border-slate-200',
    headerDot: 'bg-slate-400',
  },
  Applied: {
    badge: 'bg-blue-100 text-blue-700 border-blue-200',
    headerDot: 'bg-blue-500',
  },
  Interview: {
    badge: 'bg-purple-100 text-purple-700 border-purple-200',
    headerDot: 'bg-purple-500',
  },
  Offer: {
    badge: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    headerDot: 'bg-emerald-500',
  },
  Rejected: {
    badge: 'bg-rose-100 text-rose-700 border-rose-200',
    headerDot: 'bg-rose-400',
  },
};

export const KanbanColumn = ({
  status,
  applications = [],
  onCardClick,
  onGenerateEmail,
  onDelete,
  onAddInColumn,
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
    data: {
      type: 'Column',
      status,
    },
  });

  const theme = COLUMN_THEMES[status] || COLUMN_THEMES.Applied;

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col rounded-2xl bg-slate-100/70 border border-slate-200/80 p-3.5 min-w-[280px] w-full flex-1 transition-all ${
        isOver ? 'bg-blue-50/70 border-blue-300 ring-2 ring-blue-400/20' : ''
      }`}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between pb-3 mb-2 px-1">
        <div className="flex items-center gap-2">
          <div className={`w-2.5 h-2.5 rounded-full ${theme.headerDot}`} />
          <h3 className="font-bold text-sm text-slate-800">{status}</h3>
          <span
            className={`px-2 py-0.5 text-xs font-bold rounded-full border ${theme.badge}`}
          >
            {applications.length}
          </span>
        </div>

        <button
          type="button"
          onClick={() => onAddInColumn && onAddInColumn(status)}
          className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          title={`Add application to ${status}`}
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Cards List with SortableContext */}
      <div className="flex-1 space-y-3 min-h-[160px] overflow-y-auto pr-0.5">
        <SortableContext
          items={applications.map((app) => app._id)}
          strategy={verticalListSortingStrategy}
        >
          {applications.map((app) => (
            <KanbanCard
              key={app._id}
              application={app}
              onClick={onCardClick}
              onGenerateEmail={onGenerateEmail}
              onDelete={onDelete}
            />
          ))}
        </SortableContext>

        {applications.length === 0 && (
          <div className="h-32 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center text-xs text-slate-400 font-medium">
            No applications in {status}
          </div>
        )}
      </div>
    </div>
  );
};
