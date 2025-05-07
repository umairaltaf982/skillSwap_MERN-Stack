import React from 'react';
import { FaSpinner } from 'react-icons/fa';

const RevenueAnalytics = () => {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Revenue Analytics</h1>
        <p className="text-gray-600">Financial metrics, revenue streams, and projections</p>
      </div>
      
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <FaSpinner className="animate-spin h-8 w-8 text-primary-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading revenue analytics data...</p>
        </div>
      </div>
    </div>
  );
};

export default RevenueAnalytics;
