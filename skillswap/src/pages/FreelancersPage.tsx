import { useLocation } from 'react-router-dom';
import FreelancerList from '../components/freelancers/FreelancerList';
import { FaUserTie } from 'react-icons/fa';

const FreelancersPage = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);

  // Extract any filter parameters from URL
  const category = searchParams.get('category') || '';
  const skillsParam = searchParams.get('skills');
  const skills = skillsParam ? skillsParam.split(',') : [];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-8">
        <div className="bg-primary-100 p-3 rounded-full mr-4">
          <FaUserTie className="text-primary-600 text-xl" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Freelancers</h1>
          <p className="text-gray-600">
            Find talented professionals with the skills you need
          </p>
        </div>
      </div>

      <FreelancerList
        initialFilters={{
          skills: skills,
        }}
      />
    </div>
  );
};

export default FreelancersPage;
