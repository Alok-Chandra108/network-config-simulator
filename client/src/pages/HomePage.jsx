// client/src/pages/HomePage.jsx
import React, { useEffect, useState } from 'react';
import deviceService from '../services/deviceService';
import DeviceCard from '../components/devices/DeviceCard';
import { Link } from 'react-router-dom';
import LoadingSpinner from '../components/common/LoadingSpinner';

function HomePage() {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const data = await deviceService.getDevices();
        setDevices(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching devices:', err);
        setError('Failed to load devices. Please try again later.');
        setLoading(false);
      }
    };

    fetchDevices();
  }, []);

  const handleDeleteDevice = async (id) => {
    if (window.confirm('Are you sure you want to delete this device and all its configurations?')) {
      try {
        setLoading(true);
        await deviceService.deleteDevice(id);
        setDevices(devices.filter(device => device._id !== id));
        alert('Device deleted successfully!');
      } catch (err) {
        console.error('Error deleting device:', err);
        setError('Failed to delete device.');
      } finally {
        setLoading(false);
      }
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <div className="text-center text-red-500 font-semibold text-lg mt-8">{error}</div>;
  }

  return (
    <div className="py-4"> {/* Adjusted top padding */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 px-2 sm:px-0"> {/* Added responsive padding */}
        <h1 className="text-4xl font-extrabold text-gray-800 mb-4 sm:mb-0">Network Devices</h1>
        <Link to="/device/add" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition duration-300 transform hover:-translate-y-0.5">
          Add New Device
        </Link>
      </div>

      {devices.length === 0 ? (
        <p className="text-center text-gray-600 text-xl mt-16 p-4 rounded-lg bg-white shadow-inner mx-auto max-w-lg">No devices found. Click "Add New Device" to get started!</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 px-2 sm:px-0"> {/* Added more responsive grid and gap */}
          {devices.map(device => (
            <DeviceCard key={device._id} device={device} onDelete={handleDeleteDevice} />
          ))}
        </div>
      )}
    </div>
  );
}

export default HomePage;