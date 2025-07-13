import React, { useState, useEffect } from 'react';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import { toast } from 'react-toastify';

/**
 * EditDeviceModal Component
 * Allows administrators to edit device details, including changing the owner.
 *
 * @param {object} props - The component props.
 * @param {boolean} props.isOpen - Controls the visibility of the modal.
 * @param {function} props.onClose - Function to call when the modal is closed.
 * @param {object | null} props.deviceToEdit - The device object to be edited. Null if no device selected.
 * @param {function} props.onSave - Function to call when changes are saved. Receives the updated device data.
 * @param {Array<object>} props.users - An array of all users, used for the owner selection dropdown.
 */
function EditDeviceModal({ isOpen, onClose, deviceToEdit, onSave, users }) {
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    ipAddress: '',
    location: '',
    description: '',
    owner: '', 
  });
  const [isSaving, setIsSaving] = useState(false);

  // Effect to populate form data when a deviceToEdit is provided or changes
  useEffect(() => {
    if (deviceToEdit) {
      setFormData({
        name: deviceToEdit.name || '',
        type: deviceToEdit.type || '',
        ipAddress: deviceToEdit.ipAddress || '',
        location: deviceToEdit.location || '',
        description: deviceToEdit.description || '',
        owner: deviceToEdit.owner?._id || '', 
      });
    } else {
      // Clear form when no device is being edited 
      setFormData({
        name: '',
        type: '',
        ipAddress: '',
        location: '',
        description: '',
        owner: '',
      });
    }
  }, [deviceToEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    // Basic client-side validation
    if (!formData.name.trim() || !formData.type.trim()) {
      toast.error('Device name and type are required.');
      setIsSaving(false);
      return;
    }

    // Prepare data for submission, ensuring owner is an ObjectId or null for clarity
    const dataToSave = {
      ...formData,
      // Convert empty string for IP address to null if that's how your backend expects it for clearing
      ipAddress: formData.ipAddress.trim() === '' ? null : formData.ipAddress.trim(),
      // If owner is an empty string (no owner selected), send null. Otherwise, send the ID.
      owner: formData.owner === '' ? null : formData.owner,
    };

    try {
      // Call the onSave prop, passing the device ID and the updated data
      await onSave(deviceToEdit._id, dataToSave);
      onClose(); 
    } catch (error) {
      console.error('Failed to save device changes:', error);
      toast.error(error.message || 'Failed to update device.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!deviceToEdit) return null; 

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Edit Device: ${deviceToEdit.name}`}>
      <form onSubmit={handleSubmit} className="space-y-4 p-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Device Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm"
            required
          />
        </div>

        <div>
          <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
            Type <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="type"
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm"
            required
          />
        </div>

        <div>
          <label htmlFor="ipAddress" className="block text-sm font-medium text-gray-700 mb-1">
            IP Address
          </label>
          <input
            type="text"
            id="ipAddress"
            name="ipAddress"
            value={formData.ipAddress || ''} // Handle null
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm"
            placeholder="e.g., 192.168.1.1"
          />
        </div>

        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
            Location
          </label>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location || ''}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm"
            placeholder="e.g., Server Room A"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows="3"
            value={formData.description || ''}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm"
            placeholder="e.g., Main router for office network"
          ></textarea>
        </div>

        <div>
          <label htmlFor="owner" className="block text-sm font-medium text-gray-700 mb-1">
            Owner
          </label>
          <select
            id="owner"
            name="owner"
            value={formData.owner}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm"
          >
            <option value="">-- Select Owner --</option>
            {users.map((user) => (
              <option key={user._id} value={user._id}>
                {user.username} ({user.email})
              </option>
            ))}
          </select>
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default EditDeviceModal;