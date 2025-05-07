import React, { useState, useEffect } from 'react';
import { FaSpinner, FaPlus, FaEdit, FaTrash, FaEnvelope, FaSms, FaBell, FaFilter, FaSearch } from 'react-icons/fa';
import axiosInstance from '../../utils/axiosConfig';

interface NotificationTemplate {
  _id: string;
  name: string;
  type: 'email' | 'sms' | 'in-app';
  subject?: string;
  content: string;
  variables: { name: string; description: string }[];
  category: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const NotificationTemplates = () => {
  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<NotificationTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [currentTemplate, setCurrentTemplate] = useState<NotificationTemplate | null>(null);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get('/admin/notification-templates');
        setTemplates(response.data.data);
        setFilteredTemplates(response.data.data);
        setLoading(false);
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to fetch notification templates');
        setLoading(false);
      }
    };

    fetchTemplates();
  }, []);

  // Filter templates
  useEffect(() => {
    let result = [...templates];

    // Apply search filter
    if (searchTerm) {
      result = result.filter(
        template =>
          template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          template.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (template.subject && template.subject.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Apply type filter
    if (filterType !== 'all') {
      result = result.filter(template => template.type === filterType);
    }

    // Apply category filter
    if (filterCategory !== 'all') {
      result = result.filter(template => template.category === filterCategory);
    }

    setFilteredTemplates(result);
  }, [templates, searchTerm, filterType, filterCategory]);

  const handleCreateTemplate = () => {
    setCurrentTemplate(null);
    setShowModal(true);
  };

  const handleEditTemplate = (template: NotificationTemplate) => {
    setCurrentTemplate(template);
    setShowModal(true);
  };

  const handleDeleteTemplate = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this template?')) {
      try {
        await axiosInstance.delete(`/admin/notification-templates/${id}`);
        setTemplates(prevTemplates => prevTemplates.filter(template => template._id !== id));
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to delete template');
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <FaSpinner className="animate-spin h-8 w-8 text-primary-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading notification templates...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <FaTrash className="h-5 w-5 text-red-500" />
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
          <h1 className="text-2xl font-bold text-gray-900">Notification Templates</h1>
          <p className="text-gray-600">Manage email, SMS, and in-app notification templates</p>
        </div>
        <button
          onClick={handleCreateTemplate}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
        >
          <FaPlus className="mr-2" /> Create Template
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
              placeholder="Search templates"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <FaFilter className="h-5 w-5 text-gray-400 mr-2" />
              <select
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="all">All Types</option>
                <option value="email">Email</option>
                <option value="sms">SMS</option>
                <option value="in-app">In-App</option>
              </select>
            </div>

            <div className="flex items-center">
              <FaFilter className="h-5 w-5 text-gray-400 mr-2" />
              <select
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
              >
                <option value="all">All Categories</option>
                <option value="verification">Verification</option>
                <option value="project">Project</option>
                <option value="payment">Payment</option>
                <option value="system">System</option>
                <option value="user">User</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Templates List */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b">
          <h3 className="text-lg font-medium leading-6 text-gray-900">
            Notification Templates
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Templates for system communications
          </p>
        </div>

        {filteredTemplates.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-gray-500">No templates match your filters</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {filteredTemplates.map((template) => (
              <li key={template._id} className="p-4 hover:bg-gray-50">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div className="mb-4 md:mb-0">
                    <div className="flex items-center">
                      <div className="mr-3">
                        {getTypeIcon(template.type)}
                      </div>
                      <div>
                        <h4 className="text-lg font-medium text-gray-900">
                          {template.name}
                        </h4>
                        <div className="flex items-center mt-1">
                          <span className="text-sm text-gray-500 mr-2">
                            {template.type.toUpperCase()}
                          </span>
                          <span className="text-sm text-gray-500 mr-2">
                            Category: {template.category}
                          </span>
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            template.isActive
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {template.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditTemplate(template)}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                      <FaEdit className="mr-2" /> Edit
                    </button>
                    <button
                      onClick={() => handleDeleteTemplate(template._id)}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      <FaTrash className="mr-2" /> Delete
                    </button>
                  </div>
                </div>
                <div className="mt-2">
                  {template.type === 'email' && template.subject && (
                    <p className="text-sm text-gray-600 font-medium">Subject: {template.subject}</p>
                  )}
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                    {template.content}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Template Modal would go here - simplified for this implementation */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900">
                {currentTemplate ? 'Edit Template' : 'Create Template'}
              </h2>
              <p className="text-gray-600 mt-1">
                Template form would go here with fields for name, type, subject, content, variables, etc.
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
                  {currentTemplate ? 'Update' : 'Create'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationTemplates;
