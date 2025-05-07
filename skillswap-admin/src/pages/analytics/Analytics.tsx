import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { FaUsers, FaProjectDiagram, FaMoneyBillWave, FaChartLine, FaSpinner, FaExclamationTriangle } from 'react-icons/fa';
import { Line, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend } from 'chart.js';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

interface AnalyticsData {
  users: {
    total: number;
    clients: number;
    freelancers: number;
    admins: number;
    growth: {
      labels: string[];
      data: number[];
    };
  };
  projects: {
    total: number;
    open: number;
    inProgress: number;
    completed: number;
    cancelled: number;
    byCategory: {
      labels: string[];
      data: number[];
    };
  };
  revenue: {
    total: number;
    monthly: {
      labels: string[];
      data: number[];
    };
  };
  skills: {
    popular: {
      labels: string[];
      data: number[];
    };
  };
}

const Analytics = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState('month'); // 'week', 'month', 'year'

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        setLoading(true);
        // In a real implementation, you would pass the timeRange as a query parameter
        const response = await axios.get(`/api/admin/analytics?range=${timeRange}`);
        setAnalyticsData(response.data.data);
        setLoading(false);
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to fetch analytics data');
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, [timeRange]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <FaSpinner className="animate-spin h-8 w-8 text-primary-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4">
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

  // For demo purposes, create sample data if the API doesn't return data
  const sampleData: AnalyticsData = analyticsData || {
    users: {
      total: 1250,
      clients: 750,
      freelancers: 480,
      admins: 20,
      growth: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        data: [850, 920, 980, 1050, 1150, 1250],
      },
    },
    projects: {
      total: 820,
      open: 120,
      inProgress: 250,
      completed: 400,
      cancelled: 50,
      byCategory: {
        labels: ['Web Dev', 'Mobile Dev', 'Design', 'Writing', 'Marketing', 'Other'],
        data: [300, 150, 120, 80, 70, 100],
      },
    },
    revenue: {
      total: 125000,
      monthly: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        data: [15000, 18000, 22000, 20000, 25000, 25000],
      },
    },
    skills: {
      popular: {
        labels: ['React', 'JavaScript', 'Python', 'UI/UX', 'Node.js', 'WordPress'],
        data: [120, 100, 80, 75, 70, 65],
      },
    },
  };

  // Prepare chart data
  const userGrowthData = {
    labels: sampleData.users.growth.labels,
    datasets: [
      {
        label: 'Total Users',
        data: sampleData.users.growth.data,
        borderColor: '#0ea5e9',
        backgroundColor: 'rgba(14, 165, 233, 0.2)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const revenueData = {
    labels: sampleData.revenue.monthly.labels,
    datasets: [
      {
        label: 'Monthly Revenue ($)',
        data: sampleData.revenue.monthly.data,
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.2)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const projectsByCategoryData = {
    labels: sampleData.projects.byCategory.labels,
    datasets: [
      {
        label: 'Projects by Category',
        data: sampleData.projects.byCategory.data,
        backgroundColor: [
          '#0ea5e9',
          '#8b5cf6',
          '#f59e0b',
          '#10b981',
          '#ef4444',
          '#6b7280',
        ],
      },
    ],
  };

  const popularSkillsData = {
    labels: sampleData.skills.popular.labels,
    datasets: [
      {
        label: 'Popular Skills',
        data: sampleData.skills.popular.data,
        backgroundColor: '#8b5cf6',
      },
    ],
  };

  return (
    <div>
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Platform Analytics</h1>
          <p className="text-gray-600">Comprehensive data analysis and insights</p>
        </div>
        <div className="mt-4 md:mt-0">
          <div className="inline-flex rounded-md shadow-sm" role="group">
            <button
              type="button"
              onClick={() => setTimeRange('week')}
              className={`px-4 py-2 text-sm font-medium rounded-l-md ${
                timeRange === 'week'
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              } border border-gray-300`}
            >
              Week
            </button>
            <button
              type="button"
              onClick={() => setTimeRange('month')}
              className={`px-4 py-2 text-sm font-medium ${
                timeRange === 'month'
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              } border-t border-b border-gray-300`}
            >
              Month
            </button>
            <button
              type="button"
              onClick={() => setTimeRange('year')}
              className={`px-4 py-2 text-sm font-medium rounded-r-md ${
                timeRange === 'year'
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              } border border-gray-300`}
            >
              Year
            </button>
          </div>
        </div>
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
              <p className="text-2xl font-semibold">{sampleData.users.total}</p>
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
              <p className="text-2xl font-semibold">{sampleData.projects.total}</p>
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
                ${sampleData.revenue.total.toLocaleString()}
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

        {/* User Breakdown */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-500 mr-4">
              <FaChartLine className="text-xl" />
            </div>
            <div>
              <p className="text-sm text-gray-500 uppercase">User Breakdown</p>
              <div className="flex space-x-2 mt-1">
                <span className="text-sm">
                  <span className="font-semibold">{sampleData.users.clients}</span> Clients
                </span>
                <span className="text-sm">
                  <span className="font-semibold">{sampleData.users.freelancers}</span> Freelancers
                </span>
              </div>
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
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">User Growth</h2>
          <div className="h-80">
            <Line 
              data={userGrowthData} 
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

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">Monthly Revenue</h2>
          <div className="h-80">
            <Line 
              data={revenueData} 
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
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">Projects by Category</h2>
          <div className="h-80">
            <Bar 
              data={projectsByCategoryData} 
              options={{
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false,
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

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">Popular Skills</h2>
          <div className="h-80">
            <Bar 
              data={popularSkillsData} 
              options={{
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false,
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
      </div>
    </div>
  );
};

export default Analytics;
