import React, { useState, useEffect } from 'react';
import { 
  getAllUsersForManagement, 
  createUser, 
  updateUser, 
  archiveUser,
  unarchiveUser
} from '../../api/user';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showArchived, setShowArchived] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    tupId: '',
    email: '',
    role: 'user',
    department: '',
    birthday: '',
    age: '',
    gender: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchUsers();
  }, [showArchived]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await getAllUsersForManagement();
      setUsers(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const calculateAge = (birthday) => {
    if (!birthday) return '';
    const today = new Date();
    const birthDate = new Date(birthday);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const handleOpenModal = (mode, user = null) => {
    setModalMode(mode);
    setSelectedUser(user);
    if (mode === 'edit' && user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        tupId: user.tupId || '',
        email: user.email || '',
        role: user.role || 'user',
        department: user.department || '',
        birthday: user.birthday ? user.birthday.split('T')[0] : '',
        age: user.age || '',
        gender: user.gender || ''
      });
    } else {
      setFormData({
        firstName: '',
        lastName: '',
        tupId: '',
        email: '',
        role: 'user',
        department: '',
        birthday: '',
        age: '',
        gender: ''
      });
    }
    setShowModal(true);
    setError('');
    setSuccess('');
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedUser(null);
    setError('');
    setSuccess('');
  };

 const handleChange = (e) => {
  const { name, value } = e.target;
  let updatedForm = { ...formData, [name]: value };

  // Auto-calculate age when birthday changes
  if (name === 'birthday') {
    updatedForm.age = calculateAge(value);
  }

  // Auto-generate email when first name or last name changes
 if (name === 'firstName' || name === 'lastName') {
  const first = (name === 'firstName' ? value : updatedForm.firstName)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ''); // remove spaces
  
  const last = (name === 'lastName' ? value : updatedForm.lastName)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '');

  if (first && last) {
    updatedForm.email = `${first}.${last}@etala.com`;
  }
}


  setFormData(updatedForm);
};


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const submitData = { ...formData };
      
      if (modalMode === 'create') {
        // Auto-generate password as LASTNAME in uppercase
        submitData.password = formData.lastName.toUpperCase();
        await createUser(submitData);
        setSuccess('User created successfully! Password: ' + submitData.password);
      } else {
        await updateUser(selectedUser._id, submitData);
        setSuccess('User updated successfully!');
      }
      
      setTimeout(() => {
        handleCloseModal();
        fetchUsers();
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleArchive = async (userId) => {
    if (!window.confirm('Are you sure you want to archive this user?')) return;

    try {
      await archiveUser(userId);
      setSuccess('User archived successfully!');
      fetchUsers();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to archive user');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleUnarchive = async (userId) => {
    if (!window.confirm('Are you sure you want to restore this user?')) return;

    try {
      await unarchiveUser(userId);
      setSuccess('User restored successfully!');
      fetchUsers();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to restore user');
      setTimeout(() => setError(''), 3000);
    }
  };

  const getRoleBadgeColor = (role) => {
    switch(role) {
      case 'superadmin': return 'bg-red-100 text-red-800';
      case 'admin': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredUsers = users.filter(user => 
    showArchived ? user.isArchived : !user.isArchived
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">User Management</h1>
        <p className="text-gray-600">Manage all users, admins, and their roles</p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
          {success}
        </div>
      )}

      <div className="mb-4 flex justify-between items-center">
        <div className="space-x-2">
          <button
            onClick={() => handleOpenModal('create')}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            + Add New User
          </button>
          <button
            onClick={() => setShowArchived(!showArchived)}
            className={`px-4 py-2 rounded transition ${
              showArchived 
                ? 'bg-gray-600 text-white hover:bg-gray-700' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {showArchived ? 'Show Active Users' : 'Show Archived Users'}
          </button>
        </div>
        <div className="text-sm text-gray-600">
          {showArchived ? 'Archived' : 'Active'} Users: {filteredUsers.length}
        </div>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                TUP ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Department
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredUsers.map((user) => (
              <tr key={user._id} className={user.isArchived ? 'bg-gray-50' : ''}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {user.firstName} {user.lastName}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.tupId}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleBadgeColor(user.role)}`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.department || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  {!user.isArchived ? (
                    <>
                      <button
                        onClick={() => handleOpenModal('edit', user)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleArchive(user._id)}
                        className="text-orange-600 hover:text-orange-900"
                      >
                        Archive
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => handleUnarchive(user._id)}
                      className="text-green-600 hover:text-green-900"
                    >
                      Restore
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">
                {modalMode === 'create' ? 'Create New User' : 'Edit User'}
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                &times;
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded text-sm">
                {success}
              </div>
            )}

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name *
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  TUP ID *
                </label>
                <input
                  type="text"
                  name="tupId"
                  value={formData.tupId}
                  onChange={handleChange}
                  placeholder="TUPT-XX-XXXX"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {modalMode === 'create' && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded text-sm text-blue-700">
                  <strong>Note:</strong> Password will be automatically set to LASTNAME in uppercase
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role *
                  </label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Department
                  </label>
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Department</option>
                    <option value="System">System</option>
                    <option value="OSA">OSA</option>
                    <option value="HR">HR</option>
                    <option value="Department Head">Department Head</option>
                    <option value="CIT">CIT</option>
                    <option value="Faculty">Faculty</option>
                    <option value="Staff">Staff</option>
                    <option value="Student">Student</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Birthday (Optional)
                  </label>
                  <input
                    type="date"
                    name="birthday"
                    value={formData.birthday}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Age
                  </label>
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gender
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                >
                  {modalMode === 'create' ? 'Create User' : 'Update User'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}