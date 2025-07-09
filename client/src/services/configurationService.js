// client/src/services/configurationService.js
import axios from 'axios';

// Base URL for our backend API.
// This variable now correctly uses VITE_API_BASE_URL from the .env file.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const getConfigurationsForDevice = async (deviceId) => {
  const response = await axios.get(`${API_BASE_URL}/devices/${deviceId}/configurations`);
  return response.data;
};

const createConfiguration = async (deviceId, configData) => {
  const response = await axios.post(`${API_BASE_URL}/devices/${deviceId}/configurations`, configData);
  return response.data;
};

const getConfigurationById = async (configId) => {
  const response = await axios.get(`${API_BASE_URL}/configurations/${configId}`);
  return response.data;
};

const setCurrentConfiguration = async (deviceId, configId) => {
  const response = await axios.put(`${API_BASE_URL}/devices/${deviceId}/configurations/${configId}/set-current`);
  return response.data;
};

const configurationService = {
  getConfigurationsForDevice,
  createConfiguration,
  getConfigurationById,
  setCurrentConfiguration,
};

export default configurationService;