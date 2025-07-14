import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';
import LoadingSpinner from '../common/LoadingSpinner'; 


const ALL_DEVICE_TYPES = ['Router', 'Switch', 'Firewall', 'Load Balancer', 'Server', 'Other']; 

function AddDeviceModal({ show, onClose, onDeviceAdded }) {
    const { token } = useAuth();
    const [formData, setFormData] = useState({
        name: '',
        type: ALL_DEVICE_TYPES[0], 
        ipAddress: '',
        location: '',
        description: '',
        owner: '', 
    });
    const [users, setUsers] = useState([]); 
    const [loading, setLoading] = useState(false);
    const [usersLoading, setUsersLoading] = useState(true);

    useEffect(() => {
        const fetchUsers = async () => {
            if (!show) return; 

            try {
                setUsersLoading(true);
                const config = {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                };
                const response = await axios.get('/api/users', config); 
                setUsers(response.data);
                // Set the first user as default owner if available, otherwise clear owner
                if (response.data.length > 0) {
                    setFormData((prevData) => ({
                        ...prevData,
                        owner: response.data[0]._id, 
                    }));
                } else {
                    setFormData((prevData) => ({
                        ...prevData,
                        owner: '', 
                    }));
                }
            } catch (err) {
                console.error('Error fetching users for owner dropdown:', err.response?.data?.message || err.message);
                toast.error(err.response?.data?.message || 'Failed to fetch users for owner selection.');
            } finally {
                setUsersLoading(false);
            }
        };

        fetchUsers();
    }, [show, token]); // Refetch users when modal visibility changes or token changes

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({ ...prevData, [name]: value }));
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

            const response = await axios.post('/api/devices', formData, config);
            toast.success(`Device "${response.data.name}" added successfully!`);
            onDeviceAdded(response.data); 
            onClose(); 
            // Reset form for next use
            setFormData({
                name: '',
                type: ALL_DEVICE_TYPES[0],
                ipAddress: '',
                location: '',
                description: '',
                owner: users.length > 0 ? users[0]._id : '', 
            });
        } catch (err) {
            console.error('Error adding device:', err.response?.data?.message || err.message);
            toast.error(err.response?.data?.message || 'Failed to add device.');
        } finally {
            setLoading(false);
        }
    };

    if (!show) {
        return null;
    }

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 overflow-y-auto p-4 sm:p-6">
            <div className="bg-white rounded-lg shadow-xl p-6 sm:p-8 w-full max-w-xl md:max-w-2xl lg:max-w-3xl mx-auto my-8 animate-fade-in-up">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 text-center">Add New Device</h3>
                {usersLoading ? (
                    <LoadingSpinner />
                ) : (
                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 mb-6">
                            <div>
                                <div className="mb-4">
                                    <label htmlFor="name" className="block text-gray-700 text-sm font-bold mb-2">
                                        Device Name
                                    </label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline text-sm sm:text-base"
                                        required
                                    />
                                </div>
                                <div className="mb-4">
                                    <label htmlFor="type" className="block text-gray-700 text-sm font-bold mb-2">
                                        Device Type
                                    </label>
                                    <select
                                        id="type"
                                        name="type"
                                        value={formData.type}
                                        onChange={handleChange}
                                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline text-sm sm:text-base"
                                        required
                                    >
                                        {ALL_DEVICE_TYPES.map((type) => (
                                            <option key={type} value={type}>
                                                {type}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="mb-4">
                                    <label htmlFor="ipAddress" className="block text-gray-700 text-sm font-bold mb-2">
                                        IP Address (Optional)
                                    </label>
                                    <input
                                        type="text"
                                        id="ipAddress"
                                        name="ipAddress"
                                        value={formData.ipAddress}
                                        onChange={handleChange}
                                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline text-sm sm:text-base"
                                        placeholder="e.g., 192.168.1.1"
                                    />
                                </div>
                            </div>

                            <div>
                                <div className="mb-4">
                                    <label htmlFor="location" className="block text-gray-700 text-sm font-bold mb-2">
                                        Location (Optional)
                                    </label>
                                    <input
                                        type="text"
                                        id="location"
                                        name="location"
                                        value={formData.location}
                                        onChange={handleChange}
                                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline text-sm sm:text-base"
                                        placeholder="e.g., Living Room"
                                    />
                                </div>
                                <div className="mb-4">
                                    <label htmlFor="description" className="block text-gray-700 text-sm font-bold mb-2">
                                        Description (Optional)
                                    </label>
                                    <textarea
                                        id="description"
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        rows="3"
                                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline text-sm sm:text-base"
                                    ></textarea>
                                </div>
                                <div className="mb-4"> 
                                    <label htmlFor="owner" className="block text-gray-700 text-sm font-bold mb-2">
                                        Owner
                                    </label>
                                    {users.length === 0 ? (
                                        <p className="text-red-500 text-sm">No users available to assign as owner. Please create users first.</p>
                                    ) : (
                                        <select
                                            id="owner"
                                            name="owner"
                                            value={formData.owner}
                                            onChange={handleChange}
                                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline text-sm sm:text-base"
                                            required
                                        >
                                            {users.map((user) => (
                                                <option key={user._id} value={user._id}>
                                                    {user.username} ({user.email})
                                                </option>
                                            ))}
                                        </select>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end space-x-2 sm:space-x-3 mt-6">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-3 py-1.5 sm:px-4 sm:py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition duration-300 ease-in-out text-sm sm:text-base" // Adjusted padding and font size
                                disabled={loading}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-3 py-1.5 sm:px-4 sm:py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition duration-300 ease-in-out text-sm sm:text-base" // Adjusted padding and font size
                                disabled={loading || users.length === 0}
                            >
                                {loading ? 'Adding...' : 'Add Device'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}

export default AddDeviceModal;