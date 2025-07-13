// client/src/components/devices/DeviceCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../common/Button';

// Add 'canDelete' to the destructured props
function DeviceCard({ device, onDelete, canDelete }) {
  // Determine status indicator color and text based on isOnline property
  const statusColor = device.isOnline ? 'bg-green-500' : 'bg-red-500';
  const statusText = device.isOnline ? 'Online' : 'Offline';

  return (
    <div className="bg-white rounded-2xl shadow-xl p-7 border border-gray-100 hover:shadow-2xl transition duration-300 ease-in-out transform hover:-translate-y-1">
      <h2 className="text-2xl font-bold text-gray-900 mb-3 truncate" title={device.name}>{device.name}</h2>
      <div className="space-y-2 text-gray-700 text-sm">
        <p><strong className="text-gray-800">Type:</strong> <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">{device.type}</span></p>
        {device.ipAddress && (
          <p><strong className="text-gray-800">IP:</strong> {device.ipAddress}</p>
        )}
        <p><strong className="text-gray-800">Location:</strong> {device.location}</p>

        {/* Display Connectivity Status */}
        <div className="flex items-center text-sm font-medium pt-2">
          <span className={`w-3 h-3 rounded-full ${statusColor} mr-2`}></span>
          <span className="text-gray-700">Status: {statusText}</span>
          {device.isOnline && device.lastPingLatency !== null && (
            <span className="ml-2 text-gray-500">({device.lastPingLatency}ms)</span>
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2 mt-6">
        <Link
          to={`/device/${device._id}`}
          className="w-full sm:w-auto text-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition duration-150"
        >
          View Details
        </Link>
        {/* Conditionally render the Delete button only if canDelete is true */}
        {canDelete && (
          <Button
            onClick={() => onDelete(device._id)}
            variant='danger'
            className="w-full sm:w-auto"
          >
            Delete
          </Button>
        )}
      </div>
    </div>
  );
}

export default DeviceCard;