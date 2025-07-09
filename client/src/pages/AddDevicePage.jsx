// client/src/pages/AddDevicePage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import deviceService from '../services/deviceService';
import InputField from '../components/common/InputField';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';

function AddDevicePage() {
  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const [ipAddress, setIpAddress] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const deviceTypes = [
    'Router', 'Switch', 'Firewall', 'Load Balancer', 'Server', 'Other'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const newDevice = { name, type, ipAddress, location, description };
      await deviceService.createDevice(newDevice);
      alert('Device added successfully!');
      navigate('/'); // Navigate back to the homepage after successful creation
    } catch (err) {
      console.error('Error adding device:', err);
      setError(err.response?.data?.message || 'Failed to add device. Please check your input.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white p-8 md:p-10 rounded-2xl shadow-xl border border-gray-100 mt-8 mb-12">
      <h1 className="text-4xl font-extrabold text-gray-800 mb-8 text-center">Add New Network Device</h1>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-6" role="alert">
          <strong className="font-bold">Error:</strong>
          <span className="block sm:inline ml-2">{error}</span>
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              className="mt-1 block w-full pl-3 pr-10 py-2.5 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md shadow-sm"
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
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            rows="4" // Increased rows for more space
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 p-3" // Increased padding
            placeholder="e.g., Cisco Catalyst 9300 series switch with 48 ports."
          ></textarea>
        </div>

        <div className="flex justify-end space-x-4 pt-4"> {/* Added top padding */}
          <Button
            type="button"
            onClick={() => navigate('/')}
            variant="secondary"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={loading}
          >
            {loading ? <LoadingSpinner /> : 'Add Device'}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default AddDevicePage;