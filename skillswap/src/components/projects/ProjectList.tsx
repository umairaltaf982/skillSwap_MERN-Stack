import { useState, useEffect } from 'react';
import ProjectCard from './ProjectCard';
import projectService from '../../services/projects';
import { FaSearch, FaFilter, FaSortAmountDown, FaSortAmountUp } from 'react-icons/fa';

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
  bids?: {
    length: number;
  };
  createdAt: string;
}

interface ProjectListProps {
  initialFilters?: {
    category?: string;
    skills?: string[];
    status?: string;
  };
}

const ProjectList = ({ initialFilters = {} }: ProjectListProps) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    search: '',
    category: initialFilters.category || '',
    minBudget: '',
    maxBudget: '',
    status: initialFilters.status || 'open',
    skills: initialFilters.skills || [],
  });
  const [sort, setSort] = useState({
    field: 'createdAt',
    direction: 'desc',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [skillInput, setSkillInput] = useState('');

  // Categories for filter dropdown
  const categories = [
    'Web Development',
    'Mobile Development',
    'UI/UX Design',
    'Graphic Design',
    'Content Writing',
    'Digital Marketing',
    'Video Editing',
    'Data Entry',
    'Other',
  ];

  // Fetch projects
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        
        // Build query parameters
        const params: any = {
          status: filters.status,
          sort: `${sort.direction === 'desc' ? '-' : ''}${sort.field}`,
        };
        
        if (filters.category) params.category = filters.category;
        if (filters.minBudget) params.budget = { $gte: filters.minBudget };
        if (filters.maxBudget) params.budget = { ...params.budget, $lte: filters.maxBudget };
        if (filters.skills.length > 0) params.skills = { $in: filters.skills };
        
        const response = await projectService.getProjects(params);
        
        // Filter by search term if provided
        let filteredProjects = response.data;
        if (filters.search) {
          const searchTerm = filters.search.toLowerCase();
          filteredProjects = filteredProjects.filter((project: Project) =>
            project.title.toLowerCase().includes(searchTerm) ||
            project.description.toLowerCase().includes(searchTerm)
          );
        }
        
        setProjects(filteredProjects);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching projects:', err);
        setError('Failed to load projects. Please try again later.');
        setLoading(false);
      }
    };

    fetchProjects();
  }, [filters, sort]);

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ ...filters, search: e.target.value });
  };

  // Handle filter changes
  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  // Handle sort change
  const handleSortChange = (field: string) => {
    if (sort.field === field) {
      // Toggle direction if same field
      setSort({
        field,
        direction: sort.direction === 'asc' ? 'desc' : 'asc',
      });
    } else {
      // Default to desc for new field
      setSort({
        field,
        direction: 'desc',
      });
    }
  };

  // Handle skill input
  const handleSkillInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSkillInput(e.target.value);
  };

  // Add skill to filters
  const handleAddSkill = () => {
    if (skillInput.trim() !== '' && !filters.skills.includes(skillInput.trim())) {
      setFilters({
        ...filters,
        skills: [...filters.skills, skillInput.trim()],
      });
      setSkillInput('');
    }
  };

  // Remove skill from filters
  const handleRemoveSkill = (skillToRemove: string) => {
    setFilters({
      ...filters,
      skills: filters.skills.filter(skill => skill !== skillToRemove),
    });
  };

  // Handle skill input key down (Enter)
  const handleSkillInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddSkill();
    }
  };

  // Reset filters
  const handleResetFilters = () => {
    setFilters({
      search: '',
      category: '',
      minBudget: '',
      maxBudget: '',
      status: 'open',
      skills: [],
    });
    setSort({
      field: 'createdAt',
      direction: 'desc',
    });
  };

  // Toggle filters visibility
  const toggleFilters = () => {
    setShowFilters(!showFilters);
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
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
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
              placeholder="Search projects..."
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
              onClick={() => handleSortChange('createdAt')}
              className={`btn ${
                sort.field === 'createdAt'
                  ? 'btn-primary'
                  : 'btn-outline'
              } flex items-center justify-center mr-2`}
            >
              {sort.field === 'createdAt' && sort.direction === 'desc' ? (
                <FaSortAmountDown className="mr-2" />
              ) : (
                <FaSortAmountUp className="mr-2" />
              )}
              Date
            </button>
            <button
              onClick={() => handleSortChange('budget')}
              className={`btn ${
                sort.field === 'budget' ? 'btn-primary' : 'btn-outline'
              } flex items-center justify-center`}
            >
              {sort.field === 'budget' && sort.direction === 'desc' ? (
                <FaSortAmountDown className="mr-2" />
              ) : (
                <FaSortAmountUp className="mr-2" />
              )}
              Budget
            </button>
          </div>
        </div>

        {/* Expanded Filters */}
        {showFilters && (
          <div className="bg-white rounded-lg shadow-md p-4 mb-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label htmlFor="category" className="form-label">
                  Category
                </label>
                <select
                  id="category"
                  name="category"
                  value={filters.category}
                  onChange={handleFilterChange}
                  className="form-input"
                >
                  <option value="">All Categories</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="status" className="form-label">
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  value={filters.status}
                  onChange={handleFilterChange}
                  className="form-input"
                >
                  <option value="open">Open</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="">All Statuses</option>
                </select>
              </div>
              <div>
                <label htmlFor="budget" className="form-label">
                  Budget Range
                </label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    id="minBudget"
                    name="minBudget"
                    placeholder="Min"
                    value={filters.minBudget}
                    onChange={handleFilterChange}
                    className="form-input w-1/2"
                    min="0"
                  />
                  <input
                    type="number"
                    id="maxBudget"
                    name="maxBudget"
                    placeholder="Max"
                    value={filters.maxBudget}
                    onChange={handleFilterChange}
                    className="form-input w-1/2"
                    min="0"
                  />
                </div>
              </div>
            </div>

            <div className="mb-4">
              <label htmlFor="skills" className="form-label">
                Skills
              </label>
              <div className="flex">
                <input
                  type="text"
                  id="skillInput"
                  value={skillInput}
                  onChange={handleSkillInputChange}
                  onKeyDown={handleSkillInputKeyDown}
                  className="form-input flex-grow"
                  placeholder="Add skills..."
                />
                <button
                  type="button"
                  onClick={handleAddSkill}
                  className="ml-2 bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700"
                >
                  Add
                </button>
              </div>
              {filters.skills.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {filters.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="bg-primary-100 text-primary-800 rounded-full px-3 py-1 text-sm font-semibold flex items-center"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skill)}
                        className="ml-2 text-primary-600 hover:text-primary-800 focus:outline-none"
                      >
                        &times;
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleResetFilters}
                className="btn btn-outline mr-2"
              >
                Reset Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Project List */}
      {projects.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <h3 className="text-xl font-semibold mb-2">No projects found</h3>
          <p className="text-gray-600 mb-4">
            Try adjusting your search or filter criteria.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {projects.map((project) => (
            <ProjectCard key={project._id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectList;
