// client/src/pages/DeviceDetailPage.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import deviceService from '../services/deviceService';
import configurationService from '../services/configurationService';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import { format } from 'date-fns';

function DeviceDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [device, setDevice] = useState(null);
  const [configurations, setConfigurations] = useState([]);
  const [newConfigContent, setNewConfigContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false); // State for status check loading

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedConfigContent, setSelectedConfigContent] = useState('');
  const [selectedConfigVersion, setSelectedConfigVersion] = useState('');

  // Function to fetch device and configurations
  const fetchDeviceAndConfigs = async () => {
    try {
      const fetchedDevice = await deviceService.getDeviceById(id);
      if (!fetchedDevice) {
        setError('Device not found. Please check the ID.');
        setLoading(false);
        return;
      }
      setDevice(fetchedDevice);

      const fetchedConfigs = await configurationService.getConfigurationsForDevice(id);
      setConfigurations(fetchedConfigs);

      setLoading(false);
    } catch (err) {
      console.error('Error fetching device details or configurations:', err);
      if (err.response && err.response.status === 404) {
        setError('Device not found. The provided ID might be incorrect or the device does not exist.');
      } else if (err.message && err.message.includes('Cast to ObjectId failed')) {
        setError('Invalid device ID format. Please use a valid 24-character ID.');
      } else {
        setError(err.response?.data?.message || 'Failed to load device details.');
      }
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeviceAndConfigs();
  }, [id]);

  const handlePushNewConfig = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    if (!newConfigContent.trim()) {
      setError('Configuration content cannot be empty.');
      setIsSubmitting(false);
      return;
    }

    try {
      await configurationService.createConfiguration(id, { content: newConfigContent });
      alert('New configuration pushed successfully!');
      setNewConfigContent('');
      await fetchDeviceAndConfigs(); // Refresh all data
    } catch (err) {
      console.error('Error pushing new configuration:', err);
      setError(err.response?.data?.message || 'Failed to push configuration.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSetCurrentConfig = async (configId) => {
    if (window.confirm('Are you sure you want to revert to this configuration?')) {
      try {
        setIsSubmitting(true);
        await configurationService.setCurrentConfiguration(id, configId);
        alert('Configuration successfully set as current!');
        await fetchDeviceAndConfigs(); // Refresh all data
      } catch (err) {
        console.error('Error setting current configuration:', err);
        setError(err.response?.data?.message || 'Failed to set current configuration.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  // Function to trigger device status check
  const handleCheckStatus = async () => {
    setIsCheckingStatus(true);
    setError(null);
    try {
      const updatedStatus = await deviceService.checkDeviceStatus(id);
      // Update the device state with the latest status information
      setDevice(prevDevice => ({
        ...prevDevice,
        isOnline: updatedStatus.isOnline,
        lastPingTime: updatedStatus.lastPingTime,
        lastPingLatency: updatedStatus.lastPingLatency,
      }));
      alert(`Device is ${updatedStatus.isOnline ? 'Online' : 'Offline'}.`);
    } catch (err) {
      console.error('Error checking device status:', err);
      setError(err.response?.data?.message || 'Failed to check device status.');
    } finally {
      setIsCheckingStatus(false);
    }
  };

  // Modal functions
  const openConfigModal = (content, version) => {
    setSelectedConfigContent(content);
    setSelectedConfigVersion(version);
    setIsModalOpen(true);
  };

  const closeConfigModal = () => {
    setIsModalOpen(false);
    setSelectedConfigContent('');
    setSelectedConfigVersion('');
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error && !device) {
    return (
      <div className="max-w-md mx-auto bg-white p-8 rounded-2xl shadow-xl border border-gray-100 mt-12 text-center">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Device</h2>
        <p className="text-gray-700 mb-6">{error}</p>
        <Button onClick={() => navigate('/')} variant="primary">
          Go Back to Devices
        </Button>
      </div>
    );
  }

  if (!loading && !device) {
    return (
      <div className="max-w-md mx-auto bg-white p-8 rounded-2xl shadow-xl border border-gray-100 mt-12 text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Device Not Found</h2>
        <p className="text-gray-700 mb-6">The device with ID "{id}" could not be found.</p>
        <Button onClick={() => navigate('/')} variant="primary">
          Go Back to Devices
        </Button>
      </div>
    );
  }

  // Determine status indicator color and text for Device Detail Page
  const statusColor = device.isOnline ? 'bg-green-500' : 'bg-red-500';
  const statusText = device.isOnline ? 'Online' : 'Offline';

  return (
    <div className="max-w-6xl mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-extrabold text-gray-800">{device.name} Details</h1>
        <Button onClick={() => navigate('/')} variant="secondary">
          Back to Devices
        </Button>
      </div>

      {/* Device Information Section */}
      <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Device Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-gray-700">
          <p><strong className="font-semibold text-gray-900">Type:</strong> {device.type}</p>
          {device.ipAddress && <p><strong className="font-semibold text-gray-900">IP Address:</strong> {device.ipAddress}</p>}
          <p><strong className="font-semibold text-gray-900">Location:</strong> {device.location}</p>
          <p className="md:col-span-2 lg:col-span-3"><strong className="font-semibold text-gray-900">Description:</strong> {device.description || 'N/A'}</p>
          <p><strong className="font-semibold text-gray-900">Added:</strong> {format(new Date(device.createdAt), 'MMM dd, yyyy HH:mm')}</p>
          <p><strong className="font-semibold text-gray-900">Last Updated:</strong> {format(new Date(device.updatedAt), 'MMM dd, yyyy HH:mm')}</p>
        </div>

        {/* Connectivity Status Display and Check Button */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <h3 className="text-xl font-bold text-gray-800 mb-3">Connectivity Status</h3>
          <div className="flex items-center text-lg mb-2">
            <span className={`w-4 h-4 rounded-full ${statusColor} mr-3`}></span>
            <span className="font-semibold text-gray-700">Status: {statusText}</span> 
            {device.ipAddress ? (
                <>
                    {device.isOnline && device.lastPingLatency !== null && (
                        <span className="ml-3 text-gray-600">({device.lastPingLatency}ms latency)</span>
                    )}
                    {device.lastPingTime && (
                        <span className="ml-3 text-gray-600">(Last checked: {format(new Date(device.lastPingTime), 'MMM dd, yyyy HH:mm:ss')})</span>
                    )}
                </>
            ) : (
                <span className="ml-3 text-gray-500">(No IP Address configured for check)</span>
            )}
          </div>
          {device.ipAddress && ( // Only show check button if IP is present
            <Button
              onClick={handleCheckStatus}
              variant="primary"
              className="mt-4"
              disabled={isCheckingStatus}
            >
              {isCheckingStatus ? <LoadingSpinner /> : 'Check Status Now'}
            </Button>
          )}
        </div>
      </div>

      {/* Current Configuration Section */}
      <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Current Configuration</h2>
        {device.currentConfiguration ? (
          <div className="bg-gray-800 text-green-400 p-6 rounded-lg font-mono text-sm leading-relaxed overflow-x-auto custom-scrollbar">
            <pre>{device.currentConfiguration.content}</pre>
            <p className="text-gray-400 text-xs mt-2">
              Version: {device.currentConfiguration.version} | Pushed By: {device.currentConfiguration.pushedBy || 'N/A'} | At: {format(new Date(device.currentConfiguration.createdAt), 'MMM dd, yyyy HH:mm')}
            </p>
          </div>
        ) : (
          <p className="text-gray-600">No current configuration found for this device. Push a new one below!</p>
        )}
      </div>

      {/* Push New Configuration Section */}
      <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Push New Configuration</h2>
        <form onSubmit={handlePushNewConfig} className="space-y-4">
          <div>
            <label htmlFor="newConfigContent" className="block text-sm font-medium text-gray-700 mb-2">
              Configuration Content <span className="text-red-500">*</span>
            </label>
            <textarea
              id="newConfigContent"
              name="newConfigContent"
              rows="10"
              value={newConfigContent}
              onChange={(e) => setNewConfigContent(e.target.value)}
              className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 p-3 font-mono"
              placeholder="e.g., hostname NewDeviceName&#10;interface GigabitEthernet0/0&#10; ip address 10.0.0.1 255.255.255.0"
            ></textarea>
          </div>
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {isSubmitting ? <LoadingSpinner /> : 'Push Configuration'}
          </Button>
        </form>
      </div>

      {/* Configuration History Section */}
      <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Configuration History</h2>
        {configurations.length > 0 ? (
          <div className="space-y-4">
            {configurations
              .sort((a, b) => b.version - a.version) // Ensure newest version first
              .map(config => (
              <div key={config._id} className={`p-4 rounded-lg border ${config.isCurrent ? 'border-green-500 bg-green-50' : 'border-gray-200 bg-gray-50'}`}>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2 space-y-2 sm:space-y-0">
                  <span className="font-semibold text-lg text-gray-800">Version: {config.version} {config.isCurrent && <span className="ml-2 px-2 py-0.5 bg-green-200 text-green-800 text-xs font-bold rounded-full">Current</span>}</span>
                  <div className="text-sm text-gray-600 flex flex-col sm:flex-row sm:space-x-4">
                    <span>Pushed By: {config.pushedBy || 'N/A'}</span>
                    <span>At: {format(new Date(config.createdAt), 'MMM dd, yyyy HH:mm')}</span>
                  </div>
                </div>
                <pre className="bg-gray-800 text-green-400 p-3 rounded-md font-mono text-xs overflow-x-auto custom-scrollbar max-h-40">{config.content.substring(0, 150)}{config.content.length > 150 ? '...' : ''}</pre>
                <div className="mt-3 flex justify-end space-x-2">
                  {!config.isCurrent && (
                    <Button
                      onClick={() => handleSetCurrentConfig(config._id)}
                      variant="secondary"
                      disabled={isSubmitting}
                    >
                      Set as Current
                    </Button>
                  )}
                  <Button
                    onClick={() => openConfigModal(config.content, config.version)}
                    variant="primary"
                  >
                    View Full Config
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600">No configuration history found for this device.</p>
        )}
      </div>

      {/* The Modal Component */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeConfigModal}
        title={`Full Configuration (Version ${selectedConfigVersion})`}
      >
        <div className="bg-gray-800 text-green-400 p-6 rounded-lg font-mono text-sm leading-relaxed overflow-x-auto custom-scrollbar max-h-[60vh]">
          <pre>{selectedConfigContent}</pre>
        </div>
      </Modal>
    </div>
  );
}

export default DeviceDetailPage;