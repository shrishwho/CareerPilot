import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { DashboardLayout } from './layouts/DashboardLayout';

import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { Dashboard } from './pages/Dashboard';
import { MockInterviewPage } from './pages/MockInterviewPage';
import { ApplicationsPage } from './pages/ApplicationsPage';
import { InterviewHistoryPage } from './pages/InterviewHistoryPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { ProfilePage } from './pages/ProfilePage';
import { SettingsPage } from './pages/SettingsPage';
import { ApplicationModal } from './components/ApplicationModal';
import { applicationApi } from './services/api';
import { useToast } from './context/ToastContext';

// Main App Inner component
function AppContent() {
  const [globalAddModalOpen, setGlobalAddModalOpen] = useState(false);

  const handleSaveQuickApp = async (formData) => {
    try {
      const res = await applicationApi.create(formData);
      if (res.data.success) {
        setGlobalAddModalOpen(false);
        window.location.reload();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected Dashboard Routes */}
        <Route
          element={
            <ProtectedRoute>
              <DashboardLayout onAddApplication={() => setGlobalAddModalOpen(true)} />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/interview" element={<MockInterviewPage />} />
          <Route path="/applications" element={<ApplicationsPage />} />
          <Route path="/history" element={<InterviewHistoryPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>

        {/* Catch-all fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Quick Global Add Application Modal */}
      <ApplicationModal
        isOpen={globalAddModalOpen}
        onClose={() => setGlobalAddModalOpen(false)}
        onSave={handleSaveQuickApp}
      />
    </>
  );
}

export default function App() {
  return (
    <Router>
      <ToastProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ToastProvider>
    </Router>
  );
}
