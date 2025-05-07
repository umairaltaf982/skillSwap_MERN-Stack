import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import {
  FaStar,
  FaUserTie,
  FaRegClock,
  FaMapMarkerAlt,
  FaCode,
} from 'react-icons/fa';
import freelancerService from '../../services/freelancers';
import AuthContext from '../../context/AuthContext';
import ReviewList from '../../components/reviews/ReviewList';
import ReviewForm from '../../components/reviews/ReviewForm';

interface FreelancerProfileProps {
  freelancerId: string;
}

const FreelancerProfile = ({ freelancerId }: FreelancerProfileProps) => {
  const [freelancer, setFreelancer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchFreelancer = async () => {
      try {
        setLoading(true);
        const response = await freelancerService.getFreelancer(freelancerId);
        setFreelancer(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching freelancer:', err);
        setError('Failed to load freelancer profile. Please try again later.');
        setLoading(false);
      }
    };

    fetchFreelancer();
  }, [freelancerId]);

  // Allow any client to add a review
  const canReview = user && user.role === 'client' && user._id !== freelancerId;

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

  const handleReviewSubmitted = async () => {
    // Refresh freelancer data to update reviews
    try {
      const response = await freelancerService.getFreelancer(freelancerId);
      setFreelancer(response.data);
      setShowReviewForm(false);
    } catch (err) {
      console.error('Error refreshing freelancer data:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error || !freelancer) {
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Profile Header */}
        <div className="p-6 bg-gray-50 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <div className="h-20 w-20 rounded-full bg-gradient-to-r from-primary-500 to-indigo-600 flex items-center justify-center text-white text-3xl font-bold mr-6">
                {freelancer.name.charAt(0)}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  {freelancer.name}
                </h1>
                {renderStarRating(freelancer.averageRating)}
                <p className="text-gray-600 mt-1">
                  Member since{' '}
                  {new Date(freelancer.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="md:ml-auto flex space-x-3">
              <Link
                to={`/messages/${freelancer._id}`}
                className="btn btn-primary"
              >
                Contact
              </Link>
              {canReview && (
                <button
                  onClick={() => setShowReviewForm(!showReviewForm)}
                  className="btn btn-outline"
                >
                  {showReviewForm ? 'Cancel' : 'Write a Review'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Review Form Banner */}
        {showReviewForm && (
          <div className="bg-primary-50 p-4 border-b border-primary-100">
            <div className="container mx-auto">
              <div className="flex items-center justify-between">
                <p className="text-primary-700">
                  You're writing a review for {freelancer.name}
                </p>
                <button
                  onClick={() => setShowReviewForm(false)}
                  className="text-primary-700 hover:text-primary-900"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Profile Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Left Column - Main Info */}
            <div className="md:col-span-2">
              <section className="mb-8">
                <h2 className="text-xl font-semibold mb-4">About</h2>
                <p className="text-gray-700">
                  {freelancer.bio || 'No bio available.'}
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold mb-4">Skills</h2>
                <div className="flex flex-wrap gap-2">
                  {freelancer.skills.map((skill: string, index: number) => (
                    <span
                      key={index}
                      className="bg-primary-50 text-primary-700 rounded-full px-3 py-1 text-sm font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </section>

              {/* Reviews Section */}
              <section>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold">Reviews</h2>
                </div>

                {showReviewForm && (
                  <div className="mb-8">
                    <ReviewForm
                      freelancerId={freelancerId}
                      onReviewSubmitted={handleReviewSubmitted}
                    />
                  </div>
                )}

                <ReviewList freelancerId={freelancerId} />
              </section>
            </div>

            {/* Right Column - Stats & Info */}
            <div>
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Freelancer Info</h3>

                <div className="space-y-4">
                  {freelancer.hourlyRate && (
                    <div className="flex items-center">
                      <FaUserTie className="mr-3 text-primary-600" />
                      <div>
                        <p className="font-medium">Hourly Rate</p>
                        <p className="text-gray-600">
                          ${freelancer.hourlyRate}/hr
                        </p>
                      </div>
                    </div>
                  )}

                  {freelancer.completedProjects &&
                    freelancer.completedProjects.length > 0 && (
                      <div className="flex items-start">
                        <FaCode className="mr-3 text-green-600 mt-1" />
                        <div>
                          <p className="font-medium">Completed Projects</p>
                          <div className="text-gray-600">
                            {Array.isArray(freelancer.completedProjects) ? (
                              <ul className="list-disc pl-4 mt-1">
                                {freelancer.completedProjects.map(
                                  (project: any, index: number) => (
                                    <li key={index} className="mb-1">
                                      <Link
                                        to={`/projects/${project._id}`}
                                        className="hover:text-primary-600"
                                      >
                                        {project.title}
                                      </Link>
                                    </li>
                                  )
                                )}
                              </ul>
                            ) : (
                              <span>{freelancer.completedProjects.length}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                  {freelancer.activeProjects &&
                    freelancer.activeProjects.length > 0 && (
                      <div className="flex items-start">
                        <FaCode className="mr-3 text-yellow-600 mt-1" />
                        <div>
                          <p className="font-medium">Active Projects</p>
                          <div className="text-gray-600">
                            {Array.isArray(freelancer.activeProjects) ? (
                              <ul className="list-disc pl-4 mt-1">
                                {freelancer.activeProjects.map(
                                  (project: any, index: number) => (
                                    <li key={index} className="mb-1">
                                      <Link
                                        to={`/projects/${project._id}`}
                                        className="hover:text-primary-600"
                                      >
                                        {project.title}
                                      </Link>
                                    </li>
                                  )
                                )}
                              </ul>
                            ) : (
                              <span>{freelancer.activeProjects.length}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                  {freelancer.availability && (
                    <div className="flex items-center">
                      <FaRegClock className="mr-3 text-blue-600" />
                      <div>
                        <p className="font-medium">Availability</p>
                        <p className="text-gray-600">
                          {freelancer.availability}
                        </p>
                      </div>
                    </div>
                  )}

                  {freelancer.location && (
                    <div className="flex items-center">
                      <FaMapMarkerAlt className="mr-3 text-red-600" />
                      <div>
                        <p className="font-medium">Location</p>
                        <p className="text-gray-600">{freelancer.location}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FreelancerProfile;
