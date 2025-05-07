import { useState, useEffect, useRef } from 'react';
import { FaCalendarAlt, FaDownload, FaFilter, FaSpinner } from 'react-icons/fa';
import api from '../../services/api';
import { Chart, registerables } from 'chart.js';
import { CSVLink } from 'react-csv';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

// Register Chart.js components
Chart.register(...registerables);

interface AnalyticsData {
  totalProjects: number;
  projectsByStatus: {
    open: number;
    inProgress: number;
    completed: number;
    cancelled: number;
  };
  totalReviews: number;
  averageRatingGiven: number;
  totalBudgetSpent: number;
  recentProjects: any[];
  projectsOverTime?: {
    labels: string[];
    data: number[];
  };
  budgetByCategory?: {
    labels: string[];
    data: number[];
  };
}

const ClientAnalytics = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setMonth(new Date().getMonth() - 3)).toISOString().split('T')[0], // 3 months ago
    endDate: new Date().toISOString().split('T')[0], // today
  });
  const [csvData, setCsvData] = useState<any[]>([]);

  // Chart refs
  const projectStatusChartRef = useRef<HTMLCanvasElement>(null);
  const projectsOverTimeChartRef = useRef<HTMLCanvasElement>(null);
  const budgetByCategoryChartRef = useRef<HTMLCanvasElement>(null);

  // Chart instances
  const projectStatusChartInstance = useRef<Chart | null>(null);
  const projectsOverTimeChartInstance = useRef<Chart | null>(null);
  const budgetByCategoryChartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    fetchAnalyticsData();
  }, [dateRange]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/clients/analytics', {
        params: {
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
        },
      });

      setAnalyticsData(response.data.data);
      prepareCSVData(response.data.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching analytics data:', err);
      setError('Failed to load analytics data. Please try again later.');
      setLoading(false);
    }
  };

  const prepareCSVData = (data: AnalyticsData) => {
    const csvData = [
      {
        metric: 'Total Projects',
        value: data.totalProjects,
      },
      {
        metric: 'Open Projects',
        value: data.projectsByStatus.open,
      },
      {
        metric: 'In Progress Projects',
        value: data.projectsByStatus.inProgress,
      },
      {
        metric: 'Completed Projects',
        value: data.projectsByStatus.completed,
      },
      {
        metric: 'Cancelled Projects',
        value: data.projectsByStatus.cancelled,
      },
      {
        metric: 'Total Reviews',
        value: data.totalReviews,
      },
      {
        metric: 'Average Rating Given',
        value: data.averageRatingGiven.toFixed(1),
      },
      {
        metric: 'Total Budget Spent',
        value: `$${data.totalBudgetSpent.toFixed(2)}`,
      },
    ];

    setCsvData(csvData);
  };

  useEffect(() => {
    if (analyticsData && !loading) {
      renderCharts();
    }
  }, [analyticsData, loading]);

  const renderCharts = () => {
    if (!analyticsData) return;

    // Destroy previous chart instances
    if (projectStatusChartInstance.current) {
      projectStatusChartInstance.current.destroy();
    }
    if (projectsOverTimeChartInstance.current) {
      projectsOverTimeChartInstance.current.destroy();
    }
    if (budgetByCategoryChartInstance.current) {
      budgetByCategoryChartInstance.current.destroy();
    }

    // Project Status Chart
    if (projectStatusChartRef.current) {
      const ctx = projectStatusChartRef.current.getContext('2d');
      if (ctx) {
        projectStatusChartInstance.current = new Chart(ctx, {
          type: 'doughnut',
          data: {
            labels: ['Open', 'In Progress', 'Completed', 'Cancelled'],
            datasets: [
              {
                data: [
                  analyticsData.projectsByStatus.open,
                  analyticsData.projectsByStatus.inProgress,
                  analyticsData.projectsByStatus.completed,
                  analyticsData.projectsByStatus.cancelled,
                ],
                backgroundColor: [
                  'rgba(54, 162, 235, 0.7)',
                  'rgba(255, 206, 86, 0.7)',
                  'rgba(75, 192, 192, 0.7)',
                  'rgba(255, 99, 132, 0.7)',
                ],
                borderWidth: 1,
              },
            ],
          },
          options: {
            responsive: true,
            plugins: {
              legend: {
                position: 'bottom',
              },
              title: {
                display: true,
                text: 'Projects by Status',
              },
            },
          },
        });
      }
    }

    // Projects Over Time Chart
    if (projectsOverTimeChartRef.current && analyticsData.projectsOverTime) {
      const ctx = projectsOverTimeChartRef.current.getContext('2d');
      if (ctx) {
        projectsOverTimeChartInstance.current = new Chart(ctx, {
          type: 'line',
          data: {
            labels: analyticsData.projectsOverTime.labels,
            datasets: [
              {
                label: 'Projects',
                data: analyticsData.projectsOverTime.data,
                borderColor: 'rgba(75, 192, 192, 1)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                tension: 0.1,
                fill: true,
              },
            ],
          },
          options: {
            responsive: true,
            plugins: {
              legend: {
                position: 'top',
              },
              title: {
                display: true,
                text: 'Projects Over Time',
              },
            },
            scales: {
              y: {
                beginAtZero: true,
                ticks: {
                  precision: 0,
                },
              },
            },
          },
        });
      }
    }

    // Budget By Category Chart
    if (budgetByCategoryChartRef.current && analyticsData.budgetByCategory) {
      const ctx = budgetByCategoryChartRef.current.getContext('2d');
      if (ctx) {
        budgetByCategoryChartInstance.current = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: analyticsData.budgetByCategory.labels,
            datasets: [
              {
                label: 'Budget Spent ($)',
                data: analyticsData.budgetByCategory.data,
                backgroundColor: 'rgba(153, 102, 255, 0.7)',
                borderWidth: 1,
              },
            ],
          },
          options: {
            responsive: true,
            plugins: {
              legend: {
                position: 'top',
              },
              title: {
                display: true,
                text: 'Budget by Category',
              },
            },
            scales: {
              y: {
                beginAtZero: true,
              },
            },
          },
        });
      }
    }
  };

  const handleDateRangeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDateRange((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const exportToPDF = () => {
    if (!analyticsData) return;

    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Client Analytics Report', 14, 22);
    doc.setFontSize(12);
    doc.text(`Date Range: ${dateRange.startDate} to ${dateRange.endDate}`, 14, 30);

    // Add stats table
    const tableData = csvData.map((item) => [item.metric, item.value]);
    (doc as any).autoTable({
      startY: 40,
      head: [['Metric', 'Value']],
      body: tableData,
    });

    // Save the PDF
    doc.save('client-analytics-report.pdf');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <FaSpinner className="animate-spin text-primary-600 text-4xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
        <strong className="font-bold">Error!</strong>
        <span className="block sm:inline"> {error}</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
        <div className="flex space-x-4">
          {/* Date Range Filter */}
          <div className="flex items-center space-x-2">
            <FaCalendarAlt className="text-gray-500" />
            <input
              type="date"
              name="startDate"
              value={dateRange.startDate}
              onChange={handleDateRangeChange}
              className="form-input text-sm"
            />
            <span>to</span>
            <input
              type="date"
              name="endDate"
              value={dateRange.endDate}
              onChange={handleDateRangeChange}
              className="form-input text-sm"
            />
            <button
              onClick={fetchAnalyticsData}
              className="btn btn-sm btn-outline flex items-center"
            >
              <FaFilter className="mr-1" /> Filter
            </button>
          </div>

          {/* Export Options */}
          <div className="flex space-x-2">
            <CSVLink
              data={csvData}
              filename="client-analytics.csv"
              className="btn btn-sm btn-outline flex items-center"
            >
              <FaDownload className="mr-1" /> CSV
            </CSVLink>
            <button
              onClick={exportToPDF}
              className="btn btn-sm btn-outline flex items-center"
            >
              <FaDownload className="mr-1" /> PDF
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-2">Total Projects</h3>
          <p className="text-3xl font-bold text-primary-600">
            {analyticsData?.totalProjects || 0}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-2">Active Projects</h3>
          <p className="text-3xl font-bold text-yellow-500">
            {analyticsData?.projectsByStatus.inProgress || 0}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-2">Completed Projects</h3>
          <p className="text-3xl font-bold text-green-500">
            {analyticsData?.projectsByStatus.completed || 0}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-2">Total Budget Spent</h3>
          <p className="text-3xl font-bold text-purple-600">
            ${analyticsData?.totalBudgetSpent.toFixed(2) || '0.00'}
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <canvas ref={projectStatusChartRef}></canvas>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <canvas ref={projectsOverTimeChartRef}></canvas>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <canvas ref={budgetByCategoryChartRef}></canvas>
      </div>
    </div>
  );
};

export default ClientAnalytics;
