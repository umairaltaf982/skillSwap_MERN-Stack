import { useState } from 'react';
import { FaCheckCircle, FaHourglassHalf, FaClock, FaDollarSign } from 'react-icons/fa';
import projectService from '../../services/projects';

interface Milestone {
  _id: string;
  title: string;
  description: string;
  dueDate: string;
  amount: number;
  status: 'pending' | 'in-progress' | 'completed' | 'approved';
  completedAt?: string;
  approvedAt?: string;
}

interface MilestoneListProps {
  milestones: Milestone[];
  projectId: string;
  isProjectOwner: boolean;
  isFreelancer: boolean;
}

const MilestoneList = ({ milestones, projectId, isProjectOwner, isFreelancer }: MilestoneListProps) => {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Format date
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Handle milestone status update
  const handleUpdateStatus = async (milestoneId: string, status: string) => {
    try {
      setLoading(milestoneId);
      setError(null);
      setSuccess(null);
      
      await projectService.updateMilestoneStatus(projectId, milestoneId, status);
      
      setSuccess(`Milestone ${status === 'completed' ? 'marked as completed' : status === 'approved' ? 'approved' : 'updated'} successfully`);
      setLoading(null);
      
      // Reload the page to get updated milestone data
      // In a real app, you would update the state instead
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err) {
      console.error('Error updating milestone status:', err);
      setError('Failed to update milestone status. Please try again later.');
      setLoading(null);
    }
  };

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-orange-100 text-orange-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <FaClock className="text-yellow-500" />;
      case 'in-progress':
        return <FaHourglassHalf className="text-blue-500" />;
      case 'completed':
        return <FaCheckCircle className="text-orange-500" />;
      case 'approved':
        return <FaCheckCircle className="text-green-500" />;
      default:
        return null;
    }
  };

  return (
    <div>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">{success}</span>
        </div>
      )}
      
      <div className="space-y-4">
        {milestones.map((milestone) => (
          <div key={milestone._id} className="border rounded-lg overflow-hidden">
            <div className="bg-gray-50 p-4 flex justify-between items-center">
              <div className="flex items-center">
                <div className="mr-3">
                  {getStatusIcon(milestone.status)}
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{milestone.title}</h3>
                  <div className="flex items-center text-sm text-gray-500 mt-1">
                    <FaClock className="mr-1" />
                    <span>Due: {formatDate(milestone.dueDate)}</span>
                    <span className="mx-2">•</span>
                    <FaDollarSign className="mr-1" />
                    <span>${milestone.amount}</span>
                  </div>
                </div>
              </div>
              <span
                className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                  milestone.status
                )}`}
              >
                {milestone.status.charAt(0).toUpperCase() + milestone.status.slice(1)}
              </span>
            </div>
            
            <div className="p-4">
              <p className="text-gray-700 mb-4">{milestone.description}</p>
              
              {milestone.completedAt && (
                <div className="text-sm text-gray-500 mb-2">
                  <strong>Completed:</strong> {formatDate(milestone.completedAt)}
                </div>
              )}
              
              {milestone.approvedAt && (
                <div className="text-sm text-gray-500 mb-2">
                  <strong>Approved:</strong> {formatDate(milestone.approvedAt)}
                </div>
              )}
              
              <div className="flex justify-end mt-4 space-x-2">
                {/* Freelancer Actions */}
                {isFreelancer && milestone.status === 'pending' && (
                  <button
                    onClick={() => handleUpdateStatus(milestone._id, 'completed')}
                    disabled={loading === milestone._id}
                    className="btn bg-orange-600 text-white hover:bg-orange-700 disabled:opacity-50"
                  >
                    {loading === milestone._id ? 'Updating...' : 'Mark as Completed'}
                  </button>
                )}
                
                {/* Client Actions */}
                {isProjectOwner && milestone.status === 'completed' && (
                  <>
                    <button
                      onClick={() => handleUpdateStatus(milestone._id, 'approved')}
                      disabled={loading === milestone._id}
                      className="btn bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
                    >
                      {loading === milestone._id ? 'Updating...' : 'Approve'}
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(milestone._id, 'in-progress')}
                      disabled={loading === milestone._id}
                      className="btn bg-yellow-600 text-white hover:bg-yellow-700 disabled:opacity-50"
                    >
                      {loading === milestone._id ? 'Updating...' : 'Request Changes'}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MilestoneList;
