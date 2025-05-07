import React from 'react';
import { FaCheckCircle, FaShieldAlt, FaCrown } from 'react-icons/fa';

const VerificationLevels = () => {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Verification Levels</h1>
        <p className="text-gray-600">Manage freelancer verification levels and requirements</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Basic Level */}
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b flex items-center">
            <FaCheckCircle className="h-5 w-5 text-blue-500 mr-2" />
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              Basic
            </h3>
          </div>
          <div className="p-6">
            <p className="text-sm text-gray-600 mb-4">
              Default level for all new freelancers. Minimal verification required.
            </p>
            <h4 className="font-medium text-gray-900 mb-2">Requirements:</h4>
            <ul className="list-disc pl-5 text-sm text-gray-600 mb-4">
              <li>Email verification</li>
              <li>Complete profile information</li>
            </ul>
            <h4 className="font-medium text-gray-900 mb-2">Benefits:</h4>
            <ul className="list-disc pl-5 text-sm text-gray-600">
              <li>Access to basic platform features</li>
              <li>Ability to bid on projects</li>
            </ul>
          </div>
        </div>

        {/* Verified Level */}
        <div className="bg-white shadow-md rounded-lg overflow-hidden border-2 border-primary-500">
          <div className="px-4 py-5 sm:px-6 bg-primary-50 border-b flex items-center">
            <FaShieldAlt className="h-5 w-5 text-primary-600 mr-2" />
            <h3 className="text-lg font-medium leading-6 text-primary-900">
              Verified
            </h3>
          </div>
          <div className="p-6">
            <p className="text-sm text-gray-600 mb-4">
              Standard verification level. Requires ID verification and skill assessment.
            </p>
            <h4 className="font-medium text-gray-900 mb-2">Requirements:</h4>
            <ul className="list-disc pl-5 text-sm text-gray-600 mb-4">
              <li>Government-issued ID verification</li>
              <li>Phone number verification</li>
              <li>Portfolio review</li>
              <li>Skill assessment test</li>
            </ul>
            <h4 className="font-medium text-gray-900 mb-2">Benefits:</h4>
            <ul className="list-disc pl-5 text-sm text-gray-600">
              <li>Verified badge on profile</li>
              <li>Higher visibility in search results</li>
              <li>Access to more exclusive projects</li>
              <li>Higher client trust</li>
            </ul>
          </div>
        </div>

        {/* Premium Level */}
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:px-6 bg-yellow-50 border-b flex items-center">
            <FaCrown className="h-5 w-5 text-yellow-500 mr-2" />
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              Premium
            </h3>
          </div>
          <div className="p-6">
            <p className="text-sm text-gray-600 mb-4">
              Highest verification level. Requires extensive verification and proven expertise.
            </p>
            <h4 className="font-medium text-gray-900 mb-2">Requirements:</h4>
            <ul className="list-disc pl-5 text-sm text-gray-600 mb-4">
              <li>All Verified level requirements</li>
              <li>Professional certification verification</li>
              <li>Background check</li>
              <li>Minimum of 5 completed projects</li>
              <li>Minimum 4.5 star rating</li>
            </ul>
            <h4 className="font-medium text-gray-900 mb-2">Benefits:</h4>
            <ul className="list-disc pl-5 text-sm text-gray-600">
              <li>Premium badge on profile</li>
              <li>Top placement in search results</li>
              <li>Access to premium clients and projects</li>
              <li>Reduced platform fees</li>
              <li>Priority support</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-8 bg-white shadow-md rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b">
          <h3 className="text-lg font-medium leading-6 text-gray-900">
            Verification Process
          </h3>
        </div>
        <div className="p-6">
          <ol className="list-decimal pl-5 space-y-4">
            <li className="text-gray-700">
              <span className="font-medium">Document Submission:</span> Freelancers upload required documents through their profile settings.
            </li>
            <li className="text-gray-700">
              <span className="font-medium">Admin Review:</span> Administrators review submitted documents for authenticity and compliance.
            </li>
            <li className="text-gray-700">
              <span className="font-medium">Approval/Rejection:</span> Documents are either approved or rejected with feedback.
            </li>
            <li className="text-gray-700">
              <span className="font-medium">Level Assignment:</span> Once all requirements are met, the appropriate verification level is assigned.
            </li>
            <li className="text-gray-700">
              <span className="font-medium">Periodic Review:</span> Premium status is reviewed every 6 months to ensure continued compliance.
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default VerificationLevels;
