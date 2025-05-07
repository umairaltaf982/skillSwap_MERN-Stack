import { useContext, useEffect, useState } from 'react';
import AuthContext from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import {
  FaPlus,
  FaSearch,
  FaBriefcase,
  FaClipboardList,
  FaComments,
  FaStar,
  FaChartLine,
  FaUser,
} from 'react-icons/fa';
import api from '../../services/api';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    pendingBids: 0,
    unreadMessages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Different API endpoints based on user role
        const endpoint =
          user?.role === 'client'
            ? '/clients/analytics'
            : '/freelancers/analytics';

        const res = await api.get(endpoint);

        // Process data based on user role
        if (user?.role === 'client') {
          setStats({
            totalProjects: res.data.data.totalProjects || 0,
            activeProjects: res.data.data.projectsByStatus?.inProgress || 0,
            completedProjects: res.data.data.projectsByStatus?.completed || 0,
            pendingBids: 0, // Clients don't have bids
            unreadMessages: 0, // Will be implemented with messaging system
          });
        } else {
          setStats({
            totalProjects:
              res.data.data.totalActiveProjects +
                res.data.data.totalCompletedProjects || 0,
            activeProjects: res.data.data.totalActiveProjects || 0,
            completedProjects: res.data.data.totalCompletedProjects || 0,
            pendingBids: res.data.data.totalBids || 0,
            unreadMessages: 0, // Will be implemented with messaging system
          });
        }

        setLoading(false);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
        setLoading(false);
      }
    };

    // Only fetch if user is authenticated
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  // Render loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div
        className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
        role="alert"
      >
        <strong className="font-bold">Error!</strong>
        <span className="block sm:inline"> {error}</span>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        {user?.role === 'client' ? (
          <Link
            to="/projects/new"
            className="btn btn-primary flex items-center"
          >
            <FaPlus className="mr-2" /> Post a Project
          </Link>
        ) : (
          <Link to="/projects" className="btn btn-primary flex items-center">
            <FaSearch className="mr-2" /> Find Projects
          </Link>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-500 mr-4">
              <FaBriefcase className="text-xl" />
            </div>
            <div>
              <p className="text-sm text-gray-500 uppercase">Total Projects</p>
              <p className="text-2xl font-semibold">{stats.totalProjects}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-500 mr-4">
              <FaClipboardList className="text-xl" />
            </div>
            <div>
              <p className="text-sm text-gray-500 uppercase">Active Projects</p>
              <p className="text-2xl font-semibold">{stats.activeProjects}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-500 mr-4">
              <FaStar className="text-xl" />
            </div>
            <div>
              <p className="text-sm text-gray-500 uppercase">Completed</p>
              <p className="text-2xl font-semibold">
                {stats.completedProjects}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-500 mr-4">
              <FaComments className="text-xl" />
            </div>
            <div>
              <p className="text-sm text-gray-500 uppercase">
                {user?.role === 'freelancer'
                  ? 'Pending Bids'
                  : 'Unread Messages'}
              </p>
              <p className="text-2xl font-semibold">
                {user?.role === 'freelancer'
                  ? stats.pendingBids
                  : stats.unreadMessages}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity / Projects */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">
              {user?.role === 'client' ? 'Recent Projects' : 'Recent Activity'}
            </h2>

            {/* Placeholder for recent projects/activity */}
            <div className="space-y-4">
              <div className="border-b pb-4">
                <p className="text-gray-500 text-sm mb-1">Today</p>
                <p className="font-medium">No recent activity</p>
              </div>
            </div>

            <div className="mt-4 text-center">
              <Link
                to={
                  user?.role === 'client' ? '/projects' : '/dashboard/activity'
                }
                className="text-primary-600 hover:text-primary-800 font-medium"
              >
                View All
              </Link>
            </div>
          </div>
        </div>

        {/* Quick Links / Stats */}
        <div>
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Quick Links</h2>
            <ul className="space-y-2">
              <li>
                <Link
                  to={user?.role === 'client' ? '/projects/new' : '/projects'}
                  className="text-primary-600 hover:text-primary-800 flex items-center"
                >
                  <FaBriefcase className="mr-2" />
                  {user?.role === 'client'
                    ? 'Post a New Project'
                    : 'Browse Projects'}
                </Link>
              </li>
              {user?.role === 'freelancer' && (
                <li>
                  <Link
                    to="/projects/my-projects"
                    className="text-primary-600 hover:text-primary-800 flex items-center"
                  >
                    <FaBriefcase className="mr-2" />
                    My Projects
                  </Link>
                </li>
              )}
              <li>
                <Link
                  to="/messages"
                  className="text-primary-600 hover:text-primary-800 flex items-center"
                >
                  <FaComments className="mr-2" />
                  Messages
                </Link>
              </li>
              <li>
                <Link
                  to="/profile"
                  className="text-primary-600 hover:text-primary-800 flex items-center"
                >
                  <FaUser className="mr-2" />
                  Edit Profile
                </Link>
              </li>
              <li>
                <Link
                  to={
                    user?.role === 'client'
                      ? '/dashboard/analytics'
                      : '/dashboard/earnings'
                  }
                  className="text-primary-600 hover:text-primary-800 flex items-center"
                >
                  <FaChartLine className="mr-2" />
                  {user?.role === 'client' ? 'Analytics' : 'Earnings'}
                </Link>
              </li>
            </ul>
          </div>

          {/* Additional Widget */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Tips & Resources</h2>
            <ul className="space-y-2 text-gray-700">
              <li className="pb-2 border-b">
                <a href="#" className="hover:text-primary-600">
                  How to write effective project descriptions
                </a>
              </li>
              <li className="py-2 border-b">
                <a href="#" className="hover:text-primary-600">
                  Tips for successful project completion
                </a>
              </li>
              <li className="pt-2">
                <a href="#" className="hover:text-primary-600">
                  Communication best practices
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
