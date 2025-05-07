import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaCheckCircle, FaTimesCircle, FaEye, FaSpinner, FaFilter, FaSearch, FaSort } from 'react-icons/fa';
import axiosInstance from '../../utils/axiosConfig';

interface VerificationDocument {
  _id: string;
  documentType: string;
  documentUrl: string;
  uploadedAt: string;
  status: string;
}

interface Freelancer {
  _id: string;
  name: string;
  email: string;
  verificationDocuments: VerificationDocument[];
  submittedAt?: string;
  createdAt: string;
}

const VerificationQueue = () => {
  const [freelancers, setFreelancers] = useState<Freelancer[]>([]);
  const [filteredFreelancers, setFilteredFreelancers] = useState<Freelancer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    const fetchVerifications = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get('/admin/verifications');
        setFreelancers(response.data.data);
        setFilteredFreelancers(response.data.data);
        setLoading(false);
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to fetch verification requests');
        setLoading(false);
      }
    };

    fetchVerifications();
  }, []);

  // Filter and sort freelancers
  useEffect(() => {
    let result = [...freelancers];

    // Apply search filter
    if (searchTerm) {
      result = result.filter(
        freelancer =>
          freelancer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          freelancer.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (filterStatus !== 'all') {
      result = result.filter(freelancer =>
        freelancer.verificationDocuments.some(doc => doc.status === filterStatus)
      );
    }

    // Apply sorting
    result.sort((a, b) => {
      const dateA = new Date(a.submittedAt || a.createdAt).getTime();
      const dateB = new Date(b.submittedAt || b.createdAt).getTime();
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });

    setFilteredFreelancers(result);
  }, [freelancers, searchTerm, filterStatus, sortOrder]);

  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleApproveAll = async (freelancerId: string) => {
    try {
      setProcessingId(freelancerId);
      const freelancer = freelancers.find(f => f._id === freelancerId);

      if (!freelancer) return;

      // Process each document sequentially
      for (const doc of freelancer.verificationDocuments) {
        if (doc.status === 'Pending') {
          await axiosInstance.put(`/admin/verifications/${freelancerId}/${doc._id}`, {
            status: 'Approved'
          });
        }
      }

      // Refresh the data
      const response = await axiosInstance.get('/admin/verifications');
      setFreelancers(response.data.data);
      setProcessingId(null);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to approve documents');
      setProcessingId(null);
    }
  };

  const handleRejectAll = async (freelancerId: string) => {
    try {
      setProcessingId(freelancerId);
      const freelancer = freelancers.find(f => f._id === freelancerId);

      if (!freelancer) return;

      // Process each document sequentially
      for (const doc of freelancer.verificationDocuments) {
        if (doc.status === 'Pending') {
          await axiosInstance.put(`/admin/verifications/${freelancerId}/${doc._id}`, {
            status: 'Rejected'
          });
        }
      }

      // Refresh the data
      const response = await axiosInstance.get('/admin/verifications');
      setFreelancers(response.data.data);
      setProcessingId(null);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to reject documents');
      setProcessingId(null);
    }
  };

  const toggleSortOrder = () => {
    setSortOrder(prevOrder => prevOrder === 'asc' ? 'desc' : 'asc');
  };

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
            <FaTimesCircle className="h-5 w-5 text-red-500" />
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
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Verification Queue</h1>
        <p className="text-gray-600">Manage freelancer verification requests</p>
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
              placeholder="Search by name or email"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <FaFilter className="h-5 w-5 text-gray-400 mr-2" />
              <select
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>

            <button
              onClick={toggleSortOrder}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              {sortOrder === 'desc' ? (
                <FaSort className="mr-2 h-4 w-4 text-gray-500" />
              ) : (
                <FaSort className="mr-2 h-4 w-4 text-gray-500 transform rotate-180" />
              )}
              {sortOrder === 'desc' ? 'Newest First' : 'Oldest First'}
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b">
          <h3 className="text-lg font-medium leading-6 text-gray-900">
            Pending Verifications
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Review and approve/reject freelancer verification documents
          </p>
        </div>

        {filteredFreelancers.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-gray-500">No pending verification requests match your filters</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {filteredFreelancers.map((freelancer) => (
              <li key={freelancer._id} className="p-4 hover:bg-gray-50">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div className="mb-4 md:mb-0">
                    <h4 className="text-lg font-medium text-gray-900">
                      {freelancer.name}
                    </h4>
                    <p className="text-sm text-gray-500">{freelancer.email}</p>
                    <div className="flex items-center mt-1">
                      <p className="text-sm text-gray-500 mr-2">
                        {freelancer.verificationDocuments.length} document(s) pending review
                      </p>
                      <p className="text-xs text-gray-400">
                        Submitted on {new Date(freelancer.submittedAt || freelancer.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => handleApproveAll(freelancer._id)}
                      disabled={processingId === freelancer._id}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {processingId === freelancer._id ? (
                        <FaSpinner className="animate-spin mr-2" />
                      ) : (
                        <FaCheckCircle className="mr-2" />
                      )}
                      Approve All
                    </button>
                    <button
                      onClick={() => handleRejectAll(freelancer._id)}
                      disabled={processingId === freelancer._id}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {processingId === freelancer._id ? (
                        <FaSpinner className="animate-spin mr-2" />
                      ) : (
                        <FaTimesCircle className="mr-2" />
                      )}
                      Reject All
                    </button>
                    <Link
                      to={`/verification/${freelancer._id}`}
                      className={`inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${
                        processingId === freelancer._id ? 'opacity-50 pointer-events-none' : ''
                      }`}
                    >
                      <FaEye className="mr-2" /> View Details
                    </Link>
                  </div>
                </div>

                {/* Document summary */}
                <div className="mt-4 pl-4 border-l-4 border-gray-200">
                  {freelancer.verificationDocuments.map((doc) => (
                    <div key={doc._id} className="flex items-center justify-between py-1">
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-gray-700">{doc.documentType}</span>
                        <span className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          doc.status === 'Approved'
                            ? 'bg-green-100 text-green-800'
                            : doc.status === 'Rejected'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {doc.status}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(doc.uploadedAt).toLocaleTimeString()}
                      </span>
                    </div>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default VerificationQueue;
