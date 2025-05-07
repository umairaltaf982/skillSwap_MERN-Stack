import { Link } from 'react-router-dom';
import {
  FaStar,
  FaUserTie,
  FaRegClock,
  FaMapMarkerAlt,
  FaCode,
} from 'react-icons/fa';

interface FreelancerCardProps {
  freelancer: {
    _id: string;
    name: string;
    skills: string[];
    bio?: string;
    hourlyRate?: number;
    availability?: string;
    completedProjects?: number;
    averageRating?: number;
    location?: string;
  };
  compact?: boolean;
}

const FreelancerCard = ({
  freelancer,
  compact = false,
}: FreelancerCardProps) => {
  // Render star rating
  const renderStarRating = (rating?: number) => {
    if (!rating) return null;

    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<FaStar key={i} className="text-yellow-400" />);
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(<FaStar key={i} className="text-yellow-300" />);
      } else {
        stars.push(<FaStar key={i} className="text-gray-300" />);
      }
    }

    return (
      <div className="flex items-center">
        <div className="flex">{stars}</div>
        <span className="ml-1 text-sm text-gray-600">{rating.toFixed(1)}</span>
      </div>
    );
  };

  if (compact) {
    return (
      <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200 transition-all duration-200 hover:shadow-md">
        <div className="p-4">
          <div className="flex items-center">
            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-primary-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold mr-3">
              {freelancer.name.charAt(0)}
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-800">
                <Link
                  to={`/freelancers/${freelancer._id}`}
                  className="hover:text-primary-600"
                >
                  {freelancer.name}
                </Link>
              </h3>
              {renderStarRating(freelancer.averageRating)}
            </div>
          </div>

          <div className="mt-2 flex flex-wrap gap-1">
            {freelancer.skills.slice(0, 3).map((skill, index) => (
              <span
                key={index}
                className="inline-block bg-gray-100 rounded-full px-2 py-0.5 text-xs font-medium text-gray-700"
              >
                {skill}
              </span>
            ))}
            {freelancer.skills.length > 3 && (
              <span className="inline-block bg-gray-100 rounded-full px-2 py-0.5 text-xs font-medium text-gray-700">
                +{freelancer.skills.length - 3}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 transition-all duration-200 hover:shadow-lg h-full flex flex-col">
      <div className="p-6 flex-grow">
        <div className="flex items-center mb-4">
          <div className="h-12 w-12 rounded-full bg-gradient-to-r from-primary-500 to-indigo-600 flex items-center justify-center text-white text-xl font-bold mr-4">
            {freelancer.name.charAt(0)}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">
              <Link
                to={`/freelancers/${freelancer._id}`}
                className="hover:text-primary-600"
              >
                {freelancer.name}
              </Link>
            </h3>
            {renderStarRating(freelancer.averageRating)}
          </div>
        </div>

        <div className="mb-4">
          <p className="text-gray-600 line-clamp-3">
            {freelancer.bio || 'No bio available.'}
          </p>
        </div>

        <div className="space-y-2 mb-4">
          {freelancer.hourlyRate && (
            <div className="flex items-center text-sm">
              <FaUserTie className="mr-2 text-primary-600" />
              <span>${freelancer.hourlyRate}/hr</span>
            </div>
          )}

          {freelancer.completedProjects ? (
            <div className="flex items-center text-sm">
              <FaCode className="mr-2 text-green-600" />
              <span>{freelancer.completedProjects} projects completed</span>
            </div>
          ) : null}

          {freelancer.availability && (
            <div className="flex items-center text-sm">
              <FaRegClock className="mr-2 text-blue-600" />
              <span>{freelancer.availability}</span>
            </div>
          )}

          {freelancer.location && (
            <div className="flex items-center text-sm">
              <FaMapMarkerAlt className="mr-2 text-red-600" />
              <span>{freelancer.location}</span>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {freelancer.skills.slice(0, 4).map((skill, index) => (
            <span
              key={index}
              className="inline-block bg-gray-100 rounded-full px-3 py-1 text-xs font-medium text-gray-700"
            >
              {skill}
            </span>
          ))}
          {freelancer.skills.length > 4 && (
            <span className="inline-block bg-gray-100 rounded-full px-3 py-1 text-xs font-medium text-gray-700">
              +{freelancer.skills.length - 4} more
            </span>
          )}
        </div>
      </div>

      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
        <Link
          to={`/freelancers/${freelancer._id}`}
          className="text-primary-600 hover:text-primary-800 font-medium flex items-center justify-center"
        >
          View Profile
        </Link>
      </div>
    </div>
  );
};

export default FreelancerCard;
