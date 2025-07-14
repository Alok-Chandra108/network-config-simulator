import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';

const ALL_ROLES = ['admin', 'user', 'viewer'];

function EditUserModal({ show, onClose, user, onUserUpdated }) {
  const { token, user: currentUser } = useAuth(); 
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    roles: [],
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (show && user) {
      setFormData({
        username: user.username,
        email: user.email,
        roles: user.roles,
      });
    }
  }, [show, user]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setFormData((prevData) => {
        const newRoles = checked
          ? [...prevData.roles, value]
          : prevData.roles.filter((role) => role !== value);
        return { ...prevData, roles: newRoles };
      });
    } else {
      setFormData((prevData) => ({ ...prevData, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      };

      // Ensure that an admin cannot remove their own admin role or all roles
      if (user._id === currentUser.id) {
        if (user.roles.includes('admin') && !formData.roles.includes('admin')) {
          toast.error('You cannot remove your own admin role.');
          setLoading(false);
          return;
        }
        if (formData.roles.length === 0) {
          toast.error('You cannot remove all roles from your own account.');
          setLoading(false);
          return;
        }
      }

      const response = await axios.put(`/api/users/${user._id}`, formData, config);
      toast.success(`User "${response.data.username}" updated successfully!`);
      onUserUpdated(response.data); // Notify parent component of the update
      onClose(); // Close the modal
    } catch (err) {
      console.error('Error updating user:', err.response?.data?.message || err.message);
      toast.error(err.response?.data?.message || 'Failed to update user.');
    } finally {
      setLoading(false);
    }
  };

  if (!show) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md mx-auto my-8 animate-fade-in-up">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">Edit User: {user?.username}</h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="username" className="block text-gray-700 text-sm font-bold mb-2">
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">Roles</label>
            <div className="flex flex-wrap gap-x-4 gap-y-2">
              {ALL_ROLES.map((role) => (
                <label key={role} className="inline-flex items-center text-gray-700">
                  <input
                    type="checkbox"
                    name="roles"
                    value={role}
                    checked={formData.roles.includes(role)}
                    onChange={handleChange}
                    className="form-checkbox h-5 w-5 text-indigo-600 rounded"
                  />
                  <span className="ml-2 capitalize">{role}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition duration-300 ease-in-out"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition duration-300 ease-in-out"
              disabled={loading}
            >
              {loading ? 'Updating...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditUserModal;