import React, { useState, useEffect } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import {
  Plus,
  Search,
  Filter,
  KanbanSquare,
  Sparkles,
  Calendar,
  Building2,
  RefreshCw,
} from 'lucide-react';
import { KanbanColumn } from '../components/KanbanColumn';
import { KanbanCard } from '../components/KanbanCard';
import { ApplicationModal } from '../components/ApplicationModal';
import { ApplicationDetailsModal } from '../components/ApplicationDetailsModal';
import { ColdEmailModal } from '../components/ColdEmailModal';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { applicationApi } from '../services/api';
import { useToast } from '../context/ToastContext';

const COLUMNS = ['Wishlist', 'Applied', 'Interview', 'Offer', 'Rejected'];

export const ApplicationsPage = () => {
  const { showToast } = useToast();

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedJobType, setSelectedJobType] = useState('All');

  // Drag & drop active card state
  const [activeCard, setActiveCard] = useState(null);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingApplication, setEditingApplication] = useState(null);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isColdEmailOpen, setIsColdEmailOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [appToDelete, setAppToDelete] = useState(null);
  const [initialColumnStatus, setInitialColumnStatus] = useState('Applied');

  // Sensors for dnd-kit
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // 5px drag threshold prevents accidental clicks
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const res = await applicationApi.getAll();
      if (res.data.success) {
        setApplications(res.data.applications || []);
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to load applications', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  // Filtered applications
  const filteredApps = applications.filter((app) => {
    const matchesSearch =
      app.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.jobTitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.location?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType =
      selectedJobType === 'All' || app.jobType === selectedJobType;

    return matchesSearch && matchesType;
  });

  // Group applications by status column
  const columnsData = COLUMNS.reduce((acc, col) => {
    acc[col] = filteredApps.filter((app) => app.status === col);
    return acc;
  }, {});

  // DND Handlers
  const handleDragStart = (event) => {
    const { active } = event;
    const foundApp = applications.find((a) => a._id === active.id);
    setActiveCard(foundApp || null);
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    setActiveCard(null);

    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    // Find dragged application
    const activeApp = applications.find((a) => a._id === activeId);
    if (!activeApp) return;

    // Determine target status
    let targetStatus = null;
    if (COLUMNS.includes(overId)) {
      targetStatus = overId;
    } else {
      const overApp = applications.find((a) => a._id === overId);
      if (overApp) {
        targetStatus = overApp.status;
      }
    }

    if (!targetStatus || targetStatus === activeApp.status) return;

    // Optimistic UI Update
    setApplications((prev) =>
      prev.map((app) =>
        app._id === activeId ? { ...app, status: targetStatus } : app
      )
    );

    showToast(`Moved ${activeApp.company} to ${targetStatus}`, 'success');

    // Update in MongoDB
    try {
      await applicationApi.update(activeId, { status: targetStatus });
    } catch (err) {
      console.error(err);
      showToast('Failed to save status change to database', 'error');
      fetchApplications(); // rollback
    }
  };

  // CRUD Handlers
  const handleSaveApplication = async (formData) => {
    try {
      if (editingApplication) {
        const res = await applicationApi.update(editingApplication._id, formData);
        if (res.data.success) {
          showToast('Application updated successfully!', 'success');
          setEditingApplication(null);
          setIsAddModalOpen(false);
          fetchApplications();
        }
      } else {
        const res = await applicationApi.create({
          ...formData,
          status: formData.status || initialColumnStatus,
        });
        if (res.data.success) {
          showToast('Application created successfully!', 'success');
          setIsAddModalOpen(false);
          fetchApplications();
        }
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save application', 'error');
    }
  };

  const handleDelete = async () => {
    if (!appToDelete) return;
    try {
      await applicationApi.delete(appToDelete._id);
      showToast('Application deleted successfully', 'success');
      setIsDeleteModalOpen(false);
      setAppToDelete(null);
      fetchApplications();
    } catch (err) {
      showToast('Failed to delete application', 'error');
    }
  };

  const openAddForColumn = (status) => {
    setInitialColumnStatus(status);
    setEditingApplication(null);
    setIsAddModalOpen(true);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <KanbanSquare className="w-5 h-5 text-blue-600" />
            <span>Job Application Kanban</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Drag cards across columns to update application milestones.
          </p>
        </div>

        {/* Search & Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search Input */}
          <div className="relative min-w-[200px] flex-1 sm:flex-none">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search company, role..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Job Type Filter */}
          <select
            value={selectedJobType}
            onChange={(e) => setSelectedJobType(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 focus:bg-white focus:outline-hidden"
          >
            <option value="All">All Types</option>
            <option value="Full-time">Full-time</option>
            <option value="Part-time">Part-time</option>
            <option value="Contract">Contract</option>
            <option value="Internship">Internship</option>
          </select>

          {/* Add Button */}
          <button
            onClick={() => {
              setEditingApplication(null);
              setInitialColumnStatus('Applied');
              setIsAddModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Application</span>
          </button>
        </div>
      </div>

      {/* Kanban Board Area */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-4 pt-1 items-start min-h-[calc(100vh-280px)]">
          {COLUMNS.map((col) => (
            <KanbanColumn
              key={col}
              status={col}
              applications={columnsData[col] || []}
              onCardClick={(app) => {
                setSelectedApplication(app);
                setIsDetailsOpen(true);
              }}
              onGenerateEmail={(app) => {
                setSelectedApplication(app);
                setIsColdEmailOpen(true);
              }}
              onDelete={(app) => {
                setAppToDelete(app);
                setIsDeleteModalOpen(true);
              }}
              onAddInColumn={openAddForColumn}
            />
          ))}
        </div>

        {/* Drag Overlay for smooth preview */}
        <DragOverlay>
          {activeCard ? (
            <div className="w-[280px]">
              <KanbanCard
                application={activeCard}
                onClick={() => {}}
                onGenerateEmail={() => {}}
                onDelete={() => {}}
              />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Add / Edit Modal */}
      <ApplicationModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingApplication(null);
        }}
        onSave={handleSaveApplication}
        initialData={editingApplication}
      />

      {/* Detailed Card View Modal */}
      <ApplicationDetailsModal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        application={selectedApplication}
        onEdit={(app) => {
          setEditingApplication(app);
          setIsAddModalOpen(true);
        }}
        onDelete={(app) => {
          setAppToDelete(app);
          setIsDeleteModalOpen(true);
        }}
        onGenerateEmail={(app) => {
          setSelectedApplication(app);
          setIsColdEmailOpen(true);
        }}
      />

      {/* AI Cold Email Generator Modal */}
      <ColdEmailModal
        isOpen={isColdEmailOpen}
        onClose={() => setIsColdEmailOpen(false)}
        application={selectedApplication}
      />

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete Application"
        message={`Are you sure you want to delete your application for ${appToDelete?.company} - ${appToDelete?.jobTitle}?`}
      />
    </div>
  );
};
