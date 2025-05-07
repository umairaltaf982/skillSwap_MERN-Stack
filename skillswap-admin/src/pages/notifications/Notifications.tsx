import React from 'react';
import { Link } from 'react-router-dom';
import { FaBell, FaEnvelope, FaSms, FaClipboardList, FaClock } from 'react-icons/fa';

const Notifications = () => {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Notification System</h1>
        <p className="text-gray-600">Manage platform notifications and communication</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center mb-4">
            <div className="p-3 rounded-full bg-blue-100 text-blue-500 mr-4">
              <FaEnvelope className="text-xl" />
            </div>
            <h2 className="text-lg font-semibold">Email Notifications</h2>
          </div>
          <p className="text-gray-600 mb-4">
            Manage email templates and delivery settings for system notifications.
          </p>
          <Link
            to="/notifications/templates"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
          >
            Manage Templates
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center mb-4">
            <div className="p-3 rounded-full bg-green-100 text-green-500 mr-4">
              <FaSms className="text-xl" />
            </div>
            <h2 className="text-lg font-semibold">SMS Notifications</h2>
          </div>
          <p className="text-gray-600 mb-4">
            Configure SMS notifications for time-sensitive alerts and updates.
          </p>
          <Link
            to="/notifications/templates"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
          >
            Manage Templates
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center mb-4">
            <div className="p-3 rounded-full bg-purple-100 text-purple-500 mr-4">
              <FaBell className="text-xl" />
            </div>
            <h2 className="text-lg font-semibold">In-App Notifications</h2>
          </div>
          <p className="text-gray-600 mb-4">
            Manage in-app notification preferences and delivery settings.
          </p>
          <Link
            to="/notifications/settings"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
          >
            Configure Settings
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center mb-4">
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-500 mr-4">
              <FaClock className="text-xl" />
            </div>
            <h2 className="text-lg font-semibold">Scheduled Notifications</h2>
          </div>
          <p className="text-gray-600 mb-4">
            Schedule automated notifications for specific events or time periods.
          </p>
          <ul className="space-y-2 mb-4">
            <li className="flex items-center text-gray-700">
              <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
              Verification reminders
            </li>
            <li className="flex items-center text-gray-700">
              <span className="w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
              Project milestone alerts
            </li>
            <li className="flex items-center text-gray-700">
              <span className="w-3 h-3 bg-purple-500 rounded-full mr-2"></span>
              Payment processing updates
            </li>
            <li className="flex items-center text-gray-700">
              <span className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></span>
              System maintenance notices
            </li>
          </ul>
          <Link
            to="/notifications/scheduled"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
          >
            Manage Schedule
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center mb-4">
            <div className="p-3 rounded-full bg-red-100 text-red-500 mr-4">
              <FaClipboardList className="text-xl" />
            </div>
            <h2 className="text-lg font-semibold">Notification Logs</h2>
          </div>
          <p className="text-gray-600 mb-4">
            View delivery status and history of all system notifications.
          </p>
          <div className="border rounded-md overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Recipients
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    Email
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    125
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      Delivered
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    Today
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    SMS
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    42
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      Delivered
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    Yesterday
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    In-App
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    350
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      Delivered
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    2 days ago
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notifications;
