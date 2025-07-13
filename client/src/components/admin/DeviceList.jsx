// client/src/components/admin/DeviceList.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../common/LoadingSpinner';
import ConfirmationModal from '../common/ConfirmationModal';
import AddDeviceModal from './AddDeviceModal';
import EditDeviceModal from './EditDeviceModal'; 
import { toast } from 'react-toastify';

import deviceService from '../../services/deviceService';
import userService from '../../services/userService';

function DeviceList() {
  const { token, isAdmin } = useAuth(); // Get token and isAdmin from auth context
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [deviceToDelete, setDeviceToDelete] = useState(null);
  const [deviceToDeleteName, setDeviceToDeleteName] = useState('');

  const [showAddDeviceModal, setShowAddDeviceModal] = useState(false);
  const [showEditDeviceModal, setShowEditDeviceModal] = useState(false);
  const [deviceToEdit, setDeviceToEdit] = useState(null); // Holds the device object being edited
  const [allUsers, setAllUsers] = useState([]); 

  // Function to fetch all devices and all users
  const fetchData = async () => {
    setLoading(true);
    try {
      if (!token) {
        toast.error('Authentication token not found. Please log in.');
        setLoading(false);
        return;
      }

      // Fetch both devices and users concurrently
      const [fetchedDevices, fetchedUsers] = await Promise.all([
        deviceService.getDevices(token),
        userService.getAllUsers(token)   
      ]);

      setDevices(fetchedDevices);
      setAllUsers(fetchedUsers); 
      setLoading(false);
    } catch (err) {
      console.error('Error fetching data:', err.response?.data?.message || err.message);
      toast.error(err.response?.data?.message || 'Failed to fetch data.');
      setLoading(false);
    }
  };

  // Initial fetch on component mount
  useEffect(() => {
    if (isAdmin) {
      fetchData();
    } else {
      setLoading(false); 
      toast.error('Access Denied: You are not authorized to view device management.');
    }
  }, [token, isAdmin]); 


  const handleAddDeviceClick = () => {
    setShowAddDeviceModal(true);
  };

  const handleDeviceAdded = async (newDevice) => {
    await fetchData();
    setShowAddDeviceModal(false);
    toast.success('Device added successfully!');
  };

  const handleCloseAddDeviceModal = () => {
    setShowAddDeviceModal(false);
  };

  const handleEditDeviceClick = (device) => {
    setDeviceToEdit(device);       
    setShowEditDeviceModal(true); 
  };

  const handleSaveEditedDevice = async (deviceId, updatedData) => {
    try {
      await deviceService.updateDevice(deviceId, updatedData, token); 
      toast.success('Device updated successfully!');
      await fetchData(); 
      handleCloseEditDeviceModal(); 
    } catch (err) {
      console.error('Error updating device:', err.response?.data?.message || err.message);
      toast.error(err.response?.data?.message || 'Failed to update device.');
      throw err; 
    }
  };

  const handleCloseEditDeviceModal = () => {
    setShowEditDeviceModal(false);
    setDeviceToEdit(null); 
  };

  const handleDeleteDeviceClick = (deviceId, deviceName) => {
    setDeviceToDelete(deviceId);
    setDeviceToDeleteName(deviceName);
    setShowConfirmModal(true);
  };

  const handleConfirmDelete = async () => {
    setShowConfirmModal(false);
    if (!deviceToDelete) return;

    try {
      setLoading(true);
      await deviceService.deleteDevice(deviceToDelete, token); 
      toast.success(`Device "${deviceToDeleteName}" deleted successfully!`);
      setDevices((prevDevices) => prevDevices.filter(device => device._id !== deviceToDelete)); 
    } catch (err) {
      console.error('Error deleting device:', err.response?.data?.message || err.message);
      toast.error(err.response?.data?.message || 'Failed to delete device.');
    } finally {
      setLoading(false);
      setDeviceToDelete(null);
      setDeviceToDeleteName('');
    }
  };

  const handleCancelDelete = () => {
    setShowConfirmModal(false);
    setDeviceToDelete(null);
    setDeviceToDeleteName('');
  };

  
  if (!isAdmin) {
    return <div className="bg-white p-6 rounded-lg shadow-md text-red-500">Access Denied: You must be an administrator to manage devices.</div>;
  }

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800">All System Devices</h2>
        <button
          onClick={handleAddDeviceClick}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition duration-300 ease-in-out"
        >
          Add New Device
        </button>
      </div>

      {devices.length === 0 && !loading && (
        <p className="text-gray-600">No devices found in the system.</p>
      )}

      {devices.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IP Address</th>
                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Owner</th>
                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Ping</th>
                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {devices.map((device) => (
                <tr key={device._id}>
                  <td className="py-4 px-6 whitespace-nowrap text-sm text-gray-900">{device._id}</td>
                  <td className="py-4 px-6 whitespace-nowrap text-sm text-gray-900">{device.name}</td>
                  <td className="py-4 px-6 whitespace-nowrap text-sm text-gray-900">{device.type}</td>
                  <td className="py-4 px-6 whitespace-nowrap text-sm text-gray-900">{device.ipAddress || 'N/A'}</td>
                  <td className="py-4 px-6 whitespace-nowrap text-sm text-gray-900">{device.location || 'N/A'}</td>
                  <td className="py-4 px-6 whitespace-nowrap text-sm text-gray-900">
                    {/* Display owner's username and email if available */}
                    {device.owner ? `${device.owner.username} (${device.owner.email})` : 'N/A'}
                  </td>
                  <td className="py-4 px-6 whitespace-nowrap text-sm text-gray-900">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        device.isOnline ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {device.isOnline ? 'Online' : 'Offline'}
                    </span>
                  </td>
                  <td className="py-4 px-6 whitespace-nowrap text-sm text-gray-900">
                    {device.lastPingTime ? new Date(device.lastPingTime).toLocaleString() : 'Never'}
                    {device.lastPingLatency && ` (${device.lastPingLatency}ms)`}
                  </td>
                  <td className="py-4 px-6 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleEditDeviceClick(device)} 
                      className="text-indigo-600 hover:text-indigo-900 mr-4"
                    >Edit</button>
                    <button
                      onClick={() => handleDeleteDeviceClick(device._id, device.name)}
                      className="text-red-600 hover:text-red-900"
                    >Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmationModal
        show={showConfirmModal}
        message={`Are you sure you want to delete device "${deviceToDeleteName}"? This action cannot be undone and will also delete associated configurations.`}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        confirmText="Delete"
        cancelText="Cancel"
      />

      <AddDeviceModal
        show={showAddDeviceModal}
        onClose={handleCloseAddDeviceModal}
        onDeviceAdded={handleDeviceAdded}
      />



      {showEditDeviceModal && deviceToEdit && (
        <EditDeviceModal
          isOpen={showEditDeviceModal} 
          onClose={handleCloseEditDeviceModal}
          deviceToEdit={deviceToEdit} 
          onSave={handleSaveEditedDevice} 
          users={allUsers} 
        />
      )}
    </div>
  );
}

export default DeviceList;