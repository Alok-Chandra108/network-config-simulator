// client/src/services/deviceService.js
import axios from 'axios';

// Base URL for our backend API.
// This variable now correctly uses VITE_API_BASE_URL from the .env file.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
const DEVICES_API_URL = `${API_BASE_URL}/devices`;

const getDevices = async () => {
  const response = await axios.get(DEVICES_API_URL);
  return response.data;
};

const getDeviceById = async (id) => {
  const response = await axios.get(`${DEVICES_API_URL}/${id}`);
  return response.data;
};

const createDevice = async (deviceData) => {
  const response = await axios.post(DEVICES_API_URL, deviceData);
  return response.data;
};

const updateDevice = async (id, deviceData) => {
  const response = await axios.put(`${DEVICES_API_URL}/${id}`, deviceData);
  return response.data;
};

const deleteDevice = async (id) => {
  const response = await axios.delete(`${DEVICES_API_URL}/${id}`);
  return response.data;
};

// NEW: Function to check device connectivity status
const checkDeviceStatus = async (id) => {
  const response = await axios.get(`${DEVICES_API_URL}/${id}/status`);
  return response.data;
};

const deviceService = {
  getDevices,
  getDeviceById,
  createDevice,
  updateDevice,
  deleteDevice,
  checkDeviceStatus, // Export the new function
};

export default deviceService;