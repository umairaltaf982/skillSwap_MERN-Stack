import { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';
import projectService from '../../services/projects';
import bidService from '../../services/bids';
import socketService from '../../services/socket';
import {
  FaClock,
  FaDollarSign,
  FaTag,
  FaUser,
  FaCalendarAlt,
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationCircle,
} from 'react-icons/fa';
import BidForm from '../bids/BidForm';
import BidList from '../bids/BidList';
import MilestoneList from '../projects/MilestoneList';

interface ProjectDetailsProps {
  projectId: string;
}

const ProjectDetails = ({ projectId }: ProjectDetailsProps) => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showBidForm, setShowBidForm] = useState(false);

  // Fetch project details
  useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoading(true);
        const response = await projectService.getProject(projectId);
        setProject(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching project:', err);
        setError('Failed to load project details. Please try again later.');
        setLoading(false);
      }
    };

    fetchProject();
  }, [projectId]);

  // Connect to socket for real-time updates
  useEffect(() => {
    if (project && user) {
      // Join project room
      socketService.joinProject(projectId);

      // Listen for bid updates
      const newBidUnsubscribe = socketService.onNewBid((data) => {
        if (data.project === projectId) {
          // Update project with new bid
          setProject((prevProject: any) => ({
            ...prevProject,
            bids: [...prevProject.bids, data.bid],
          }));
        }
      });

      const bidUpdatedUnsubscribe = socketService.onBidUpdated((data) => {
        if (data.project === projectId) {
          // Update bid in project
          setProject((prevProject: any) => ({
            ...prevProject,
            bids: prevProject.bids.map((bid: any) =>
              bid._id === data.bid._id ? data.bid : bid
            ),
          }));
        }
      });

      const bidDeletedUnsubscribe = socketService.onBidDeleted((data) => {
        if (data.project === projectId) {
          // Remove bid from project
          setProject((prevProject: any) => ({
            ...prevProject,
            bids: prevProject.bids.filter((bid: any) => bid._id !== data.bidId),
          }));
        }
      });

      // Cleanup listeners on unmount
      return () => {
        newBidUnsubscribe();
        bidUpdatedUnsubscribe();
        bidDeletedUnsubscribe();
      };
    }
  }, [project, projectId, user]);

  // Format date
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Handle bid submission
  const handleBidSubmit = async (bidData: any) => {
    try {
      await projectService.submitBid(projectId, bidData);
      setShowBidForm(false);
      // Refresh project to get updated bids
      const response = await projectService.getProject(projectId);
      setProject(response.data);
    } catch (err) {
      console.error('Error submitting bid:', err);
      setError('Failed to submit bid. Please try again later.');
    }
  };

  // Handle bid acceptance
  const handleAcceptBid = async (bidId: string) => {
    try {
      await bidService.acceptBid(bidId);
      // Refresh project to get updated status
      const response = await projectService.getProject(projectId);
      setProject(response.data);
    } catch (err) {
      console.error('Error accepting bid:', err);
      setError('Failed to accept bid. Please try again later.');
    }
  };

  // Handle project status update
  const handleUpdateStatus = async (status: string) => {
    try {
      await projectService.updateProjectStatus(projectId, status);
      // Refresh project to get updated status
      const response = await projectService.getProject(projectId);
      setProject(response.data);
    } catch (err) {
      console.error('Error updating project status:', err);
      setError('Failed to update project status. Please try again later.');
    }
  };

  // Check if current user is the project owner
  const isProjectOwner = user && project && user._id === project.client._id;

  // Check if current user is the assigned freelancer
  const isAssignedFreelancer =
    user &&
    project &&
    project.freelancer &&
    user._id === project.freelancer._id;

  // Check if current user has already bid on this project
  const hasUserBid =
    user &&
    project &&
    project.bids &&
    project.bids.some((bid: any) => bid.freelancer._id === user._id);

  // Status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-purple-100 text-purple-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
        role="alert"
      >
        <strong className="font-bold">Error!</strong>
        <span className="block sm:inline"> {error}</span>
      </div>
    );
  }

  if (!project) {
    return (
      <div
        className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative"
        role="alert"
      >
        <strong className="font-bold">Project not found!</strong>
        <span className="block sm:inline">
          {' '}
          The requested project could not be found.
        </span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Project Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-2 md:mb-0">
            {project.title}
          </h1>
          <span
            className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(
              project.status
            )}`}
          >
            {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
          </span>
        </div>

        <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
          <div className="flex items-center">
            <FaDollarSign className="mr-1 text-green-600" />
            <span>Budget: ${project.budget}</span>
          </div>
          <div className="flex items-center">
            <FaClock className="mr-1 text-blue-600" />
            <span>Deadline: {formatDate(project.deadline)}</span>
          </div>
          <div className="flex items-center">
            <FaTag className="mr-1 text-purple-600" />
            <span>{project.category}</span>
          </div>
          <div className="flex items-center">
            <FaUser className="mr-1 text-gray-600" />
            <span>Client: {project.client.name}</span>
          </div>
          <div className="flex items-center">
            <FaCalendarAlt className="mr-1 text-orange-600" />
            <span>Posted: {formatDate(project.createdAt)}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {project.skills.map((skill: string, index: number) => (
            <span
              key={index}
              className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded"
            >
              {skill}
            </span>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          {/* Client Actions */}
          {isProjectOwner && project.status === 'open' && (
            <button
              onClick={() => handleUpdateStatus('cancelled')}
              className="btn bg-red-600 text-white hover:bg-red-700"
            >
              Cancel Project
            </button>
          )}

          {isProjectOwner && project.status === 'in-progress' && (
            <button
              onClick={() => handleUpdateStatus('completed')}
              className="btn bg-green-600 text-white hover:bg-green-700"
            >
              Mark as Completed
            </button>
          )}

          {/* Freelancer Actions */}
          {user &&
            user.role === 'freelancer' &&
            project.status === 'open' &&
            !isProjectOwner &&
            !hasUserBid && (
              <button
                onClick={() => setShowBidForm(true)}
                className="btn btn-primary"
              >
                Submit a Bid
              </button>
            )}

          {hasUserBid && (
            <button
              onClick={() => navigate(`/bids/my-bids`)}
              className="btn btn-outline"
            >
              View My Bid
            </button>
          )}

          {/* Add "Mark as Complete" button for freelancers */}
          {isAssignedFreelancer && project.status === 'in-progress' && (
            <button
              onClick={() => handleUpdateStatus('completed')}
              className="btn bg-green-600 text-white hover:bg-green-700"
            >
              Mark as Completed
            </button>
          )}

          {isAssignedFreelancer && (
            <Link
              to={`/projects/${project._id}/milestones`}
              className="btn btn-primary"
            >
              View Milestones
            </Link>
          )}

          {/* Message Button */}
          {user && !isProjectOwner && project.client && (
            <Link
              to={`/messages/${project.client._id}?project=${project._id}`}
              className="btn btn-outline"
            >
              Message Client
            </Link>
          )}

          {user && isProjectOwner && project.freelancer && (
            <Link
              to={`/messages/${project.freelancer._id}?project=${project._id}`}
              className="btn btn-outline"
            >
              Message Freelancer
            </Link>
          )}
        </div>
      </div>

      {/* Project Details */}
      <div className="p-6">
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Project Description</h2>
          <div className="prose max-w-none">
            <p className="whitespace-pre-line">{project.description}</p>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Requirements</h2>
          <div className="prose max-w-none">
            <p className="whitespace-pre-line">{project.requirements}</p>
          </div>
        </div>

        {/* Milestones Section */}
        {(isProjectOwner || isAssignedFreelancer) &&
          project.milestones &&
          project.milestones.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Milestones</h2>
              <MilestoneList
                milestones={project.milestones}
                projectId={project._id}
                isProjectOwner={isProjectOwner}
                isFreelancer={isAssignedFreelancer}
              />
            </div>
          )}

        {/* Bid Form */}
        {showBidForm && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Submit Your Bid</h2>
            <BidForm
              projectId={project._id}
              onSubmit={handleBidSubmit}
              onCancel={() => setShowBidForm(false)}
            />
          </div>
        )}

        {/* Bids Section */}
        {isProjectOwner && project.bids && project.bids.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-4">
              Bids ({project.bids.length})
            </h2>
            <BidList
              bids={project.bids}
              isProjectOwner={isProjectOwner}
              onAcceptBid={handleAcceptBid}
              projectStatus={project.status}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectDetails;
