import React, { useState } from 'react';
import { FaSpinner, FaSave, FaBell, FaEnvelope, FaSms, FaToggleOn, FaToggleOff, FaClock, FaExclamationTriangle } from 'react-icons/fa';

interface NotificationSetting {
  id: string;
  name: string;
  description: string;
  emailEnabled: boolean;
  smsEnabled: boolean;
  inAppEnabled: boolean;
  frequency: 'immediate' | 'hourly' | 'daily' | 'weekly';
  priority: 'low' | 'medium' | 'high';
}

const NotificationSettings = () => {
  const [loading, setLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [settings, setSettings] = useState<NotificationSetting[]>([
    {
      id: '1',
      name: 'Verification Updates',
      description: 'Notifications about freelancer verification status changes',
      emailEnabled: true,
      smsEnabled: false,
      inAppEnabled: true,
      frequency: 'immediate',
      priority: 'high'
    },
    {
      id: '2',
      name: 'New Freelancer Registrations',
      description: 'Alerts when new freelancers register on the platform',
      emailEnabled: true,
      smsEnabled: false,
      inAppEnabled: true,
      frequency: 'daily',
      priority: 'medium'
    },
    {
      id: '3',
      name: 'Platform Analytics Reports',
      description: 'Regular reports on platform usage and performance',
      emailEnabled: true,
      smsEnabled: false,
      inAppEnabled: false,
      frequency: 'weekly',
      priority: 'low'
    },
    {
      id: '4',
      name: 'Security Alerts',
      description: 'Critical security notifications and suspicious activity',
      emailEnabled: true,
      smsEnabled: true,
      inAppEnabled: true,
      frequency: 'immediate',
      priority: 'high'
    },
    {
      id: '5',
      name: 'Payment Processing Issues',
      description: 'Alerts about payment failures or disputes',
      emailEnabled: true,
      smsEnabled: true,
      inAppEnabled: true,
      frequency: 'immediate',
      priority: 'high'
    }
  ]);

  const handleToggle = (id: string, field: 'emailEnabled' | 'smsEnabled' | 'inAppEnabled') => {
    setSettings(prevSettings =>
      prevSettings.map(setting =>
        setting.id === id ? { ...setting, [field]: !setting[field] } : setting
      )
    );
  };

  const handleFrequencyChange = (id: string, frequency: 'immediate' | 'hourly' | 'daily' | 'weekly') => {
    setSettings(prevSettings =>
      prevSettings.map(setting =>
        setting.id === id ? { ...setting, frequency } : setting
      )
    );
  };

  const handlePriorityChange = (id: string, priority: 'low' | 'medium' | 'high') => {
    setSettings(prevSettings =>
      prevSettings.map(setting =>
        setting.id === id ? { ...setting, priority } : setting
      )
    );
  };

  const handleSaveSettings = () => {
    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setSaveSuccess(true);

      // Reset success message after 3 seconds
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    }, 1000);
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return (
          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
            <FaExclamationTriangle className="mr-1" /> High
          </span>
        );
      case 'medium':
        return (
          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
            Medium
          </span>
        );
      case 'low':
        return (
          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
            Low
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notification Settings</h1>
          <p className="text-gray-600">Configure global notification preferences and settings</p>
        </div>
        <button
          onClick={handleSaveSettings}
          disabled={loading}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <FaSpinner className="animate-spin mr-2" />
          ) : (
            <FaSave className="mr-2" />
          )}
          Save Settings
        </button>
      </div>

      {saveSuccess && (
        <div className="mb-4 bg-green-50 border-l-4 border-green-500 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <FaToggleOn className="h-5 w-5 text-green-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-700">Settings saved successfully!</p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b">
          <h3 className="text-lg font-medium leading-6 text-gray-900">
            Notification Preferences
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Configure how and when administrators receive system notifications
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Notification Type
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center">
                    <FaEnvelope className="mr-1" /> Email
                  </div>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center">
                    <FaSms className="mr-1" /> SMS
                  </div>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center">
                    <FaBell className="mr-1" /> In-App
                  </div>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center">
                    <FaClock className="mr-1" /> Frequency
                  </div>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Priority
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {settings.map((setting) => (
                <tr key={setting.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{setting.name}</div>
                    <div className="text-sm text-gray-500">{setting.description}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleToggle(setting.id, 'emailEnabled')}
                      className="text-2xl focus:outline-none"
                    >
                      {setting.emailEnabled ? (
                        <FaToggleOn className="text-primary-600" />
                      ) : (
                        <FaToggleOff className="text-gray-400" />
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleToggle(setting.id, 'smsEnabled')}
                      className="text-2xl focus:outline-none"
                    >
                      {setting.smsEnabled ? (
                        <FaToggleOn className="text-primary-600" />
                      ) : (
                        <FaToggleOff className="text-gray-400" />
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleToggle(setting.id, 'inAppEnabled')}
                      className="text-2xl focus:outline-none"
                    >
                      {setting.inAppEnabled ? (
                        <FaToggleOn className="text-primary-600" />
                      ) : (
                        <FaToggleOff className="text-gray-400" />
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={setting.frequency}
                      onChange={(e) => handleFrequencyChange(setting.id, e.target.value as any)}
                      className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                    >
                      <option value="immediate">Immediate</option>
                      <option value="hourly">Hourly</option>
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={setting.priority}
                      onChange={(e) => handlePriorityChange(setting.id, e.target.value as any)}
                      className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                    >
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-6 bg-white shadow-md rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b">
          <h3 className="text-lg font-medium leading-6 text-gray-900">
            Email Configuration
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Configure email delivery settings
          </p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="sender-name" className="block text-sm font-medium text-gray-700">
                Sender Name
              </label>
              <input
                type="text"
                id="sender-name"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                defaultValue="SkillSwap Admin"
              />
            </div>
            <div>
              <label htmlFor="sender-email" className="block text-sm font-medium text-gray-700">
                Sender Email
              </label>
              <input
                type="email"
                id="sender-email"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                defaultValue="admin@skillswap.com"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 bg-white shadow-md rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b">
          <h3 className="text-lg font-medium leading-6 text-gray-900">
            SMS Configuration
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Configure SMS delivery settings (Twilio)
          </p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="twilio-sid" className="block text-sm font-medium text-gray-700">
                Twilio Account SID
              </label>
              <input
                type="text"
                id="twilio-sid"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                defaultValue="AC1234567890abcdef1234567890abcdef"
              />
            </div>
            <div>
              <label htmlFor="twilio-token" className="block text-sm font-medium text-gray-700">
                Twilio Auth Token
              </label>
              <input
                type="password"
                id="twilio-token"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                defaultValue="••••••••••••••••••••••••••••••"
              />
            </div>
            <div>
              <label htmlFor="twilio-phone" className="block text-sm font-medium text-gray-700">
                Twilio Phone Number
              </label>
              <input
                type="text"
                id="twilio-phone"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                defaultValue="+15551234567"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettings;
