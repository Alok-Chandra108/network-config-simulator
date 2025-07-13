// client/src/services/userService.js
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
const USERS_API_URL = `${API_BASE_URL}/users`;

// Helper function to get the authorization header config
const getConfig = (token) => ({
  headers: {
    Authorization: `Bearer ${token}`,
  },
});


const getAllUsers = async (token) => {
  const response = await axios.get(USERS_API_URL, getConfig(token));
  return response.data;
};

const userService = {
  getAllUsers,
};

export default userService;