// client/src/pages/AdminDashboardPage.jsx
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import UserList from '../components/admin/UserList';
import DeviceList from '../components/admin/DeviceList'; // <--- NEW IMPORT: DeviceList

function AdminDashboardPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('users'); 

  if (!user || !user.roles.includes('admin')) {
    return <div className="text-center text-red-500 mt-8">Access Denied: You must be an administrator to view this page.</div>;
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Admin Dashboard</h1>

      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('users')}
            className={`
              ${activeTab === 'users'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }
              whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ease-in-out
            `}
            aria-current={activeTab === 'users' ? 'page' : undefined}
          >
            User Management
          </button>
          <button
            onClick={() => setActiveTab('devices')}
            className={`
              ${activeTab === 'devices'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }
              whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ease-in-out
            `}
            aria-current={activeTab === 'devices' ? 'page' : undefined}
          >
            Device Management
          </button>
          {/* Add more tabs for other sections like System Settings later */}
          <button
            onClick={() => setActiveTab('settings')} 
            className={`
              ${activeTab === 'settings'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }
              whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ease-in-out
            `}
            aria-current={activeTab === 'settings' ? 'page' : undefined}
          >
            System Settings
          </button>
        </nav>
      </div>

      {activeTab === 'users' && (
        <UserList />
      )}

      {activeTab === 'devices' && (
        <DeviceList />
      )}

      {activeTab === 'settings' && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold text-gray-700">System Settings Placeholder</h3>
          <p className="text-gray-600 mt-2">Content for system-wide configurations and settings will go here.</p>
          {/* Future System Settings components will be rendered here */}
        </div>
      )}
    </div>
  );
}

export default AdminDashboardPage;