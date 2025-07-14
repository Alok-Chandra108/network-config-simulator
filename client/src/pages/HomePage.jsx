// client/src/pages/HomePage.jsx
import React, { useEffect, useState } from 'react';
import deviceService from '../services/deviceService';
import DeviceCard from '../components/devices/DeviceCard';
import { Link } from 'react-router-dom';
import LoadingSpinner from '../components/common/LoadingSpinner';
import io from 'socket.io-client';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import Modal from '../components/common/Modal';

function HomePage() {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [deviceIdToDelete, setDeviceIdToDelete] = useState(null);
  const [deviceNameToDelete, setDeviceNameToDelete] = useState('');

  const { isAuthenticated, isAdmin, isUser, token } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    const fetchDevices = async () => {
      try {
        setLoading(true);
        const data = await deviceService.getDevices(token);
        setDevices(data);
      } catch (err) {
        console.error('Error fetching devices:', err.response?.data?.message || err.message);
        let errorMessage = 'Failed to load devices. Please try again later.';
        if (err.response) {
          if (err.response.status === 401) {
            errorMessage = 'Not authorized. Your session might have expired. Please log in again.';
          } else if (err.response.status === 403) {
            errorMessage = 'You do not have permission to view devices.';
          } else {
            errorMessage = err.response.data?.message || errorMessage;
          }
        }
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchDevices();

    const socket = io('http://localhost:5000');

    socket.on('deviceStatusUpdate', (updatedDevice) => {
      setDevices(currentDevices =>
        currentDevices.map(device =>
          device._id === updatedDevice._id
            ? {
                ...device,
                isOnline: updatedDevice.isOnline,
                lastPingTime: updatedDevice.lastPingTime,
                lastPingLatency: updatedDevice.lastPingLatency
              }
            : device
        )
      );
    });

    return () => {
      socket.disconnect();
    };
  }, [isAuthenticated, token]);

  const openDeleteConfirmModal = (id, name) => {
    if (!isAdmin) {
      toast.error("You do not have permission to delete devices.");
      return;
    }
    setDeviceIdToDelete(id);
    setDeviceNameToDelete(name);
    setShowDeleteConfirmModal(true);
  };

  const closeDeleteConfirmModal = () => {
    setShowDeleteConfirmModal(false);
    setDeviceIdToDelete(null);
    setDeviceNameToDelete('');
  };

  const confirmDeleteDevice = async () => {
    if (!deviceIdToDelete) return;

    closeDeleteConfirmModal();

    try {
      setLoading(true);
      await deviceService.deleteDevice(deviceIdToDelete, token);
      setDevices(devices.filter(device => device._id !== deviceIdToDelete));
      toast.success(`Device "${deviceNameToDelete}" deleted successfully!`);
    } catch (err) {
      console.error('Error deleting device:', err.response?.data?.message || err.message);
      toast.error(err.response?.data?.message || 'Failed to delete device.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDevice = (id, name) => {
    openDeleteConfirmModal(id, name);
  };


  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8 max-w-7xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-800 mb-4 sm:mb-0">Network Devices</h1>
          {isAuthenticated && (isAdmin || isUser) && (
           <Link
             to="/device/add"
             className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-5 rounded-xl shadow-lg hover:shadow-xl transition duration-300 transform hover:-translate-y-0.5
                         text-sm sm:text-base whitespace-nowrap"
           >
             Add New Device
           </Link>
          )}
      </div>

      {devices.length === 0 ? (
        <p className="text-center text-gray-600 text-base sm:text-lg mt-12 p-6 rounded-lg bg-white shadow-inner mx-auto max-w-lg">
          No devices found. Click "Add New Device" to get started!
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
          {devices.map(device => (
            <DeviceCard
              key={device._id}
              device={device}
              onDelete={() => handleDeleteDevice(device._id, device.name)}
              canDelete={isAdmin}
            />
          ))}
        </div>
      )}

      <Modal
        isOpen={showDeleteConfirmModal}
        onClose={closeDeleteConfirmModal}
        title="Confirm Device Deletion"
      >
        <p className="text-gray-700 mb-6">
          Are you sure you want to delete the device "<strong>{deviceNameToDelete}</strong>" and all its configurations?
          <br />This action cannot be undone.
        </p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={closeDeleteConfirmModal}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={confirmDeleteDevice}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
          >
            Delete Device
          </button>
        </div>
      </Modal>
    </div>
  );
}

export default HomePage;