import { ReactNode, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import {
  FaChartLine,
  FaCheckCircle,
  FaBell,
  FaSignOutAlt,
  FaTachometerAlt,
  FaBars,
  FaTimes,
  FaUserShield,
  FaChevronDown,
  FaChevronUp,
} from 'react-icons/fa';

interface AdminLayoutProps {
  children: ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [verificationSubmenuOpen, setVerificationSubmenuOpen] = useState(false);
  const [analyticsSubmenuOpen, setAnalyticsSubmenuOpen] = useState(false);
  const [notificationsSubmenuOpen, setNotificationsSubmenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const isActiveGroup = (path: string) => {
    return location.pathname.startsWith(path);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar for mobile */}
      <div
        className={`fixed inset-0 z-40 lg:hidden ${
          sidebarOpen ? 'block' : 'hidden'
        }`}
        onClick={() => setSidebarOpen(false)}
      >
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75"></div>
      </div>

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-md transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b">
          <Link to="/dashboard" className="flex items-center">
            <span className="text-xl font-semibold text-primary-600">SkillSwap Admin</span>
          </Link>
          <button
            className="p-1 text-gray-500 rounded-md lg:hidden hover:text-primary-600 hover:bg-gray-100"
            onClick={() => setSidebarOpen(false)}
          >
            <FaTimes className="w-6 h-6" />
          </button>
        </div>

        <nav className="mt-5 px-2 space-y-1">
          {/* Dashboard */}
          <Link
            to="/dashboard"
            className={`group flex items-center px-2 py-2 text-base font-medium rounded-md ${
              isActive('/dashboard')
                ? 'bg-primary-100 text-primary-600'
                : 'text-gray-600 hover:bg-primary-50 hover:text-primary-600'
            }`}
          >
            <FaTachometerAlt className="mr-3 h-5 w-5" />
            Dashboard
          </Link>

          {/* Freelancer Verification */}
          <div>
            <button
              onClick={() => setVerificationSubmenuOpen(!verificationSubmenuOpen)}
              className={`w-full group flex items-center justify-between px-2 py-2 text-base font-medium rounded-md ${
                isActiveGroup('/verification')
                  ? 'bg-primary-100 text-primary-600'
                  : 'text-gray-600 hover:bg-primary-50 hover:text-primary-600'
              }`}
            >
              <div className="flex items-center">
                <FaCheckCircle className="mr-3 h-5 w-5" />
                Verification
              </div>
              {verificationSubmenuOpen ? (
                <FaChevronUp className="h-4 w-4" />
              ) : (
                <FaChevronDown className="h-4 w-4" />
              )}
            </button>
            {verificationSubmenuOpen && (
              <div className="pl-10 space-y-1 mt-1">
                <Link
                  to="/verification"
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    isActive('/verification')
                      ? 'bg-primary-100 text-primary-600'
                      : 'text-gray-600 hover:bg-primary-50 hover:text-primary-600'
                  }`}
                >
                  Queue
                </Link>
                <Link
                  to="/verification/levels"
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    isActive('/verification/levels')
                      ? 'bg-primary-100 text-primary-600'
                      : 'text-gray-600 hover:bg-primary-50 hover:text-primary-600'
                  }`}
                >
                  Levels
                </Link>
              </div>
            )}
          </div>

          {/* Analytics */}
          <div>
            <button
              onClick={() => setAnalyticsSubmenuOpen(!analyticsSubmenuOpen)}
              className={`w-full group flex items-center justify-between px-2 py-2 text-base font-medium rounded-md ${
                isActiveGroup('/analytics')
                  ? 'bg-primary-100 text-primary-600'
                  : 'text-gray-600 hover:bg-primary-50 hover:text-primary-600'
              }`}
            >
              <div className="flex items-center">
                <FaChartLine className="mr-3 h-5 w-5" />
                Analytics
              </div>
              {analyticsSubmenuOpen ? (
                <FaChevronUp className="h-4 w-4" />
              ) : (
                <FaChevronDown className="h-4 w-4" />
              )}
            </button>
            {analyticsSubmenuOpen && (
              <div className="pl-10 space-y-1 mt-1">
                <Link
                  to="/analytics"
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    isActive('/analytics')
                      ? 'bg-primary-100 text-primary-600'
                      : 'text-gray-600 hover:bg-primary-50 hover:text-primary-600'
                  }`}
                >
                  Overview
                </Link>
                <Link
                  to="/analytics/users"
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    isActive('/analytics/users')
                      ? 'bg-primary-100 text-primary-600'
                      : 'text-gray-600 hover:bg-primary-50 hover:text-primary-600'
                  }`}
                >
                  Users
                </Link>
                <Link
                  to="/analytics/projects"
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    isActive('/analytics/projects')
                      ? 'bg-primary-100 text-primary-600'
                      : 'text-gray-600 hover:bg-primary-50 hover:text-primary-600'
                  }`}
                >
                  Projects
                </Link>
                <Link
                  to="/analytics/revenue"
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    isActive('/analytics/revenue')
                      ? 'bg-primary-100 text-primary-600'
                      : 'text-gray-600 hover:bg-primary-50 hover:text-primary-600'
                  }`}
                >
                  Revenue
                </Link>
              </div>
            )}
          </div>

          {/* Notifications */}
          <div>
            <button
              onClick={() => setNotificationsSubmenuOpen(!notificationsSubmenuOpen)}
              className={`w-full group flex items-center justify-between px-2 py-2 text-base font-medium rounded-md ${
                isActiveGroup('/notifications')
                  ? 'bg-primary-100 text-primary-600'
                  : 'text-gray-600 hover:bg-primary-50 hover:text-primary-600'
              }`}
            >
              <div className="flex items-center">
                <FaBell className="mr-3 h-5 w-5" />
                Notifications
              </div>
              {notificationsSubmenuOpen ? (
                <FaChevronUp className="h-4 w-4" />
              ) : (
                <FaChevronDown className="h-4 w-4" />
              )}
            </button>
            {notificationsSubmenuOpen && (
              <div className="pl-10 space-y-1 mt-1">
                <Link
                  to="/notifications"
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    isActive('/notifications')
                      ? 'bg-primary-100 text-primary-600'
                      : 'text-gray-600 hover:bg-primary-50 hover:text-primary-600'
                  }`}
                >
                  Overview
                </Link>
                <Link
                  to="/notifications/templates"
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    isActive('/notifications/templates')
                      ? 'bg-primary-100 text-primary-600'
                      : 'text-gray-600 hover:bg-primary-50 hover:text-primary-600'
                  }`}
                >
                  Templates
                </Link>
                <Link
                  to="/notifications/scheduled"
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    isActive('/notifications/scheduled')
                      ? 'bg-primary-100 text-primary-600'
                      : 'text-gray-600 hover:bg-primary-50 hover:text-primary-600'
                  }`}
                >
                  Scheduled
                </Link>
                <Link
                  to="/notifications/settings"
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    isActive('/notifications/settings')
                      ? 'bg-primary-100 text-primary-600'
                      : 'text-gray-600 hover:bg-primary-50 hover:text-primary-600'
                  }`}
                >
                  Settings
                </Link>
              </div>
            )}
          </div>
        </nav>

        <div className="absolute bottom-0 w-full border-t border-gray-200">
          <div className="px-4 py-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-primary-600 flex items-center justify-center text-white">
                  <FaUserShield />
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700">{user?.name}</p>
                <p className="text-xs font-medium text-gray-500">Admin</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="mt-3 w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
            >
              <FaSignOutAlt className="mr-2 h-4 w-4" />
              Sign out
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col lg:pl-64">
        {/* Top navigation */}
        <div className="sticky top-0 z-10 bg-white shadow-sm lg:shadow-none">
          <div className="flex h-16 items-center justify-between px-4 lg:px-6">
            <button
              className="p-1 text-gray-500 rounded-md lg:hidden hover:text-primary-600 hover:bg-gray-100"
              onClick={() => setSidebarOpen(true)}
            >
              <FaBars className="w-6 h-6" />
            </button>
            <div className="flex items-center">
              <div className="relative">
                <button
                  onClick={handleLogout}
                  className="flex items-center text-sm font-medium text-gray-500 hover:text-primary-600"
                >
                  <FaSignOutAlt className="mr-1 h-4 w-4" />
                  Sign out
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-gray-100 p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
