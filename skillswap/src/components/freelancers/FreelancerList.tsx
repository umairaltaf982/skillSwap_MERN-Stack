import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import freelancerService from '../../services/freelancers';
import AuthContext from '../../context/AuthContext';
import {
  FaSearch,
  FaFilter,
  FaSortAmountDown,
  FaSortAmountUp,
  FaStar,
  FaUserTie,
  FaRegClock,
  FaMapMarkerAlt,
  FaCode,
  FaTimes,
  FaComment, // Add this import for the message icon
} from 'react-icons/fa';

interface Freelancer {
  _id: string;
  name: string;
  skills: string[];
  bio?: string;
  hourlyRate?: number;
  availability?: string;
  completedProjects?: number;
  averageRating?: number;
  location?: string;
  createdAt: string;
}

interface FreelancerListProps {
  initialFilters?: {
    skills?: string[];
    minRating?: number;
  };
}

const FreelancerList = ({ initialFilters = {} }: FreelancerListProps) => {
  const [freelancers, setFreelancers] = useState<Freelancer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    search: '',
    skills: initialFilters.skills || [],
    minRating: initialFilters.minRating || '',
    minHourlyRate: '',
    maxHourlyRate: '',
    availability: '',
    location: '',
    skillInput: '',
  });
  const [sort, setSort] = useState({
    field: 'averageRating',
    direction: 'desc',
  });
  const [showFilters, setShowFilters] = useState(false);
  const { user } = useContext(AuthContext); // Add this to access the logged-in user

  // Fetch freelancers
  useEffect(() => {
    const fetchFreelancers = async () => {
      try {
        setLoading(true);

        // Build query parameters
        const params: any = {
          sort: `${sort.direction === 'desc' ? '-' : ''}${sort.field}`,
        };

        if (filters.minRating) params.minRating = filters.minRating;
        if (filters.minHourlyRate) params.minHourlyRate = filters.minHourlyRate;
        if (filters.maxHourlyRate) params.maxHourlyRate = filters.maxHourlyRate;
        if (filters.availability) params.availability = filters.availability;
        if (filters.location) params.location = filters.location;
        if (filters.skills.length > 0) params.skills = { $in: filters.skills };

        const response = await freelancerService.getFreelancers(params);

        // Filter by search term if provided
        let filteredFreelancers = response.data;
        if (filters.search) {
          const searchTerm = filters.search.toLowerCase();
          filteredFreelancers = filteredFreelancers.filter(
            (freelancer: Freelancer) =>
              freelancer.name.toLowerCase().includes(searchTerm) ||
              freelancer.bio?.toLowerCase().includes(searchTerm) ||
              freelancer.skills.some((skill) =>
                skill.toLowerCase().includes(searchTerm)
              )
          );
        }

        setFreelancers(filteredFreelancers);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching freelancers:', err);
        setError('Failed to load freelancers. Please try again later.');
        setLoading(false);
      }
    };

    fetchFreelancers();
  }, [filters, sort]);

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ ...filters, search: e.target.value });
  };

  // Handle filter changes
  const handleFilterChange = (
    e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>
  ) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  // Handle sort change
  const handleSortChange = (field: string) => {
    setSort({
      field,
      direction:
        sort.field === field && sort.direction === 'desc' ? 'asc' : 'desc',
    });
  };

  // Handle skill input
  const handleSkillInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ ...filters, skillInput: e.target.value });
  };

  // Add skill to filters
  const handleAddSkill = () => {
    if (
      filters.skillInput.trim() !== '' &&
      !filters.skills.includes(filters.skillInput.trim())
    ) {
      setFilters({
        ...filters,
        skills: [...filters.skills, filters.skillInput.trim()],
        skillInput: '',
      });
    }
  };

  // Remove skill from filters
  const handleRemoveSkill = (skillToRemove: string) => {
    setFilters({
      ...filters,
      skills: filters.skills.filter((skill) => skill !== skillToRemove),
    });
  };

  // Handle skill input key down
  const handleSkillInputKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddSkill();
    }
  };

  // Reset filters
  const handleResetFilters = () => {
    setFilters({
      search: '',
      skills: [],
      minRating: '',
      minHourlyRate: '',
      maxHourlyRate: '',
      availability: '',
      location: '',
      skillInput: '',
    });
    setSort({
      field: 'averageRating',
      direction: 'desc',
    });
  };

  // Toggle filters visibility
  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

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

  return (
    <div>
      {/* Search and Filter Bar */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="flex-grow relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              className="form-input pl-10 w-full"
              placeholder="Search freelancers by name, skills, or bio..."
              value={filters.search}
              onChange={handleSearchChange}
            />
          </div>
          <button
            onClick={toggleFilters}
            className="btn btn-outline flex items-center justify-center"
          >
            <FaFilter className="mr-2" />
            Filters
          </button>
          <div className="flex">
            <button
              onClick={() => handleSortChange('averageRating')}
              className={`btn ${
                sort.field === 'averageRating' ? 'btn-primary' : 'btn-outline'
              } flex items-center`}
            >
              Rating
              {sort.field === 'averageRating' &&
                (sort.direction === 'desc' ? (
                  <FaSortAmountDown className="ml-2" />
                ) : (
                  <FaSortAmountUp className="ml-2" />
                ))}
            </button>
            <button
              onClick={() => handleSortChange('hourlyRate')}
              className={`btn ml-2 ${
                sort.field === 'hourlyRate' ? 'btn-primary' : 'btn-outline'
              } flex items-center`}
            >
              Rate
              {sort.field === 'hourlyRate' &&
                (sort.direction === 'desc' ? (
                  <FaSortAmountDown className="ml-2" />
                ) : (
                  <FaSortAmountUp className="ml-2" />
                ))}
            </button>
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label
                  htmlFor="minRating"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Minimum Rating
                </label>
                <select
                  id="minRating"
                  name="minRating"
                  value={filters.minRating}
                  onChange={handleFilterChange}
                  className="form-select w-full"
                >
                  <option value="">Any Rating</option>
                  <option value="4">4+ Stars</option>
                  <option value="3">3+ Stars</option>
                  <option value="2">2+ Stars</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="availability"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Availability
                </label>
                <select
                  id="availability"
                  name="availability"
                  value={filters.availability}
                  onChange={handleFilterChange}
                  className="form-select w-full"
                >
                  <option value="">Any Availability</option>
                  <option value="full-time">Full Time</option>
                  <option value="part-time">Part Time</option>
                  <option value="weekends">Weekends Only</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="location"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Location
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={filters.location}
                  onChange={handleFilterChange}
                  className="form-input w-full"
                  placeholder="Any Location"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label
                  htmlFor="minHourlyRate"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Min Hourly Rate ($)
                </label>
                <input
                  type="number"
                  id="minHourlyRate"
                  name="minHourlyRate"
                  value={filters.minHourlyRate}
                  onChange={handleFilterChange}
                  className="form-input w-full"
                  placeholder="Min Rate"
                  min="0"
                />
              </div>

              <div>
                <label
                  htmlFor="maxHourlyRate"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Max Hourly Rate ($)
                </label>
                <input
                  type="number"
                  id="maxHourlyRate"
                  name="maxHourlyRate"
                  value={filters.maxHourlyRate}
                  onChange={handleFilterChange}
                  className="form-input w-full"
                  placeholder="Max Rate"
                  min="0"
                />
              </div>
            </div>

            <div className="mb-4">
              <label
                htmlFor="skills"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Skills
              </label>
              <div className="flex">
                <input
                  type="text"
                  id="skillInput"
                  value={filters.skillInput}
                  onChange={handleSkillInputChange}
                  onKeyDown={handleSkillInputKeyDown}
                  className="form-input w-full rounded-r-none"
                  placeholder="Add skills (e.g., JavaScript, Design)"
                />
                <button
                  type="button"
                  onClick={handleAddSkill}
                  className="btn btn-primary rounded-l-none"
                >
                  Add
                </button>
              </div>

              {filters.skills.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {filters.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skill)}
                        className="ml-1.5 inline-flex items-center justify-center h-4 w-4 rounded-full text-primary-400 hover:bg-primary-200 hover:text-primary-600 focus:outline-none"
                      >
                        <FaTimes className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleResetFilters}
                className="btn btn-outline mr-2"
              >
                Reset Filters
              </button>
              <button
                type="button"
                onClick={toggleFilters}
                className="btn btn-primary"
              >
                Apply Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Results Count */}
      <div className="mb-4 text-gray-600">
        Found {freelancers.length} freelancer
        {freelancers.length !== 1 ? 's' : ''}
      </div>

      {/* Freelancer Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {freelancers.map((freelancer) => (
          <div
            key={freelancer._id}
            className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 transition-all duration-200 hover:shadow-lg"
          >
            <div className="p-6">
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
                    <span>
                      {freelancer.completedProjects} projects completed
                    </span>
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

              <div className="flex flex-wrap gap-2 mb-4">
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
              <div className="flex justify-between items-center">
                <Link
                  to={`/freelancers/${freelancer._id}`}
                  className="text-primary-600 hover:text-primary-800 font-medium flex items-center"
                >
                  View Profile
                </Link>

                {/* Message button - only visible to logged-in users */}
                {user && (
                  <Link
                    to={`/messages/${freelancer._id}`}
                    className="text-blue-600 hover:text-blue-800 font-medium flex items-center"
                  >
                    <FaComment className="mr-1" />
                    Message
                  </Link>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* No Results */}
      {freelancers.length === 0 && (
        <div className="bg-gray-50 p-8 rounded-lg text-center">
          <FaUserTie className="mx-auto text-gray-400 text-5xl mb-4" />
          <h3 className="text-xl font-medium text-gray-800 mb-2">
            No freelancers found
          </h3>
          <p className="text-gray-600 mb-4">
            Try adjusting your filters or search criteria.
          </p>
          <button onClick={handleResetFilters} className="btn btn-primary">
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
};

export default FreelancerList;
