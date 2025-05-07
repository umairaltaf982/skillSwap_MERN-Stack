import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaUser,
  FaEnvelope,
  FaBuilding,
  FaGlobe,
  FaMapMarkerAlt,
  FaInfoCircle,
  FaCode,
  FaMoneyBillWave,
  FaClock,
} from 'react-icons/fa';
import AuthContext from '../../context/AuthContext';
import clientService from '../../services/clients';
import freelancerService from '../../services/freelancers';

interface ProfileFormData {
  // Common fields
  name?: string;
  email?: string;
  bio?: string;
  location?: string;

  // Client specific fields
  company?: string;
  website?: string;

  // Freelancer specific fields
  skills?: string[];
  hourlyRate?: number;
  availability?: string;
}

const UserProfile = () => {
  const { user, updateUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<ProfileFormData>({});
  const [skillInput, setSkillInput] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    fetchProfileData();
  }, [user, navigate]);

  const fetchProfileData = async () => {
    try {
      setLoading(true);

      let response;

      // Get profile data based on user role
      if (user?.role === 'client') {
        response = await clientService.getProfile();
      } else {
        response = await freelancerService.getProfile();
      }

      if (response.success) {
        const profileData = response.data;

        // Set form data based on user role
        setFormData({
          name: profileData.name,
          email: profileData.email,
          bio: profileData.bio || '',
          location: profileData.location || '',

          // Client specific fields
          company:
            user?.role === 'client' ? profileData.company || '' : undefined,
          website:
            user?.role === 'client' ? profileData.website || '' : undefined,

          // Freelancer specific fields
          skills:
            user?.role === 'freelancer' ? profileData.skills || [] : undefined,
          hourlyRate:
            user?.role === 'freelancer'
              ? profileData.hourlyRate || ''
              : undefined,
          availability:
            user?.role === 'freelancer'
              ? profileData.availability || ''
              : undefined,
        });
      }

      setLoading(false);
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError('Failed to load profile data. Please try again later.');
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddSkill = () => {
    if (skillInput.trim() && formData.skills) {
      if (!formData.skills.includes(skillInput.trim())) {
        setFormData((prev) => ({
          ...prev,
          skills: [...(prev.skills || []), skillInput.trim()],
        }));
      }
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    if (formData.skills) {
      setFormData((prev) => ({
        ...prev,
        skills: prev.skills?.filter((skill) => skill !== skillToRemove),
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSaving(true);

      // Prepare data based on user role
      const dataToSubmit =
        user?.role === 'client'
          ? {
              bio: formData.bio,
              location: formData.location,
              company: formData.company,
              website: formData.website,
            }
          : {
              bio: formData.bio,
              location: formData.location,
              skills: formData.skills,
              hourlyRate: formData.hourlyRate,
              availability: formData.availability,
            };

      let response;

      // Update profile based on user role
      if (user?.role === 'client') {
        response = await clientService.updateProfile(dataToSubmit);
      } else {
        response = await freelancerService.updateProfile(dataToSubmit);
      }

      if (response.success) {
        // Update user context if needed
        if (updateUser) {
          updateUser({
            ...user,
            ...response.data,
          });
        }

        // Show success message or redirect
        alert('Profile updated successfully!');
      }

      setSaving(false);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile. Please try again later.');
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6 bg-gray-50 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-800">Your Profile</h1>
          <p className="text-gray-600">
            Manage your personal information and settings
          </p>
        </div>

        {error && (
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 m-6 rounded"
            role="alert"
          >
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="md:col-span-2">
              <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 mb-2" htmlFor="name">
                    <FaUser className="inline mr-2" />
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name || ''}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    disabled
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Name cannot be changed
                  </p>
                </div>

                <div>
                  <label className="block text-gray-700 mb-2" htmlFor="email">
                    <FaEnvelope className="inline mr-2" />
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email || ''}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    disabled
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Email cannot be changed
                  </p>
                </div>
              </div>
            </div>

            {/* Common Fields */}
            <div className="md:col-span-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    className="block text-gray-700 mb-2"
                    htmlFor="location"
                  >
                    <FaMapMarkerAlt className="inline mr-2" />
                    Location
                  </label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={formData.location || ''}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="e.g., New York, USA"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-gray-700 mb-2" htmlFor="bio">
                    <FaInfoCircle className="inline mr-2" />
                    Bio
                  </label>
                  <textarea
                    id="bio"
                    name="bio"
                    value={formData.bio || ''}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    rows={4}
                    placeholder="Tell us about yourself..."
                  ></textarea>
                </div>
              </div>
            </div>

            {/* Client Specific Fields */}
            {user?.role === 'client' && (
              <div className="md:col-span-2">
                <h2 className="text-xl font-semibold mb-4">
                  Client Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label
                      className="block text-gray-700 mb-2"
                      htmlFor="company"
                    >
                      <FaBuilding className="inline mr-2" />
                      Company
                    </label>
                    <input
                      type="text"
                      id="company"
                      name="company"
                      value={formData.company || ''}
                      onChange={handleChange}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      placeholder="Your company name"
                    />
                  </div>

                  <div>
                    <label
                      className="block text-gray-700 mb-2"
                      htmlFor="website"
                    >
                      <FaGlobe className="inline mr-2" />
                      Website
                    </label>
                    <input
                      type="url"
                      id="website"
                      name="website"
                      value={formData.website || ''}
                      onChange={handleChange}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      placeholder="https://example.com"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Freelancer Specific Fields */}
            {user?.role === 'freelancer' && (
              <div className="md:col-span-2">
                <h2 className="text-xl font-semibold mb-4">
                  Freelancer Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label
                      className="block text-gray-700 mb-2"
                      htmlFor="hourlyRate"
                    >
                      <FaMoneyBillWave className="inline mr-2" />
                      Hourly Rate ($)
                    </label>
                    <input
                      type="number"
                      id="hourlyRate"
                      name="hourlyRate"
                      value={formData.hourlyRate || ''}
                      onChange={handleChange}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      placeholder="Your hourly rate"
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div>
                    <label
                      className="block text-gray-700 mb-2"
                      htmlFor="availability"
                    >
                      <FaClock className="inline mr-2" />
                      Availability
                    </label>
                    <select
                      id="availability"
                      name="availability"
                      value={formData.availability || ''}
                      onChange={handleChange}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="">Select availability</option>
                      <option value="Full-time">Full-time</option>
                      <option value="Part-time">Part-time</option>
                      <option value="Weekends only">Weekends only</option>
                      <option value="Evenings only">Evenings only</option>
                      <option value="Limited availability">
                        Limited availability
                      </option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-gray-700 mb-2">
                      <FaCode className="inline mr-2" />
                      Skills
                    </label>
                    <div className="flex mb-2">
                      <input
                        type="text"
                        value={skillInput}
                        onChange={(e) => setSkillInput(e.target.value)}
                        className="flex-grow p-2 border border-gray-300 rounded-l-md"
                        placeholder="Add a skill (e.g., JavaScript, React)"
                        onKeyDown={(e) =>
                          e.key === 'Enter' &&
                          (e.preventDefault(), handleAddSkill())
                        }
                      />
                      <button
                        type="button"
                        onClick={handleAddSkill}
                        className="bg-primary-600 text-white px-4 py-2 rounded-r-md hover:bg-primary-700"
                      >
                        Add
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.skills?.map((skill, index) => (
                        <span
                          key={index}
                          className="bg-primary-50 text-primary-700 rounded-full px-3 py-1 text-sm font-medium flex items-center"
                        >
                          {skill}
                          <button
                            type="button"
                            onClick={() => handleRemoveSkill(skill)}
                            className="ml-2 text-primary-700 hover:text-primary-900"
                          >
                            &times;
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="md:col-span-2 mt-6">
              <button
                type="submit"
                className="bg-primary-600 text-white px-6 py-2 rounded-md hover:bg-primary-700 disabled:bg-gray-400"
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserProfile;
