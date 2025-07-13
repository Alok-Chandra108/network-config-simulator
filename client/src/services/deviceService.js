// client/src/services/deviceService.js
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
const DEVICES_API_URL = `${API_BASE_URL}/devices`;

// Helper function to get the configuration object with authorization header
const getConfig = (token) => {
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

const getDevices = async (token) => { 
  const response = await axios.get(DEVICES_API_URL, getConfig(token)); 
  return response.data;
};

const getDeviceById = async (id, token) => { 
  const response = await axios.get(`${DEVICES_API_URL}/${id}`, getConfig(token)); 
  return response.data;
};

const createDevice = async (deviceData, token) => { 
  const response = await axios.post(DEVICES_API_URL, deviceData, getConfig(token));
  return response.data;
};

const updateDevice = async (id, deviceData, token) => { 
  const response = await axios.put(`${DEVICES_API_URL}/${id}`, deviceData, getConfig(token)); 
  return response.data;
};

const deleteDevice = async (id, token) => { 
  const response = await axios.delete(`${DEVICES_API_URL}/${id}`, getConfig(token)); 
  return response.data;
};

const checkDeviceStatus = async (id, token) => { 
  const response = await axios.get(`${DEVICES_API_URL}/${id}/status`, getConfig(token)); 
  return response.data;
};

const deviceService = {
  getDevices,
  getDeviceById,
  createDevice,
  updateDevice,
  deleteDevice,
  checkDeviceStatus, 
};

export default deviceService;