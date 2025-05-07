import { ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface AuthLayoutProps {
  children: ReactNode;
}

const AuthLayout = ({ children }: AuthLayoutProps) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Link to="/">
            <h2 className="text-3xl font-extrabold text-primary-600">SkillSwap Admin</h2>
          </Link>
          <p className="mt-2 text-sm text-gray-600">
            Admin Panel for SkillSwap Platform
          </p>
        </div>
        {children}
      </div>
    </div>
  );
};

export default AuthLayout;
