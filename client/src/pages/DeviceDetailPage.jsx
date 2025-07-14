// client/src/pages/DeviceDetailPage.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import deviceService from '../services/deviceService';
import configurationService from '../services/configurationService';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import { format } from 'date-fns';
import io from 'socket.io-client';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';

function DeviceDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [device, setDevice] = useState(null);
  const [configurations, setConfigurations] = useState([]);
  const [newConfigContent, setNewConfigContent] = useState('');
  const [loading, setLoading] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedConfigContent, setSelectedConfigContent] = useState('');
  const [selectedConfigVersion, setSelectedConfigVersion] = useState('');

  const { isAuthenticated, isAdmin, isViewer, token } = useAuth();

  const fetchDeviceAndConfigs = async () => {
    if (!isAuthenticated) {
      setLoading(false);
      toast.error('Not authorized. Please log in to view device details.');
      return;
    }

    try {
      if (!device) setLoading(true);

      const fetchedDevice = await deviceService.getDeviceById(id, token);
      if (!fetchedDevice) {
        toast.error('Device not found. Please check the ID.');
        setLoading(false);
        return;
      }
      setDevice(fetchedDevice);

      const fetchedConfigs = await configurationService.getConfigurationsForDevice(id, token);
      setConfigurations(fetchedConfigs);

      setLoading(false);
    } catch (err) {
      console.error('Error fetching device details or configurations:', err.response?.data?.message || err.message);
      let errorMessage = 'Failed to load device details.';
      if (err.response) {
        if (err.response.status === 404) {
          errorMessage = 'Device not found. The provided ID might be incorrect.';
        } else if (err.response.status === 403) {
          errorMessage = 'You do not have permission to view this device.';
        } else if (err.response.status === 401) {
          errorMessage = 'Not authorized. Your session might have expired. Please log in again.';
        } else {
          errorMessage = err.response.data?.message || errorMessage;
        }
      } else if (err.message && err.message.includes('Cast to ObjectId failed')) {
        errorMessage = 'Invalid device ID format. Please use a valid 24-character ID.';
      } else {
        errorMessage = 'Failed to load device details. Please check your network connection or server status.';
      }
      toast.error(errorMessage);
      setLoading(false);
      setDevice(null);
      setConfigurations([]);
    }
  };

  useEffect(() => {
    fetchDeviceAndConfigs();

    const socket = io('http://localhost:5000');

    socket.on('deviceStatusUpdate', (updatedDevice) => {
      if (updatedDevice._id === id) {
        setDevice(prevDevice => {
          if (!prevDevice) {
            fetchDeviceAndConfigs();
            return null;
          }
          return {
            ...prevDevice,
            isOnline: updatedDevice.isOnline,
            lastPingTime: updatedDevice.lastPingTime,
            lastPingLatency: updatedDevice.lastPingLatency
          };
        });
        toast.info(`Device "${updatedDevice.name}" status updated: ${updatedDevice.isOnline ? 'Online' : 'Offline'}.`);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [id, isAuthenticated, token]);

  const handlePushNewConfig = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const canPerformConfigActions = isAuthenticated && (isAdmin || !isViewer);
    if (!canPerformConfigActions) {
      toast.error("You do not have permission to push new configurations.");
      setIsSubmitting(false);
      return;
    }

    if (!newConfigContent.trim()) {
      toast.error('Configuration content cannot be empty.');
      setIsSubmitting(false);
      return;
    }

    try {
      await configurationService.createConfiguration(id, { content: newConfigContent }, token);
      toast.success('New configuration pushed successfully!');
      setNewConfigContent('');
      await fetchDeviceAndConfigs();
    } catch (err) {
      console.error('Error pushing new configuration:', err.response?.data?.message || err.message);
      toast.error(err.response?.data?.message || 'Failed to push configuration.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSetCurrentConfig = async (configId) => {
    const canPerformConfigActions = isAuthenticated && (isAdmin || !isViewer);
    if (!canPerformConfigActions) {
      toast.error("You do not have permission to set current configurations.");
      return;
    }

    if (window.confirm('Are you sure you want to revert to this configuration? This will become the device\'s current configuration.')) {
      try {
        setIsSubmitting(true);
        await configurationService.setCurrentConfiguration(id, configId, token);
        toast.success('Configuration successfully set as current!');
        await fetchDeviceAndConfigs();
      } catch (err) {
        console.error('Error setting current configuration:', err.response?.data?.message || err.message);
        toast.error(err.response?.data?.message || 'Failed to set current configuration.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleCheckStatus = async () => {
    if (!isAuthenticated) {
      toast.error("You are not authorized to check device status. Please log in.");
      return;
    }
    if (!device?.ipAddress) {
      toast.info("No IP Address configured for this device to perform a status check.");
      return;
    }

    setIsCheckingStatus(true);
    try {
      const updatedStatus = await deviceService.checkDeviceStatus(id, token);
      setDevice(prevDevice => ({
        ...prevDevice,
        isOnline: updatedStatus.isOnline,
        lastPingTime: updatedStatus.lastPingTime,
        lastPingLatency: updatedStatus.lastPingLatency,
      }));
      toast.success(`Device is now ${updatedStatus.isOnline ? 'Online' : 'Offline'}.`);
    } catch (err) {
      console.error('Error checking device status:', err.response?.data?.message || err.message);
      toast.error(err.response?.data?.message || 'Failed to check device status.');
    } finally {
      setIsCheckingStatus(false);
    }
  };

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

  const canModifyConfigs = isAuthenticated && (isAdmin || !isViewer);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!device) {
    return (
      <div className="max-w-md mx-auto bg-white p-6 sm:p-8 rounded-2xl shadow-xl border border-gray-100 mt-12 text-center">
        <h2 className="text-2xl sm:text-3xl font-bold text-red-600 mb-4">Device Not Found</h2>
        <p className="text-gray-700 mb-6">The device with ID "{id}" could not be found or you do not have permission to view it.</p>
        <Button onClick={() => navigate('/')} variant="primary" className="px-4 py-2 text-sm sm:text-base">
          Go Back to Devices
        </Button>
      </div>
    );
  }

  const statusColor = device.isOnline ? 'bg-green-500' : 'bg-red-500';
  const statusText = device.isOnline ? 'Online' : 'Offline';

  return (
    <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8 max-w-7xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-800 mb-4 sm:mb-0">{device.name} Details</h1>
        <Button onClick={() => navigate('/')} variant="secondary" className="px-4 py-2 text-sm sm:text-base">
          Back to Devices
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="space-y-8">
          <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl border border-gray-100">
            <h2 className="text-2xl sm:text-2xl font-bold text-gray-800 mb-4">Device Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-x-4 gap-y-3 text-gray-700 text-sm sm:text-base">
              <p><strong className="font-semibold text-gray-900">Type:</strong> {device.type}</p>
              {device.ipAddress && <p><strong className="font-semibold text-gray-900">IP Address:</strong> {device.ipAddress}</p>}
              <p><strong className="font-semibold text-gray-900">Location:</strong> {device.location}</p>
              <p className="md:col-span-2 lg:col-span-1 xl:col-span-2"><strong className="font-semibold text-gray-900">Description:</strong> {device.description || 'N/A'}</p>
              <p><strong className="font-semibold text-gray-900">Added:</strong> {format(new Date(device.createdAt), 'MMM dd, yyyy HH:mm')}</p>
              <p><strong className="font-semibold text-gray-900">Last Updated:</strong> {format(new Date(device.updatedAt), 'MMM dd, yyyy HH:mm')}</p>
              {device.owner && (
                <p className="md:col-span-2 lg:col-span-1 xl:col-span-2"><strong className="font-semibold text-gray-900">Owner:</strong> {device.owner.username} ({device.owner.email})</p>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-gray-200">
              <h3 className="text-xl font-bold text-gray-800 mb-3">Connectivity Status</h3>
              <div className="flex items-center text-base sm:text-lg mb-2">
                <span className={`w-4 h-4 rounded-full ${statusColor} mr-3 flex-shrink-0`}></span>
                <span className="font-semibold text-gray-700">Status: {statusText}</span>
                {device.ipAddress ? (
                  <div className="ml-3 text-gray-600 text-sm sm:text-base flex flex-wrap items-center">
                    {device.isOnline && device.lastPingLatency !== null && (
                      <span className="mr-2">({device.lastPingLatency}ms latency)</span>
                    )}
                    {device.lastPingTime && (
                      <span>(Last checked: {format(new Date(device.lastPingTime), 'MMM dd, yyyy HH:mm:ss')})</span>
                    )}
                  </div>
                ) : (
                  <span className="ml-3 text-gray-500 text-sm">(No IP Address for check)</span>
                )}
              </div>
              {isAuthenticated && device.ipAddress && (
                <Button
                  onClick={handleCheckStatus}
                  variant="primary"
                  className="mt-4 px-4 py-2 text-sm sm:text-base"
                  disabled={isCheckingStatus}
                >
                  {isCheckingStatus ? 'Checking Status...' : 'Check Status Now'}
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {canModifyConfigs && (
            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Push New Configuration</h2>
              <form onSubmit={handlePushNewConfig} className="space-y-4">
                <div>
                  <label htmlFor="newConfigContent" className="block text-sm font-medium text-gray-700 mb-2">
                    Configuration Content <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="newConfigContent"
                    name="newConfigContent"
                    rows="3"
                    value={newConfigContent}
                    onChange={(e) => setNewConfigContent(e.target.value)}
                    className="mt-1 block w-full shadow-sm text-sm sm:text-base border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 p-3 font-mono max-h-48 overflow-y-auto custom-scrollbar"
                    placeholder="e.g., hostname NewDeviceName&#10;interface GigabitEthernet0/0&#10; ip address 10.0.0.1 255.255.255.0"
                  ></textarea>
                </div>
                <Button type="submit" variant="primary" disabled={isSubmitting} className="px-4 py-2 text-sm sm:text-base">
                  {isSubmitting ? 'Pushing Configuration...' : 'Push Configuration'}
                </Button>
              </form>
            </div>
          )}

          <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Current Configuration</h2>
            {device.currentConfiguration ? (
              <div className="bg-gray-800 text-green-400 p-4 sm:p-6 rounded-lg font-mono text-xs sm:text-sm leading-relaxed overflow-x-auto custom-scrollbar max-h-48">
                <pre>{device.currentConfiguration.content}</pre>
                <p className="text-gray-400 text-xs mt-2">
                  Version: {device.currentConfiguration.version} | Pushed By: {device.currentConfiguration.pushedBy?.username || 'N/A'} | At: {format(new Date(device.currentConfiguration.createdAt), 'MMM dd, yyyy HH:mm')}
                </p>
              </div>
            ) : (
              <p className="text-gray-600 text-sm sm:text-base">No current configuration found for this device. Push a new one above!</p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl border border-gray-100 mt-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Configuration History</h2>
        {configurations.length > 0 ? (
          <div className="space-y-4">
            {configurations
              .sort((a, b) => b.version - a.version)
              .map(config => (
                <div key={config._id} className={`p-4 rounded-lg border ${config.isCurrent ? 'border-green-500 bg-green-50' : 'border-gray-200 bg-gray-50'}`}>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2 space-y-2 sm:space-y-0">
                    <span className="font-semibold text-base sm:text-lg text-gray-800">Version: {config.version} {config.isCurrent && <span className="ml-2 px-2 py-0.5 bg-green-200 text-green-800 text-xs font-bold rounded-full">Current</span>}</span>
                    <div className="text-xs sm:text-sm text-gray-600 flex flex-col sm:flex-row sm:space-x-4">
                      <span>Pushed By: {config.pushedBy?.username || 'N/A'}</span>
                      <span>At: {format(new Date(config.createdAt), 'MMM dd, yyyy HH:mm')}</span>
                    </div>
                  </div>
                  <pre className="bg-gray-800 text-green-400 p-3 rounded-md font-mono text-xs sm:text-sm overflow-x-auto custom-scrollbar max-h-40">{config.content.substring(0, 150)}{config.content.length > 150 ? '...' : ''}</pre>
                  <div className="mt-3 flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2">
                    {canModifyConfigs && !config.isCurrent && (
                      <Button
                        onClick={() => handleSetCurrentConfig(config._id)}
                        variant="secondary"
                        disabled={isSubmitting}
                        className="px-3 py-1.5 text-xs sm:px-4 sm:py-2 sm:text-sm"
                      >
                        {isSubmitting ? 'Setting...' : 'Set as Current'}
                      </Button>
                    )}
                    <Button
                      onClick={() => openConfigModal(config.content, config.version)}
                      variant="primary"
                      className="px-3 py-1.5 text-xs sm:px-4 sm:py-2 sm:text-sm"
                    >
                      View Full Config
                    </Button>
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <p className="text-gray-600 text-sm sm:text-base">No configuration history found for this device.</p>
        )}
      </div>

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