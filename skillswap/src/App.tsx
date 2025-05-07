import {
  BrowserRouter as Router,
  Routes,
  Route,
  useParams,
} from 'react-router-dom';

// Layouts
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';

// Pages
import Home from './pages/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/dashboard/Dashboard';
import ClientAnalytics from './pages/dashboard/ClientAnalytics';
import NotFound from './pages/NotFound';
import FreelancersPage from './pages/FreelancersPage';
import FreelancerProfile from './pages/freelancers/FreelancerProfile';
import UserProfile from './pages/profile/UserProfile';
import MyProjectsPage from './pages/projects/MyProjectsPage';

// Project Components
import ProjectList from './components/projects/ProjectList';
import CreateProject from './components/projects/CreateProject';
import ProjectDetails from './components/projects/ProjectDetails';

// Add Messages import
import Messages from './pages/messages/Messages';

// Context
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Home />} />
          </Route>

          {/* Auth routes */}
          <Route path="/" element={<AuthLayout />}>
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
          </Route>

          {/* Dashboard routes */}
          <Route path="/dashboard" element={<MainLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="analytics" element={<ClientAnalytics />} />
          </Route>

          {/* Project routes */}
          <Route path="/projects" element={<MainLayout />}>
            <Route index element={<ProjectList />} />
            <Route path="new" element={<CreateProject />} />
            <Route path="my-projects" element={<MyProjectsPage />} />
            <Route path=":id" element={<ProjectDetailsWrapper />} />
          </Route>

          {/* Freelancer routes */}
          <Route path="/freelancers" element={<MainLayout />}>
            <Route index element={<FreelancersPage />} />
            <Route path=":id" element={<FreelancerProfileWrapper />} />
          </Route>

          {/* Message routes */}
          <Route path="/messages" element={<MainLayout />}>
            <Route index element={<Messages />} />
            <Route path=":userId" element={<Messages />} />
          </Route>

          {/* Profile route */}
          <Route path="/profile" element={<MainLayout />}>
            <Route index element={<UserProfile />} />
          </Route>

          {/* 404 route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

// Wrapper for ProjectDetails to extract the projectId from URL params
const ProjectDetailsWrapper = () => {
  const { id } = useParams();
  return <ProjectDetails projectId={id!} />;
};

// Wrapper for FreelancerProfile to extract the freelancerId from URL params
const FreelancerProfileWrapper = () => {
  const { id } = useParams();
  return <FreelancerProfile freelancerId={id!} />;
};

export default App;
