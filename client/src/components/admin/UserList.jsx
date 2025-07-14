import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../common/LoadingSpinner';
import ConfirmationModal from '../common/ConfirmationModal';
import EditUserModal from './EditUserModal'; 
import { toast } from 'react-toastify';

function UserList() {
  const { token, user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // State for confirmation modal
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [userToDeleteName, setUserToDeleteName] = useState('');

  const [showEditModal, setShowEditModal] = useState(false);
  const [userToEdit, setUserToEdit] = useState(null); 

  // Effect to fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        if (!token) {
          setLoading(false);
          toast.error('Authentication token not found. Please log in.');
          return;
        }

        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };

        const response = await axios.get('/api/users', config);
        setUsers(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching users:', err.response?.data?.message || err.message);
        toast.error(err.response?.data?.message || 'Failed to fetch users.');
        setLoading(false);
      }
    };

    fetchUsers();
  }, [token]);

  // Function to open the Edit User Modal
  const handleEdit = (user) => { 
    setUserToEdit(user);
    setShowEditModal(true);
  };

  // Function to handle update from EditUserModal
  const handleUserUpdated = (updatedUserData) => {
    setUsers(users.map(user =>
      user._id === updatedUserData._id ? updatedUserData : user
    ));
    setShowEditModal(false); 
    setUserToEdit(null); 
  };

  // Function to close the Edit User Modal
  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setUserToEdit(null); 
  };


  // Function to initiate the delete process (opens the confirmation modal)
  const handleDeleteClick = (userId, username) => {
    if (userId === currentUser.id) {
      toast.error('You cannot delete your own account!');
      return;
    }

    setUserToDelete(userId);
    setUserToDeleteName(username);
    setShowConfirmModal(true); 
  };

  // Function to handle confirmation from the delete modal
  const handleConfirmDelete = async () => {
    setShowConfirmModal(false);
    if (!userToDelete) return;

    try {
      setLoading(true);

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      await axios.delete(`/api/users/${userToDelete}`, config);

      setUsers(users.filter(user => user._id !== userToDelete));
      toast.success(`User "${userToDeleteName}" deleted successfully!`);
      setLoading(false);
      setUserToDelete(null);
      setUserToDeleteName('');
    } catch (err) {
      console.error('Error deleting user:', err.response?.data?.message || err.message);
      toast.error(err.response?.data?.message || 'Failed to delete user.');
      setLoading(false);
    }
  };

  // Function to handle cancellation from the delete modal
  const handleCancelDelete = () => {
    setShowConfirmModal(false);
    setUserToDelete(null);
    setUserToDeleteName('');
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">All System Users</h2>
      {users.length === 0 && !loading && (
        <p className="text-gray-600">No users found.</p>
      )}
      {users.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Roles</th>
                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user._id}>
                  <td className="py-4 px-6 whitespace-nowrap text-sm text-gray-900">{user._id}</td>
                  <td className="py-4 px-6 whitespace-nowrap text-sm text-gray-900">{user.username}</td>
                  <td className="py-4 px-6 whitespace-nowrap text-sm text-gray-900">{user.email}</td>
                  <td className="py-4 px-6 whitespace-nowrap text-sm text-gray-900">{user.roles.join(', ')}</td>
                  <td className="py-4 px-6 whitespace-nowrap text-sm text-gray-900">{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td className="py-4 px-6 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleEdit(user)} 
                      className="text-indigo-600 hover:text-indigo-900 mr-4"
                    >Edit</button>
                    {user._id !== currentUser.id && (
                      <button
                        onClick={() => handleDeleteClick(user._id, user.username || user.email)}
                        className="text-red-600 hover:text-red-900"
                      >Delete</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmationModal
        show={showConfirmModal}
        message={`Are you sure you want to delete user "${userToDeleteName}"? This action cannot be undone.`}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        confirmText="Delete"
        cancelText="Cancel"
      />

      {userToEdit && (
        <EditUserModal
          show={showEditModal}
          onClose={handleCloseEditModal}
          user={userToEdit} 
          onUserUpdated={handleUserUpdated} 
        />
      )}
    </div>
  );
}

export default UserList;