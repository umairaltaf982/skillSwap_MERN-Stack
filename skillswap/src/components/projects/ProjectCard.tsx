import { Link } from 'react-router-dom';
import { FaClock, FaDollarSign, FaTag } from 'react-icons/fa';

interface ProjectCardProps {
  project: {
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
    bids?: {
      length: number;
    };
    createdAt: string;
  };
}

const ProjectCard = ({ project }: ProjectCardProps) => {
  // Format date
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Truncate description
  const truncateDescription = (text: string, maxLength: number = 150) => {
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength) + '...';
  };

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

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-semibold text-gray-900 hover:text-primary-600">
            <Link to={`/projects/${project._id}`}>{project.title}</Link>
          </h3>
          <span
            className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
              project.status
            )}`}
          >
            {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
          </span>
        </div>

        <p className="text-gray-600 mb-4">
          {truncateDescription(project.description)}
        </p>

        <div className="flex flex-wrap gap-2 mb-4">
          {project.skills.slice(0, 3).map((skill, index) => (
            <span
              key={index}
              className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded"
            >
              {skill}
            </span>
          ))}
          {project.skills.length > 3 && (
            <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded">
              +{project.skills.length - 3} more
            </span>
          )}
        </div>

        <div className="flex flex-wrap justify-between text-sm text-gray-500 mb-4">
          <div className="flex items-center mr-4 mb-2">
            <FaDollarSign className="mr-1 text-green-600" />
            <span>Budget: ${project.budget}</span>
          </div>
          <div className="flex items-center mr-4 mb-2">
            <FaClock className="mr-1 text-blue-600" />
            <span>Deadline: {formatDate(project.deadline)}</span>
          </div>
          <div className="flex items-center mb-2">
            <FaTag className="mr-1 text-purple-600" />
            <span>{project.category}</span>
          </div>
        </div>

        <div className="flex justify-between items-center pt-4 border-t border-gray-200">
          <div className="text-sm text-gray-500">
            Posted by: {project.client.name}
          </div>
          <div className="text-sm text-gray-500">
            Posted on: {formatDate(project.createdAt)}
          </div>
          {project.bids && (
            <div className="text-sm font-medium text-primary-600">
              {project.bids.length} Bids
            </div>
          )}
        </div>
      </div>
      <div className="bg-gray-50 px-6 py-3">
        <Link
          to={`/projects/${project._id}`}
          className="text-primary-600 hover:text-primary-800 font-medium"
        >
          View Details →
        </Link>
      </div>
    </div>
  );
};

export default ProjectCard;
