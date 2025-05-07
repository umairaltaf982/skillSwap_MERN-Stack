import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';
import projectService from '../../services/projects';
import Alert from '../common/Alert';
import {
  FaPlus,
  FaTimes,
  FaBriefcase,
  FaTag,
  FaDollarSign,
  FaCalendarAlt,
  FaList,
  FaInfoCircle,
} from 'react-icons/fa';

const CreateProject = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    requirements: '',
    category: '',
    budget: '',
    deadline: '',
    skills: [] as string[],
    skillInput: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Categories for dropdown
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

  // Handle form input changes
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle skill input
  const handleSkillInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, skillInput: e.target.value });
  };

  // Add skill to form data
  const handleAddSkill = () => {
    if (
      formData.skillInput.trim() !== '' &&
      !formData.skills.includes(formData.skillInput.trim())
    ) {
      setFormData({
        ...formData,
        skills: [...formData.skills, formData.skillInput.trim()],
        skillInput: '',
      });
    }
  };

  // Remove skill from form data
  const handleRemoveSkill = (skillToRemove: string) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter((skill) => skill !== skillToRemove),
    });
  };

  // Handle skill input key down (Enter)
  const handleSkillInputKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddSkill();
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validate form
    if (formData.skills.length === 0) {
      setError('Please add at least one required skill');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Prepare project data
      const projectData = {
        title: formData.title,
        description: formData.description,
        requirements: formData.requirements,
        category: formData.category,
        budget: parseFloat(formData.budget),
        deadline: formData.deadline,
        skills: formData.skills,
      };

      // Create project
      const response = await projectService.createProject(projectData);

      setSuccess('Project created successfully!');
      setLoading(false);

      // Redirect to project details page after a short delay
      setTimeout(() => {
        navigate(`/projects/${response.data._id}`);
      }, 1500);
    } catch (err: any) {
      console.error('Error creating project:', err);
      setError(
        err.response?.data?.error ||
          'Failed to create project. Please try again later.'
      );
      setLoading(false);
    }
  };

  // If user is not a client, show error
  if (user && user.role !== 'client') {
    return (
      <div
        className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
        role="alert"
      >
        <strong className="font-bold">Access Denied!</strong>
        <span className="block sm:inline">
          {' '}
          Only clients can create projects.
        </span>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-b from-white to-gray-50 rounded-xl shadow-lg p-8 border border-gray-100">
      <div className="flex items-center mb-8 pb-4 border-b border-gray-200">
        <div className="bg-primary-100 p-3 rounded-full mr-4">
          <FaBriefcase className="text-primary-600 text-xl" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Create a New Project
          </h1>
          <p className="text-gray-500">
            Fill in the details to post your project and find talented
            freelancers
          </p>
        </div>
      </div>

      {error && (
        <Alert type="error" message={error} onClose={() => setError(null)} />
      )}

      {success && (
        <Alert
          type="success"
          message={success}
          onClose={() => setSuccess(null)}
        />
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center mb-4 text-gray-700">
            <FaInfoCircle className="mr-2 text-primary-500" />
            <h2 className="text-lg font-semibold">Basic Information</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Project Title
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaTag className="text-gray-400" />
                </div>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="form-input pl-10 block w-full shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm border-gray-300 rounded-md"
                  placeholder="E.g., 'Website Redesign for Retail Business'"
                  required
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="category"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Category
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaList className="text-gray-400" />
                </div>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="form-input pl-10 block w-full shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm border-gray-300 rounded-md"
                  required
                >
                  <option value="">Select project category</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center mb-4 text-gray-700">
            <FaInfoCircle className="mr-2 text-primary-500" />
            <h2 className="text-lg font-semibold">Project Details</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Project Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="form-input block w-full shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm border-gray-300 rounded-md h-32"
                placeholder="Provide a detailed description of what you need..."
                required
              ></textarea>
              <p className="mt-1 text-xs text-gray-500">
                Detailed description helps freelancers understand your project
                better
              </p>
            </div>

            <div>
              <label
                htmlFor="requirements"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Project Requirements
              </label>
              <textarea
                id="requirements"
                name="requirements"
                value={formData.requirements}
                onChange={handleChange}
                className="form-input block w-full shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm border-gray-300 rounded-md h-32"
                placeholder="List specific requirements, deliverables, or expectations..."
                required
              ></textarea>
              <p className="mt-1 text-xs text-gray-500">
                Clear requirements ensure you get exactly what you need
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center mb-4 text-gray-700">
            <FaInfoCircle className="mr-2 text-primary-500" />
            <h2 className="text-lg font-semibold">Budget & Timeline</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="budget"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Budget (USD)
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaDollarSign className="text-gray-400" />
                </div>
                <input
                  type="number"
                  id="budget"
                  name="budget"
                  value={formData.budget}
                  onChange={handleChange}
                  className="form-input pl-10 block w-full shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm border-gray-300 rounded-md"
                  placeholder="Enter your budget"
                  min="1"
                  step="0.01"
                  required
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Setting a fair budget attracts quality freelancers
              </p>
            </div>

            <div>
              <label
                htmlFor="deadline"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Deadline
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaCalendarAlt className="text-gray-400" />
                </div>
                <input
                  type="date"
                  id="deadline"
                  name="deadline"
                  value={formData.deadline}
                  onChange={handleChange}
                  className="form-input pl-10 block w-full shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm border-gray-300 rounded-md"
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Realistic deadlines help set proper expectations
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center mb-4 text-gray-700">
            <FaInfoCircle className="mr-2 text-primary-500" />
            <h2 className="text-lg font-semibold">Required Skills</h2>
          </div>

          <div>
            <label
              htmlFor="skills"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Add Skills Needed for This Project
            </label>
            <div className="flex">
              <div className="relative flex-grow rounded-md shadow-sm">
                <input
                  type="text"
                  id="skillInput"
                  value={formData.skillInput}
                  onChange={handleSkillInputChange}
                  onKeyDown={handleSkillInputKeyDown}
                  className="form-input block w-full shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm border-gray-300 rounded-l-md"
                  placeholder="E.g., JavaScript, Python, Photoshop..."
                />
              </div>
              <button
                type="button"
                onClick={handleAddSkill}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-r-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <FaPlus className="mr-2" /> Add Skill
              </button>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Adding relevant skills will help match your project with qualified
              freelancers
            </p>

            {formData.skills.length > 0 ? (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Selected Skills:
                </p>
                <div className="flex flex-wrap gap-2">
                  {formData.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800 transition-all hover:bg-primary-200"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skill)}
                        className="ml-2 text-primary-600 hover:text-primary-900 focus:outline-none"
                      >
                        <FaTimes className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <div className="mt-4 p-4 border border-dashed border-gray-300 rounded-md bg-gray-50 text-center">
                <p className="text-sm text-gray-500">
                  No skills added yet. Add at least one skill to continue.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end space-x-4 pt-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-150"
            disabled={loading}
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Creating Project...
              </>
            ) : (
              'Publish Project'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateProject;
