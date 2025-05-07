import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { FaBriefcase, FaSpinner, FaExclamationCircle } from 'react-icons/fa';
import AuthContext from '../../context/AuthContext';
import projectService from '../../services/projects';
import ProjectCard from '../../components/projects/ProjectCard';

interface Project {
  _id: string;
  title: string;
  description: string;
  budget: number;
  deadline: string;
  skills: string[];
  category: string;
  status: string;
  client: {
    _id: string;
    name: string;
  };
  freelancer?: {
    _id: string;
    name: string;
  };
  bids?: any[];
  createdAt: string;
}

const MyProjectsPage = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState<'assigned' | 'bidding'>(
    'assigned'
  );

  useEffect(() => {
    const fetchMyProjects = async () => {
      try {
        setLoading(true);
        const response = await projectService.getMyProjects();
        console.log('My projects response:', response);

        if (response && response.data) {
          setProjects(response.data);
        } else {
          console.error('Unexpected response format:', response);
          setError('Failed to load your projects. Unexpected response format.');
        }
        setLoading(false);
      } catch (err) {
        console.error('Error fetching my projects:', err);
        setError('Failed to load your projects. Please try again later.');
        setLoading(false);
      }
    };

    fetchMyProjects();
  }, []);

  // Debug log
  console.log('Current user:', user);
  console.log('All projects:', projects);

  // Filter projects based on active tab
  const assignedProjects = projects.filter((project) => {
    console.log('Checking project:', project);
    // Check if this project has the current user as the freelancer
    return (
      project.freelancer &&
      (project.freelancer._id === user?._id || project.freelancer === user?._id)
    );
  });

  const biddingProjects = projects.filter((project) => {
    // Check if this project has a bid from the current user
    return (
      project.bids &&
      project.bids.some((bid) => {
        return (
          (bid.freelancer && bid.freelancer._id === user?._id) ||
          bid.freelancer === user?._id
        );
      })
    );
  });

  // Display projects based on active tab
  const displayProjects =
    activeTab === 'assigned' ? assignedProjects : biddingProjects;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-8">
        <div className="bg-primary-100 p-3 rounded-full mr-4">
          <FaBriefcase className="text-primary-600 text-xl" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-800">My Projects</h1>
          <p className="text-gray-600">
            Manage your assigned projects and bids
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <div className="flex space-x-8">
          <button
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'assigned'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('assigned')}
          >
            Assigned Projects ({assignedProjects.length})
          </button>
          <button
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'bidding'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('bidding')}
          >
            My Bids ({biddingProjects.length})
          </button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <FaSpinner className="animate-spin text-primary-600 text-4xl" />
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 flex items-center">
          <FaExclamationCircle className="text-red-500 mr-3" />
          <p>{error}</p>
        </div>
      ) : displayProjects.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <h3 className="text-xl font-semibold mb-2">No projects found</h3>
          <p className="text-gray-600 mb-4">
            {activeTab === 'assigned'
              ? "You don't have any assigned projects yet."
              : "You haven't placed any bids yet."}
          </p>
          <Link to="/projects" className="btn btn-primary">
            Browse Projects
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {displayProjects.map((project) => (
            <ProjectCard key={project._id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
};

export default MyProjectsPage;
