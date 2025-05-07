import React, { useState, useEffect } from 'react';
import { FaSpinner, FaPlus, FaEdit, FaTrash, FaCalendarAlt, FaFilter, FaSearch, FaUsers, FaEnvelope, FaSms, FaBell, FaCheck, FaTimes, FaClock } from 'react-icons/fa';
import axiosInstance from '../../utils/axiosConfig';

interface ScheduledNotification {
  _id: string;
  template: {
    _id: string;
    name: string;
    type: 'email' | 'sms' | 'in-app';
  };
  recipients: string[];
  recipientFilter?: {
    role?: string;
    verificationLevel?: string;
    location?: string;
  };
  scheduledFor: string;
  repeat: 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';
  status: 'scheduled' | 'sent' | 'failed' | 'cancelled';
  sentAt?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: {
    _id: string;
    name: string;
  };
}

const ScheduledNotifications = () => {
  const [notifications, setNotifications] = useState<ScheduledNotification[]>([]);
  const [filteredNotifications, setFilteredNotifications] = useState<ScheduledNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [currentNotification, setCurrentNotification] = useState<ScheduledNotification | null>(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get('/admin/scheduled-notifications');
        setNotifications(response.data.data);
        setFilteredNotifications(response.data.data);
        setLoading(false);
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to fetch scheduled notifications');
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  // Filter notifications
  useEffect(() => {
    let result = [...notifications];

    // Apply search filter
    if (searchTerm) {
      result = result.filter(
        notification =>
          notification.template.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (filterStatus !== 'all') {
      result = result.filter(notification => notification.status === filterStatus);
    }

    setFilteredNotifications(result);
  }, [notifications, searchTerm, filterStatus]);

  const handleCreateNotification = () => {
    setCurrentNotification(null);
    setShowModal(true);
  };

  const handleEditNotification = (notification: ScheduledNotification) => {
    setCurrentNotification(notification);
    setShowModal(true);
  };

  const handleCancelNotification = async (id: string) => {
    if (window.confirm('Are you sure you want to cancel this scheduled notification?')) {
      try {
        await axiosInstance.put(`/admin/scheduled-notifications/${id}/cancel`);

        // Update the local state
        setNotifications(prevNotifications =>
          prevNotifications.map(notification =>
            notification._id === id
              ? { ...notification, status: 'cancelled' }
              : notification
          )
        );
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to cancel notification');
      }
    }
  };

  const handleDeleteNotification = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this scheduled notification?')) {
      try {
        await axiosInstance.delete(`/admin/scheduled-notifications/${id}`);
        setNotifications(prevNotifications =>
          prevNotifications.filter(notification => notification._id !== id)
        );
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to delete notification');
      }
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'email':
        return <FaEnvelope className="text-blue-500" />;
      case 'sms':
        return <FaSms className="text-green-500" />;
      case 'in-app':
        return <FaBell className="text-purple-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'scheduled':
        return (
          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
            <FaClock className="mr-1" /> Scheduled
          </span>
        );
      case 'sent':
        return (
          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
            <FaCheck className="mr-1" /> Sent
          </span>
        );
      case 'failed':
        return (
          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
            <FaTimes className="mr-1" /> Failed
          </span>
        );
      case 'cancelled':
        return (
          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
            <FaTimes className="mr-1" /> Cancelled
          </span>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <FaSpinner className="animate-spin h-8 w-8 text-primary-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading scheduled notifications...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <FaTimes className="h-5 w-5 text-red-500" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Scheduled Notifications</h1>
          <p className="text-gray-600">Manage and schedule automated notifications</p>
        </div>
        <button
          onClick={handleCreateNotification}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
        >
          <FaPlus className="mr-2" /> Schedule Notification
        </button>
      </div>

      {/* Filters and Search */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden mb-6 p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              placeholder="Search notifications"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-center">
            <FaFilter className="h-5 w-5 text-gray-400 mr-2" />
            <select
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="scheduled">Scheduled</option>
              <option value="sent">Sent</option>
              <option value="failed">Failed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b">
          <h3 className="text-lg font-medium leading-6 text-gray-900">
            Scheduled Notifications
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Upcoming and past notification deliveries
          </p>
        </div>

        {filteredNotifications.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-gray-500">No scheduled notifications match your filters</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {filteredNotifications.map((notification) => (
              <li key={notification._id} className="p-4 hover:bg-gray-50">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div className="mb-4 md:mb-0">
                    <div className="flex items-center">
                      <div className="mr-3">
                        {getTypeIcon(notification.template.type)}
                      </div>
                      <div>
                        <h4 className="text-lg font-medium text-gray-900">
                          {notification.template.name}
                        </h4>
                        <div className="flex items-center mt-1 flex-wrap gap-2">
                          {getStatusBadge(notification.status)}
                          <span className="text-sm text-gray-500">
                            <FaCalendarAlt className="inline mr-1" />
                            {new Date(notification.scheduledFor).toLocaleString()}
                          </span>
                          {notification.repeat !== 'none' && (
                            <span className="text-sm text-gray-500">
                              Repeats: {notification.repeat}
                            </span>
                          )}
                          <span className="text-sm text-gray-500">
                            <FaUsers className="inline mr-1" />
                            {notification.recipients?.length || 0} recipients
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    {notification.status === 'scheduled' && (
                      <>
                        <button
                          onClick={() => handleEditNotification(notification)}
                          className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                        >
                          <FaEdit className="mr-2" /> Edit
                        </button>
                        <button
                          onClick={() => handleCancelNotification(notification._id)}
                          className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                        >
                          <FaTimes className="mr-2" /> Cancel
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => handleDeleteNotification(notification._id)}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      <FaTrash className="mr-2" /> Delete
                    </button>
                  </div>
                </div>
                <div className="mt-2">
                  <p className="text-sm text-gray-600">
                    Created by {notification.createdBy.name} on {new Date(notification.createdAt).toLocaleDateString()}
                  </p>
                  {notification.status === 'sent' && notification.sentAt && (
                    <p className="text-sm text-gray-600">
                      Sent on {new Date(notification.sentAt).toLocaleString()}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Notification Modal would go here - simplified for this implementation */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900">
                {currentNotification ? 'Edit Scheduled Notification' : 'Schedule New Notification'}
              </h2>
              <p className="text-gray-600 mt-1">
                Form would go here with fields for template selection, recipients, schedule date/time, etc.
              </p>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
                >
                  {currentNotification ? 'Update' : 'Schedule'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScheduledNotifications;
