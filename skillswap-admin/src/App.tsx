import { Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';

// Layouts
import AdminLayout from './layouts/AdminLayout';
import AuthLayout from './layouts/AuthLayout';

// Pages
import Dashboard from './pages/Dashboard';
import Login from './pages/auth/Login';
import NotFound from './pages/NotFound';

// Freelancer Verification
import VerificationQueue from './pages/verification/VerificationQueue';
import VerificationDetails from './pages/verification/VerificationDetails';
import VerificationLevels from './pages/verification/VerificationLevels';

// Platform Analytics
import Analytics from './pages/analytics/Analytics';
import UserAnalytics from './pages/analytics/UserAnalytics';
import ProjectAnalytics from './pages/analytics/ProjectAnalytics';
import RevenueAnalytics from './pages/analytics/RevenueAnalytics';

// Notification System
import Notifications from './pages/notifications/Notifications';
import NotificationTemplates from './pages/notifications/NotificationTemplates';
import ScheduledNotifications from './pages/notifications/ScheduledNotifications';
import NotificationSettings from './pages/notifications/NotificationSettings';

// Context
import { AuthContext } from './context/AuthContext';

function App() {
  const { user, isAuthenticated, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Auth routes */}
      <Route path="/login" element={
        !isAuthenticated ? (
          <AuthLayout>
            <Login />
          </AuthLayout>
        ) : (
          <Navigate to="/dashboard" replace />
        )
      } />

      {/* Admin routes - protected */}
      <Route path="/" element={
        isAuthenticated ? (
          <AdminLayout>
            <Dashboard />
          </AdminLayout>
        ) : (
          <Navigate to="/login" replace />
        )
      } />
      
      <Route path="/dashboard" element={
        isAuthenticated ? (
          <AdminLayout>
            <Dashboard />
          </AdminLayout>
        ) : (
          <Navigate to="/login" replace />
        )
      } />

      {/* Freelancer Verification routes */}
      <Route path="/verification" element={
        isAuthenticated ? (
          <AdminLayout>
            <VerificationQueue />
          </AdminLayout>
        ) : (
          <Navigate to="/login" replace />
        )
      } />
      
      <Route path="/verification/:id" element={
        isAuthenticated ? (
          <AdminLayout>
            <VerificationDetails />
          </AdminLayout>
        ) : (
          <Navigate to="/login" replace />
        )
      } />
      
      <Route path="/verification/levels" element={
        isAuthenticated ? (
          <AdminLayout>
            <VerificationLevels />
          </AdminLayout>
        ) : (
          <Navigate to="/login" replace />
        )
      } />

      {/* Analytics routes */}
      <Route path="/analytics" element={
        isAuthenticated ? (
          <AdminLayout>
            <Analytics />
          </AdminLayout>
        ) : (
          <Navigate to="/login" replace />
        )
      } />
      
      <Route path="/analytics/users" element={
        isAuthenticated ? (
          <AdminLayout>
            <UserAnalytics />
          </AdminLayout>
        ) : (
          <Navigate to="/login" replace />
        )
      } />
      
      <Route path="/analytics/projects" element={
        isAuthenticated ? (
          <AdminLayout>
            <ProjectAnalytics />
          </AdminLayout>
        ) : (
          <Navigate to="/login" replace />
        )
      } />
      
      <Route path="/analytics/revenue" element={
        isAuthenticated ? (
          <AdminLayout>
            <RevenueAnalytics />
          </AdminLayout>
        ) : (
          <Navigate to="/login" replace />
        )
      } />

      {/* Notification routes */}
      <Route path="/notifications" element={
        isAuthenticated ? (
          <AdminLayout>
            <Notifications />
          </AdminLayout>
        ) : (
          <Navigate to="/login" replace />
        )
      } />
      
      <Route path="/notifications/templates" element={
        isAuthenticated ? (
          <AdminLayout>
            <NotificationTemplates />
          </AdminLayout>
        ) : (
          <Navigate to="/login" replace />
        )
      } />
      
      <Route path="/notifications/scheduled" element={
        isAuthenticated ? (
          <AdminLayout>
            <ScheduledNotifications />
          </AdminLayout>
        ) : (
          <Navigate to="/login" replace />
        )
      } />
      
      <Route path="/notifications/settings" element={
        isAuthenticated ? (
          <AdminLayout>
            <NotificationSettings />
          </AdminLayout>
        ) : (
          <Navigate to="/login" replace />
        )
      } />

      {/* 404 route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
