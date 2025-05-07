import { useState, useEffect } from 'react';
import { FaUsers, FaUserTie, FaUserCog, FaCalendarAlt, FaGlobe, FaFilter, FaDownload } from 'react-icons/fa';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend);

interface UserAnalyticsData {
  registrations: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      borderColor?: string;
      backgroundColor?: string;
    }[];
  };
  demographics: {
    gender: {
      labels: string[];
      data: number[];
    };
    age: {
      labels: string[];
      data: number[];
    };
  };
  locations: {
    labels: string[];
    data: number[];
  };
  retention: {
    labels: string[];
    data: number[];
  };
  activeUsers: {
    daily: number;
    weekly: number;
    monthly: number;
  };
}

const UserAnalytics = () => {
  const [timeRange, setTimeRange] = useState('month');
  const [loading, setLoading] = useState(false);
  const [analyticsData, setAnalyticsData] = useState<UserAnalyticsData | null>(null);

  useEffect(() => {
    // Simulate API call
    setLoading(true);
    setTimeout(() => {
      // Mock data
      const mockData: UserAnalyticsData = {
        registrations: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
          datasets: [
            {
              label: 'Total',
              data: [65, 78, 90, 105, 125, 138],
              borderColor: 'rgb(75, 192, 192)',
              backgroundColor: 'rgba(75, 192, 192, 0.2)',
            },
            {
              label: 'Clients',
              data: [40, 45, 55, 65, 75, 85],
              borderColor: 'rgb(54, 162, 235)',
              backgroundColor: 'rgba(54, 162, 235, 0.2)',
            },
            {
              label: 'Freelancers',
              data: [25, 33, 35, 40, 50, 53],
              borderColor: 'rgb(255, 99, 132)',
              backgroundColor: 'rgba(255, 99, 132, 0.2)',
            },
          ],
        },
        demographics: {
          gender: {
            labels: ['Male', 'Female', 'Other'],
            data: [55, 40, 5],
          },
          age: {
            labels: ['18-24', '25-34', '35-44', '45-54', '55+'],
            data: [15, 40, 25, 15, 5],
          },
        },
        locations: {
          labels: ['United States', 'India', 'UK', 'Canada', 'Australia', 'Germany', 'France', 'Other'],
          data: [30, 25, 10, 8, 7, 5, 5, 10],
        },
        retention: {
          labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6'],
          data: [100, 85, 75, 70, 65, 60],
        },
        activeUsers: {
          daily: 450,
          weekly: 1250,
          monthly: 2800,
        },
      };

      setAnalyticsData(mockData);
      setLoading(false);
    }, 1000);
  }, [timeRange]);

  const handleTimeRangeChange = (range: string) => {
    setTimeRange(range);
  };

  if (!analyticsData) {
    return (
      <div>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">User Analytics</h1>
          <p className="text-gray-600">Detailed user growth and engagement metrics</p>
        </div>

        <div className="flex items-center justify-center h-64">
          <div className="animate-pulse flex space-x-4">
            <div className="rounded-full bg-gray-200 h-12 w-12"></div>
            <div className="flex-1 space-y-4 py-1">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Prepare chart data
  const genderData = {
    labels: analyticsData.demographics.gender.labels,
    datasets: [
      {
        data: analyticsData.demographics.gender.data,
        backgroundColor: [
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 99, 132, 0.6)',
          'rgba(255, 206, 86, 0.6)',
        ],
        borderColor: [
          'rgba(54, 162, 235, 1)',
          'rgba(255, 99, 132, 1)',
          'rgba(255, 206, 86, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const ageData = {
    labels: analyticsData.demographics.age.labels,
    datasets: [
      {
        label: 'Age Distribution',
        data: analyticsData.demographics.age.data,
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

  const locationData = {
    labels: analyticsData.locations.labels,
    datasets: [
      {
        label: 'User Locations',
        data: analyticsData.locations.data,
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)',
          'rgba(255, 159, 64, 0.6)',
          'rgba(199, 199, 199, 0.6)',
          'rgba(83, 102, 255, 0.6)',
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Analytics</h1>
          <p className="text-gray-600">Detailed user growth and engagement metrics</p>
        </div>
        <div className="flex space-x-2">
          <div className="inline-flex shadow-sm rounded-md">
            <button
              onClick={() => handleTimeRangeChange('week')}
              className={`px-4 py-2 text-sm font-medium rounded-l-md ${
                timeRange === 'week'
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Week
            </button>
            <button
              onClick={() => handleTimeRangeChange('month')}
              className={`px-4 py-2 text-sm font-medium ${
                timeRange === 'month'
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Month
            </button>
            <button
              onClick={() => handleTimeRangeChange('year')}
              className={`px-4 py-2 text-sm font-medium rounded-r-md ${
                timeRange === 'year'
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Year
            </button>
          </div>
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
            <FaDownload className="mr-2" /> Export
          </button>
        </div>
      </div>

      {/* Active Users Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-500 mr-4">
              <FaUsers className="text-xl" />
            </div>
            <div>
              <p className="text-sm text-gray-500 uppercase">Daily Active Users</p>
              <p className="text-2xl font-semibold">{analyticsData.activeUsers.daily}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-500 mr-4">
              <FaUserTie className="text-xl" />
            </div>
            <div>
              <p className="text-sm text-gray-500 uppercase">Weekly Active Users</p>
              <p className="text-2xl font-semibold">{analyticsData.activeUsers.weekly}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-500 mr-4">
              <FaUserCog className="text-xl" />
            </div>
            <div>
              <p className="text-sm text-gray-500 uppercase">Monthly Active Users</p>
              <p className="text-2xl font-semibold">{analyticsData.activeUsers.monthly}</p>
            </div>
          </div>
        </div>
      </div>

      {/* User Registration Chart */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">User Registrations</h2>
        <div className="h-80">
          <Line
            data={analyticsData.registrations}
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

      {/* Demographics and Location */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">Gender Distribution</h2>
          <div className="h-64">
            <Doughnut
              data={genderData}
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
          <h2 className="text-lg font-semibold mb-4">Age Distribution</h2>
          <div className="h-64">
            <Bar
              data={ageData}
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
          <h2 className="text-lg font-semibold mb-4">Top User Locations</h2>
          <div className="h-64">
            <Doughnut
              data={locationData}
              options={{
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'right',
                    labels: {
                      boxWidth: 12,
                      font: {
                        size: 10
                      }
                    }
                  },
                },
              }}
            />
          </div>
        </div>
      </div>

      {/* User Retention */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">User Retention</h2>
        <div className="h-64">
          <Line
            data={{
              labels: analyticsData.retention.labels,
              datasets: [
                {
                  label: 'Retention Rate (%)',
                  data: analyticsData.retention.data,
                  borderColor: 'rgb(255, 99, 132)',
                  backgroundColor: 'rgba(255, 99, 132, 0.2)',
                  fill: true,
                },
              ],
            }}
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
                  max: 100,
                  title: {
                    display: true,
                    text: 'Percentage (%)'
                  }
                },
              },
            }}
          />
        </div>
      </div>

      {/* User Engagement Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
        <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b">
          <h3 className="text-lg font-medium leading-6 text-gray-900">
            User Engagement Metrics
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Key performance indicators for user engagement
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Metric
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  All Users
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Clients
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Freelancers
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Average Session Duration
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  8m 12s
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  7m 45s
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  9m 30s
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Pages per Session
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  5.2
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  4.8
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  6.1
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Bounce Rate
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  32%
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  28%
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  35%
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Conversion Rate
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  4.5%
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  3.8%
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  5.2%
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Return Visits (per month)
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  8.3
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  6.5
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  12.7
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserAnalytics;
