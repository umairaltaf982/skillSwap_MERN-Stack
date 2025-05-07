import { useState, useEffect } from 'react';
import { FaProjectDiagram, FaCheckCircle, FaHourglassHalf, FaTimesCircle, FaMoneyBillWave, FaCalendarAlt, FaFilter, FaDownload } from 'react-icons/fa';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend);

interface ProjectAnalyticsData {
  projectsByStatus: {
    labels: string[];
    data: number[];
  };
  projectsByCategory: {
    labels: string[];
    data: number[];
  };
  projectsOverTime: {
    labels: string[];
    data: number[];
  };
  averageCompletionTime: {
    labels: string[];
    data: number[];
  };
  budgetDistribution: {
    labels: string[];
    data: number[];
  };
  stats: {
    total: number;
    open: number;
    inProgress: number;
    completed: number;
    cancelled: number;
    averageBudget: number;
    totalValue: number;
  };
  topSkills: {
    labels: string[];
    data: number[];
  };
}

const ProjectAnalytics = () => {
  const [timeRange, setTimeRange] = useState('month');
  const [loading, setLoading] = useState(false);
  const [analyticsData, setAnalyticsData] = useState<ProjectAnalyticsData | null>(null);

  useEffect(() => {
    // Simulate API call
    setLoading(true);
    setTimeout(() => {
      // Mock data
      const mockData: ProjectAnalyticsData = {
        projectsByStatus: {
          labels: ['Open', 'In Progress', 'Completed', 'Cancelled'],
          data: [120, 250, 400, 50],
        },
        projectsByCategory: {
          labels: ['Web Development', 'Mobile Development', 'UI/UX Design', 'Content Writing', 'Digital Marketing', 'Other'],
          data: [300, 150, 120, 80, 70, 100],
        },
        projectsOverTime: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
          data: [50, 65, 75, 90, 110, 120],
        },
        averageCompletionTime: {
          labels: ['Web Development', 'Mobile Development', 'UI/UX Design', 'Content Writing', 'Digital Marketing', 'Other'],
          data: [15, 25, 10, 5, 8, 12], // in days
        },
        budgetDistribution: {
          labels: ['<$500', '$500-$1000', '$1000-$2000', '$2000-$5000', '>$5000'],
          data: [200, 250, 180, 120, 70],
        },
        stats: {
          total: 820,
          open: 120,
          inProgress: 250,
          completed: 400,
          cancelled: 50,
          averageBudget: 1500,
          totalValue: 1230000,
        },
        topSkills: {
          labels: ['React', 'JavaScript', 'Node.js', 'UI/UX', 'Python', 'WordPress', 'SEO', 'Content Writing'],
          data: [180, 160, 140, 120, 100, 90, 80, 70],
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
          <h1 className="text-2xl font-bold text-gray-900">Project Analytics</h1>
          <p className="text-gray-600">Detailed project metrics and performance analysis</p>
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
  const statusData = {
    labels: analyticsData.projectsByStatus.labels,
    datasets: [
      {
        data: analyticsData.projectsByStatus.data,
        backgroundColor: [
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(255, 99, 132, 0.6)',
        ],
        borderColor: [
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(255, 99, 132, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const categoryData = {
    labels: analyticsData.projectsByCategory.labels,
    datasets: [
      {
        label: 'Projects by Category',
        data: analyticsData.projectsByCategory.data,
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

  const budgetData = {
    labels: analyticsData.budgetDistribution.labels,
    datasets: [
      {
        label: 'Budget Distribution',
        data: analyticsData.budgetDistribution.data,
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)',
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Project Analytics</h1>
          <p className="text-gray-600">Detailed project metrics and performance analysis</p>
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

      {/* Project Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-500 mr-4">
              <FaProjectDiagram className="text-xl" />
            </div>
            <div>
              <p className="text-sm text-gray-500 uppercase">Total Projects</p>
              <p className="text-2xl font-semibold">{analyticsData.stats.total}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-500 mr-4">
              <FaCheckCircle className="text-xl" />
            </div>
            <div>
              <p className="text-sm text-gray-500 uppercase">Completed Projects</p>
              <p className="text-2xl font-semibold">{analyticsData.stats.completed}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-500 mr-4">
              <FaHourglassHalf className="text-xl" />
            </div>
            <div>
              <p className="text-sm text-gray-500 uppercase">In Progress</p>
              <p className="text-2xl font-semibold">{analyticsData.stats.inProgress}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-500 mr-4">
              <FaMoneyBillWave className="text-xl" />
            </div>
            <div>
              <p className="text-sm text-gray-500 uppercase">Total Value</p>
              <p className="text-2xl font-semibold">${analyticsData.stats.totalValue.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Project Status and Category */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">Project Status Distribution</h2>
          <div className="h-80">
            <Doughnut
              data={statusData}
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
          <h2 className="text-lg font-semibold mb-4">Projects by Category</h2>
          <div className="h-80">
            <Bar
              data={categoryData}
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

      {/* Projects Over Time */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Projects Created Over Time</h2>
        <div className="h-80">
          <Line
            data={{
              labels: analyticsData.projectsOverTime.labels,
              datasets: [
                {
                  label: 'New Projects',
                  data: analyticsData.projectsOverTime.data,
                  borderColor: 'rgb(75, 192, 192)',
                  backgroundColor: 'rgba(75, 192, 192, 0.2)',
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
                },
              },
            }}
          />
        </div>
      </div>

      {/* Budget Distribution and Completion Time */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">Budget Distribution</h2>
          <div className="h-80">
            <Doughnut
              data={budgetData}
              options={{
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'right',
                  },
                },
              }}
            />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">Average Completion Time by Category (Days)</h2>
          <div className="h-80">
            <Bar
              data={{
                labels: analyticsData.averageCompletionTime.labels,
                datasets: [
                  {
                    label: 'Days to Complete',
                    data: analyticsData.averageCompletionTime.data,
                    backgroundColor: 'rgba(153, 102, 255, 0.6)',
                    borderColor: 'rgba(153, 102, 255, 1)',
                    borderWidth: 1,
                  },
                ],
              }}
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
                    title: {
                      display: true,
                      text: 'Days'
                    }
                  },
                },
              }}
            />
          </div>
        </div>
      </div>

      {/* Top Skills in Demand */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Top Skills in Demand</h2>
        <div className="h-80">
          <Bar
            data={{
              labels: analyticsData.topSkills.labels,
              datasets: [
                {
                  label: 'Number of Projects',
                  data: analyticsData.topSkills.data,
                  backgroundColor: 'rgba(255, 159, 64, 0.6)',
                  borderColor: 'rgba(255, 159, 64, 1)',
                  borderWidth: 1,
                },
              ],
            }}
            options={{
              maintainAspectRatio: false,
              indexAxis: 'y',
              plugins: {
                legend: {
                  display: false,
                },
              },
              scales: {
                x: {
                  beginAtZero: true,
                },
              },
            }}
          />
        </div>
      </div>

      {/* Project Performance Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
        <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b">
          <h3 className="text-lg font-medium leading-6 text-gray-900">
            Project Performance Metrics
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Key performance indicators for projects
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Avg. Budget
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Avg. Completion Time
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Success Rate
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client Satisfaction
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Web Development
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  $1,850
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  15 days
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  92%
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  4.7/5
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Mobile Development
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  $2,500
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  25 days
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  88%
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  4.5/5
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  UI/UX Design
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  $1,200
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  10 days
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  95%
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  4.8/5
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Content Writing
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  $800
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  5 days
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  97%
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  4.6/5
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Digital Marketing
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  $1,500
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  8 days
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  90%
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  4.4/5
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProjectAnalytics;
