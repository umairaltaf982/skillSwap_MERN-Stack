import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaCheckCircle, FaTimesCircle, FaSpinner, FaArrowLeft, FaFileAlt, FaFileImage, FaFilePdf } from 'react-icons/fa';

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
}

const VerificationDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [freelancer, setFreelancer] = useState<Freelancer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingDocId, setProcessingDocId] = useState<string | null>(null);

  useEffect(() => {
    const fetchFreelancerDetails = async () => {
      try {
        setLoading(true);
        // This would need to be updated to match your actual API
        const response = await axios.get(`/api/admin/verifications/${id}`);
        setFreelancer(response.data.data);
        setLoading(false);
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to fetch freelancer details');
        setLoading(false);
      }
    };

    if (id) {
      fetchFreelancerDetails();
    }
  }, [id]);

  const handleApprove = async (documentId: string) => {
    try {
      setProcessingDocId(documentId);
      await axios.put(`/api/admin/verifications/${id}/${documentId}`, {
        status: 'Approved'
      });
      
      // Update the local state
      if (freelancer) {
        const updatedDocs = freelancer.verificationDocuments.map(doc => 
          doc._id === documentId ? { ...doc, status: 'Approved' } : doc
        );
        setFreelancer({ ...freelancer, verificationDocuments: updatedDocs });
      }
      
      setProcessingDocId(null);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to approve document');
      setProcessingDocId(null);
    }
  };

  const handleReject = async (documentId: string) => {
    try {
      setProcessingDocId(documentId);
      await axios.put(`/api/admin/verifications/${id}/${documentId}`, {
        status: 'Rejected'
      });
      
      // Update the local state
      if (freelancer) {
        const updatedDocs = freelancer.verificationDocuments.map(doc => 
          doc._id === documentId ? { ...doc, status: 'Rejected' } : doc
        );
        setFreelancer({ ...freelancer, verificationDocuments: updatedDocs });
      }
      
      setProcessingDocId(null);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to reject document');
      setProcessingDocId(null);
    }
  };

  const getDocumentIcon = (documentType: string) => {
    if (documentType.includes('ID') || documentType.includes('License')) {
      return <FaFileImage className="h-6 w-6 text-blue-500" />;
    } else if (documentType.includes('Certificate') || documentType.includes('Diploma')) {
      return <FaFilePdf className="h-6 w-6 text-red-500" />;
    } else {
      return <FaFileAlt className="h-6 w-6 text-gray-500" />;
    }
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

  if (!freelancer) {
    return (
      <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <FaTimesCircle className="h-5 w-5 text-yellow-500" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-700">Freelancer not found</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <button
          onClick={() => navigate('/verification')}
          className="flex items-center text-primary-600 hover:text-primary-800"
        >
          <FaArrowLeft className="mr-2" /> Back to Queue
        </button>
        <h1 className="text-2xl font-bold text-gray-900 mt-4">Verification Details</h1>
        <p className="text-gray-600">Review documents for {freelancer.name}</p>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden mb-6">
        <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b">
          <h3 className="text-lg font-medium leading-6 text-gray-900">
            Freelancer Information
          </h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Name</p>
              <p className="mt-1 text-sm text-gray-900">{freelancer.name}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Email</p>
              <p className="mt-1 text-sm text-gray-900">{freelancer.email}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b">
          <h3 className="text-lg font-medium leading-6 text-gray-900">
            Verification Documents
          </h3>
        </div>
        
        {freelancer.verificationDocuments.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-gray-500">No documents submitted</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {freelancer.verificationDocuments.map((doc) => (
              <li key={doc._id} className="p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center mb-4 md:mb-0">
                    {getDocumentIcon(doc.documentType)}
                    <div className="ml-4">
                      <h4 className="text-lg font-medium text-gray-900">
                        {doc.documentType}
                      </h4>
                      <p className="text-sm text-gray-500">
                        Uploaded on {new Date(doc.uploadedAt).toLocaleDateString()}
                      </p>
                      <div className="mt-2">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            doc.status === 'Approved'
                              ? 'bg-green-100 text-green-800'
                              : doc.status === 'Rejected'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {doc.status}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <a
                      href={doc.documentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                      View Document
                    </a>
                    
                    {doc.status === 'Pending' && (
                      <>
                        <button
                          onClick={() => handleApprove(doc._id)}
                          disabled={processingDocId === doc._id}
                          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                        >
                          {processingDocId === doc._id ? (
                            <FaSpinner className="animate-spin mr-2" />
                          ) : (
                            <FaCheckCircle className="mr-2" />
                          )}
                          Approve
                        </button>
                        
                        <button
                          onClick={() => handleReject(doc._id)}
                          disabled={processingDocId === doc._id}
                          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                        >
                          {processingDocId === doc._id ? (
                            <FaSpinner className="animate-spin mr-2" />
                          ) : (
                            <FaTimesCircle className="mr-2" />
                          )}
                          Reject
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default VerificationDetails;
