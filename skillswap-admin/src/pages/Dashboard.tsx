import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
  FaUsers,
  FaProjectDiagram,
  FaMoneyBillWave,
  FaCheckCircle,
  FaExclamationTriangle,
  FaUserCheck,
  FaChartLine,
  FaBell
} from 'react-icons/fa';
import { Line, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title } from 'chart.js';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title);

interface DashboardStats {
  users: {
    total: number;
    clients: number;
    freelancers: number;
    admins: number;
  };
  projects: {
    total: number;
    open: number;
    inProgress: number;
    completed: number;
    cancelled: number;
    totalValue: number;
  };
  bids: {
    total: number;
    pending: number;
    accepted: number;
    rejected: number;
    countered: number;
  };
  reviews: {
    total: number;
    averageRating: number;
  };
  recent: {
    users: any[];
    projects: any[];
  };
  pendingVerifications?: number;
}

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Mock data for demonstration
    const mockStats: DashboardStats = {
      users: {
        total: 1250,
        clients: 750,
        freelancers: 480,
        admins: 20
      },
      projects: {
        total: 820,
        open: 120,
        inProgress: 250,
        completed: 400,
        cancelled: 50,
        totalValue: 125000
      },
      bids: {
        total: 1500,
        pending: 300,
        accepted: 800,
        rejected: 350,
        countered: 50
      },
      reviews: {
        total: 650,
        averageRating: 4.7
      },
      recent: {
        users: [],
        projects: []
      },
      pendingVerifications: 15
    };

    // Simulate API call
    setTimeout(() => {
      setStats(mockStats);
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <FaExclamationTriangle className="h-5 w-5 text-red-500" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  // Prepare chart data
  const userDistributionData = {
    labels: ['Clients', 'Freelancers', 'Admins'],
    datasets: [
      {
        data: [stats.users.clients, stats.users.freelancers, stats.users.admins],
        backgroundColor: ['#0ea5e9', '#8b5cf6', '#10b981'],
        hoverBackgroundColor: ['#0284c7', '#7c3aed', '#059669'],
      },
    ],
  };

  const projectStatusData = {
    labels: ['Open', 'In Progress', 'Completed', 'Cancelled'],
    datasets: [
      {
        data: [
          stats.projects.open,
          stats.projects.inProgress,
          stats.projects.completed,
          stats.projects.cancelled,
        ],
        backgroundColor: ['#f59e0b', '#0ea5e9', '#10b981', '#ef4444'],
        hoverBackgroundColor: ['#d97706', '#0284c7', '#059669', '#dc2626'],
      },
    ],
  };

  // Sample data for line chart (would be replaced with real data)
  const projectsOverTimeData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Projects',
        data: [12, 19, 15, 20, 25, 30],
        borderColor: '#0ea5e9',
        backgroundColor: 'rgba(14, 165, 233, 0.2)',
        tension: 0.4,
      },
    ],
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome to the SkillSwap Admin Panel</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {/* Total Users */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-500 mr-4">
              <FaUsers className="text-xl" />
            </div>
            <div>
              <p className="text-sm text-gray-500 uppercase">Total Users</p>
              <p className="text-2xl font-semibold">{stats.users.total}</p>
            </div>
          </div>
          <div className="mt-4">
            <Link
              to="/analytics/users"
              className="text-sm text-primary-600 hover:text-primary-800"
            >
              View details →
            </Link>
          </div>
        </div>

        {/* Total Projects */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-500 mr-4">
              <FaProjectDiagram className="text-xl" />
            </div>
            <div>
              <p className="text-sm text-gray-500 uppercase">Total Projects</p>
              <p className="text-2xl font-semibold">{stats.projects.total}</p>
            </div>
          </div>
          <div className="mt-4">
            <Link
              to="/analytics/projects"
              className="text-sm text-primary-600 hover:text-primary-800"
            >
              View details →
            </Link>
          </div>
        </div>

        {/* Total Revenue */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-500 mr-4">
              <FaMoneyBillWave className="text-xl" />
            </div>
            <div>
              <p className="text-sm text-gray-500 uppercase">Total Revenue</p>
              <p className="text-2xl font-semibold">
                ${stats.projects.totalValue.toLocaleString()}
              </p>
            </div>
          </div>
          <div className="mt-4">
            <Link
              to="/analytics/revenue"
              className="text-sm text-primary-600 hover:text-primary-800"
            >
              View details →
            </Link>
          </div>
        </div>

        {/* Pending Verifications */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-500 mr-4">
              <FaUserCheck className="text-xl" />
            </div>
            <div>
              <p className="text-sm text-gray-500 uppercase">Pending Verifications</p>
              <p className="text-2xl font-semibold">{stats.pendingVerifications}</p>
            </div>
          </div>
          <div className="mt-4">
            <Link
              to="/verification"
              className="text-sm text-primary-600 hover:text-primary-800"
            >
              View queue →
            </Link>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">User Distribution</h2>
          <div className="h-64">
            <Doughnut
              data={userDistributionData}
              options={{
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom',
                  },
                },
              }}
            />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">Project Status</h2>
          <div className="h-64">
            <Doughnut
              data={projectStatusData}
              options={{
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom',
                  },
                },
              }}
            />
          </div>
        </div>
      </div>

      {/* Projects Over Time */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Projects Over Time</h2>
        <div className="h-80">
          <Line
            data={projectsOverTimeData}
            options={{
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: 'top',
                },
              },
              scales: {
                y: {
                  beginAtZero: true,
                },
              },
            }}
          />
        </div>
      </div>

      {/* Quick Access */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <FaCheckCircle className="mr-2 text-primary-600" />
            Verification
          </h2>
          <p className="text-gray-600 mb-4">
            Manage freelancer verification requests and documents.
          </p>
          <Link
            to="/verification"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
          >
            Go to Verification
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <FaChartLine className="mr-2 text-primary-600" />
            Analytics
          </h2>
          <p className="text-gray-600 mb-4">
            View detailed platform analytics and generate reports.
          </p>
          <Link
            to="/analytics"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
          >
            Go to Analytics
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <FaBell className="mr-2 text-primary-600" />
            Notifications
          </h2>
          <p className="text-gray-600 mb-4">
            Manage notification templates and scheduled messages.
          </p>
          <Link
            to="/notifications"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
          >
            Go to Notifications
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
