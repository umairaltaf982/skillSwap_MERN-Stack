import { useState, useContext, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';
import Alert from '../../components/common/Alert';
import { FaUser, FaEnvelope, FaLock, FaPhone, FaBriefcase, FaUserTie } from 'react-icons/fa';

const Register = () => {
  const [searchParams] = useSearchParams();
  const defaultRole = searchParams.get('role') || 'client';

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    role: defaultRole,
    skills: [] as string[],
    skillInput: '',
  });

  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState<'success' | 'error' | 'info' | 'warning'>('error');

  const { register, error, isAuthenticated, clearError } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    // If user is already authenticated, redirect to dashboard
    if (isAuthenticated) {
      navigate('/dashboard');
    }

    // Show alert if there's an error
    if (error) {
      setAlertMessage(error);
      setAlertType('error');
      setShowAlert(true);
    }

    // Clear error when component unmounts
    return () => {
      clearError();
    };
  }, [isAuthenticated, navigate, error, clearError]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSkillInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, skillInput: e.target.value });
  };

  const handleAddSkill = () => {
    if (formData.skillInput.trim() !== '' && !formData.skills.includes(formData.skillInput.trim())) {
      setFormData({
        ...formData,
        skills: [...formData.skills, formData.skillInput.trim()],
        skillInput: '',
      });
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter(skill => skill !== skillToRemove),
    });
  };

  const handleSkillInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddSkill();
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setAlertMessage('Passwords do not match');
      setAlertType('error');
      setShowAlert(true);
      return;
    }

    // Validate skills for freelancers
    if (formData.role === 'freelancer' && formData.skills.length === 0) {
      setAlertMessage('Please add at least one skill');
      setAlertType('error');
      setShowAlert(true);
      return;
    }

    // Prepare data for registration
    const userData = {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      phone: formData.phone,
      role: formData.role,
      ...(formData.role === 'freelancer' && { skills: formData.skills }),
    };

    await register(userData);
  };

  return (
    <div className="w-full max-w-md">
      {showAlert && (
        <Alert
          type={alertType}
          message={alertMessage || error || ''}
          onClose={() => {
            setShowAlert(false);
            if (error) clearError();
          }}
        />
      )}

      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg px-8 pt-6 pb-8 mb-4">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Create an Account</h2>
        
        <div className="mb-4">
          <label htmlFor="role" className="form-label">
            I want to
          </label>
          <div className="flex space-x-4">
            <div
              className={`flex-1 p-3 border rounded-md cursor-pointer flex items-center justify-center ${
                formData.role === 'client'
                  ? 'border-primary-500 bg-primary-50 text-primary-700'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onClick={() => setFormData({ ...formData, role: 'client' })}
            >
              <FaBriefcase className="mr-2" />
              <span>Hire Freelancers</span>
            </div>
            <div
              className={`flex-1 p-3 border rounded-md cursor-pointer flex items-center justify-center ${
                formData.role === 'freelancer'
                  ? 'border-primary-500 bg-primary-50 text-primary-700'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onClick={() => setFormData({ ...formData, role: 'freelancer' })}
            >
              <FaUserTie className="mr-2" />
              <span>Find Work</span>
            </div>
          </div>
          <input
            type="hidden"
            name="role"
            value={formData.role}
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="name" className="form-label">
            Full Name
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaUser className="text-gray-400" />
            </div>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="form-input pl-10"
              placeholder="Enter your full name"
              required
            />
          </div>
        </div>
        
        <div className="mb-4">
          <label htmlFor="email" className="form-label">
            Email Address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaEnvelope className="text-gray-400" />
            </div>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="form-input pl-10"
              placeholder="Enter your email"
              required
            />
          </div>
        </div>
        
        <div className="mb-4">
          <label htmlFor="phone" className="form-label">
            Phone Number
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaPhone className="text-gray-400" />
            </div>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="form-input pl-10"
              placeholder="Enter your phone number"
            />
          </div>
        </div>
        
        {formData.role === 'freelancer' && (
          <div className="mb-4">
            <label htmlFor="skills" className="form-label">
              Skills
            </label>
            <div className="flex">
              <input
                type="text"
                id="skillInput"
                name="skillInput"
                value={formData.skillInput}
                onChange={handleSkillInputChange}
                onKeyDown={handleSkillInputKeyDown}
                className="form-input flex-grow"
                placeholder="Add your skills"
              />
              <button
                type="button"
                onClick={handleAddSkill}
                className="ml-2 bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700"
              >
                Add
              </button>
            </div>
            {formData.skills.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {formData.skills.map((skill, index) => (
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
        )}
        
        <div className="mb-4">
          <label htmlFor="password" className="form-label">
            Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaLock className="text-gray-400" />
            </div>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="form-input pl-10"
              placeholder="Create a password"
              minLength={6}
              required
            />
          </div>
        </div>
        
        <div className="mb-6">
          <label htmlFor="confirmPassword" className="form-label">
            Confirm Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaLock className="text-gray-400" />
            </div>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="form-input pl-10"
              placeholder="Confirm your password"
              minLength={6}
              required
            />
          </div>
        </div>
        
        <div className="mb-6">
          <button
            type="submit"
            className="w-full btn btn-primary py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Register
          </button>
        </div>
        
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-primary-600 hover:text-primary-800 font-medium"
            >
              Login
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
};

export default Register;
