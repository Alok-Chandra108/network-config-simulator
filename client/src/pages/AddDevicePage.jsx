// client/src/pages/AddDevicePage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import deviceService from '../services/deviceService';
import InputField from '../components/common/InputField';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useAuth } from '../contexts/AuthContext'; // Import useAuth hook
import { toast } from 'react-toastify'; // Import toast for notifications

function AddDevicePage() {
  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const [ipAddress, setIpAddress] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const { isAuthenticated, isAdmin, isViewer, token } = useAuth();

  const deviceTypes = [
    'Router', 'Switch', 'Firewall', 'Load Balancer', 'Server', 'Other'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const newDevice = { name, type, ipAddress, location, description };
      await deviceService.createDevice(newDevice, token);
      toast.success('Device added successfully!');
      navigate('/'); 
    } catch (err) {
      console.error('Error adding device:', err.response?.data?.message || err.message);
      toast.error(err.response?.data?.message || 'Failed to add device. Please check your input.');
    } finally {
      setLoading(false);
    }
  };

  const canAddDevices = isAuthenticated && (isAdmin || !isViewer);

  if (!canAddDevices) {
    return (
      <div className="max-w-md mx-auto bg-white p-6 sm:p-8 md:p-10 rounded-2xl shadow-xl border border-gray-100 mt-8 mb-12 text-center">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-red-600 mb-4">Access Denied</h1>
        <p className="text-gray-700 text-base sm:text-lg">You do not have permission to add new devices.</p>
        <p className="text-gray-500 text-sm sm:text-md mt-2">Please contact an administrator if you believe this is an error.</p>
        <Button
          onClick={() => navigate('/')}
          variant="secondary"
          className="mt-6 px-4 py-2 text-sm sm:text-base"
        >
          Go to Home
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-xl md:max-w-3xl lg:max-w-4xl mx-auto bg-white p-6 sm:p-8 md:p-10 rounded-2xl shadow-xl border border-gray-100 mt-8 mb-12">
      <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-800 mb-6 sm:mb-8 text-center">Add New Network Device</h1>
      <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5 sm:gap-y-6">
          <InputField
            label="Device Name"
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Core Router 1"
            required={true}
          />

          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
              Device Type <span className="text-red-500">*</span>
            </label>
            <select
              id="type"
              name="type"
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2.5 text-sm sm:text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md shadow-sm"
              required
            >
              <option value="">Select a type</option>
              {deviceTypes.map((deviceType) => (
                <option key={deviceType} value={deviceType}>
                  {deviceType}
                </option>
              ))}
            </select>
          </div>

          <InputField
            label="IP Address (Optional)"
            type="text"
            id="ipAddress"
            value={ipAddress}
            onChange={(e) => setIpAddress(e.target.value)}
            placeholder="e.g., 192.168.1.1"
          />

          <InputField
            label="Location (Optional)"
            type="text"
            id="location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g., Main Data Center"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description (Optional)
          </label>
          <textarea
            id="description"
            name="description"
            rows="4"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1 block w-full shadow-sm text-sm sm:text-base border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 p-3"
            placeholder="e.g., Cisco Catalyst 9300 series switch with 48 ports."
          ></textarea>
        </div>

        <div className="flex justify-end space-x-3 sm:space-x-4 pt-4">
          <Button
            type="button"
            onClick={() => navigate('/')}
            variant="secondary"
            className="px-3 py-1.5 text-sm sm:px-4 sm:py-2 sm:text-base"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={loading}
            className="px-3 py-1.5 text-sm sm:px-4 sm:py-2 sm:text-base"
          >
            {loading ? 'Adding Device...' : 'Add Device'}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default AddDevicePage;