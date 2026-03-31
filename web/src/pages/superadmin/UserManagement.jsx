import React, { useState, useEffect } from 'react';
import { 
  getAllUsersForManagement, 
  createUser, 
  updateUser, 
  resendActivationLink,
  archiveUser,
  unarchiveUser
} from '../../api/user';
import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight,
  Mail,
  CheckCircle,
  XCircle,
  RefreshCw,
  Search,
  Filter,
  UserPlus,
  ArrowUpDown
} from 'lucide-react';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [limit, setLimit] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showArchived, setShowArchived] = useState(false);
  const [filterRole, setFilterRole] = useState('all');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    tupId: '',
    email: '',
    role: 'user',
    department: '',
    birthday: '',
    age: '',
    gender: '',
    userType: 'Student'
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Debounce search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1); // Reset to first page on new search
    }, 500);

    return () => clearTimeout(handler);
  }, [searchQuery]);

  useEffect(() => {
    fetchUsers();
  }, [currentPage, debouncedSearch, showArchived, filterRole, filterDepartment]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: limit,
        search: debouncedSearch,
        role: filterRole,
        department: filterDepartment,
        isArchived: showArchived
      };
      
      const response = await getAllUsersForManagement(params);
      setUsers(response.users);
      setTotalPages(response.totalPages);
      setTotalUsers(response.totalUsers);
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
        gender: user.gender || '',
        userType: user.userType || 'Student',
        isActivated: user.isActivated ?? false
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
        gender: '',
        userType: 'Student',
        isActivated: false
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
    const { name, value, type, checked } = e.target;
    let updatedForm = { ...formData, [name]: type === 'checkbox' ? checked : value };

    // Auto-calculate age when birthday changes
    if (name === 'birthday') {
      updatedForm.age = calculateAge(value);
    }

    // Auto-detect userType in Admin Modal to prevent errors
    if (name === 'tupId') {
      const val = value.toUpperCase();
      if (val.startsWith("TUPT")) {
        updatedForm.userType = "Student";
      } else if (val.split('-')[0].length === 3 && val !== "") {
        updatedForm.userType = "Faculty";
      }
    }

    if (name === 'email') {
      if (value.includes("_")) {
        updatedForm.userType = "Faculty";
      } else if (value.includes(".") && !value.includes("_")) {
        updatedForm.userType = "Student";
      }
    }

    setFormData(updatedForm);
  };

  const handleResendActivation = async (userId) => {
    if (!window.confirm('Resend activation email to this user?')) return;
    try {
      await resendActivationLink(userId);
      setSuccess('Activation link resent successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend link');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }

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

  const getUserTypeBadgeColor = (type) => {
    switch(type) {
      case 'Faculty': return 'bg-purple-100 text-purple-800';
      case 'Student': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Remove the client-side filteredUsers variable
  // We now use the 'users' state directly since it is filtered by the backend
  
  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
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

      <div className="mb-6 flex justify-between items-center flex-wrap gap-4">
        <div className="flex gap-2">
          <button
            onClick={() => handleOpenModal('create')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-sm font-medium"
          >
            + Add New User
          </button>
          <button
            onClick={() => {
              setShowArchived(!showArchived);
              setCurrentPage(1);
            }}
            className={`px-4 py-2 rounded-lg transition font-medium shadow-sm ${
              showArchived 
                ? 'bg-amber-600 text-white hover:bg-amber-700' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {showArchived ? 'Show Active' : 'Show Archived'}
          </button>
        </div>
        <div className="text-sm text-gray-600 font-medium bg-gray-100 px-3 py-1 rounded-full">
          {showArchived ? 'Archived' : 'Active'} Users: <span className="text-blue-600">{totalUsers}</span>
        </div>
      </div>
      
      <div className="mb-6 flex flex-wrap gap-4 items-center bg-gray-50 p-5 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex-1 min-w-[300px]">
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Search Users</label>
          <div className="relative">
            <input
              type="text"
              placeholder="Search name, TUP ID, or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all outline-none"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                &times;
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Role</label>
            <select
              value={filterRole}
              onChange={(e) => {
                setFilterRole(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all outline-none bg-white min-w-[140px]"
            >
              <option value="all">All Roles</option>
              <option value="user">User</option>
              <option value="admin">Admin</option>
              <option value="superadmin">Super Admin</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Department</label>
            <select
              value={filterDepartment}
              onChange={(e) => {
                setFilterDepartment(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all outline-none bg-white min-w-[180px]"
            >
              <option value="all">All Departments</option>
              <option value="System">System</option>
              <option value="OSA">OSA</option>
              <option value="HR">HR</option>
              <option value="Department Head">Department Head</option>
              <option value="Faculty">Faculty</option>
              <option value="Student">Student</option>
            </select>
          </div>
          
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Results</label>
            <select
              value={limit}
              onChange={(e) => {
                setLimit(parseInt(e.target.value));
                setCurrentPage(1);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all outline-none bg-white"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>

          {(filterRole !== 'all' || filterDepartment !== 'all' || searchQuery) && (
            <button
              onClick={() => {
                setFilterRole('all');
                setFilterDepartment('all');
                setSearchQuery('');
                setCurrentPage(1);
              }}
              className="px-4 py-2 h-[42px] bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition border border-red-200 font-medium whitespace-nowrap"
            >
              Clear All
            </button>
          )}
        </div>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-x-auto">
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
                Department
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users && users.length > 0 ? (
              users.map((user) => (
                <tr key={user._id} className={`${user.isArchived ? 'bg-gray-50' : ''} hover:bg-gray-50 transition-colors`}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-gray-900">
                      {user.firstName} {user.lastName}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {user.tupId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {user.department || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full ${user.isActivated ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'} shadow-sm items-center gap-1`}>
                      {user.isActivated ? <CheckCircle size={10} /> : <XCircle size={10} />}
                      {user.isActivated ? 'Activated' : 'Pending'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenModal('edit', user)}
                        className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 p-2 rounded-lg transition"
                        title="Edit User"
                      >
                        Edit
                      </button>
                      
                      {!user.isActivated && !user.isArchived && (
                        <button
                          onClick={() => handleResendActivation(user._id)}
                          className="text-blue-600 hover:text-blue-900 bg-blue-50 p-2 rounded-lg transition flex items-center gap-1"
                          title="Resend Activation Link"
                        >
                          <Mail size={14} />
                        </button>
                      )}

                      {!user.isArchived ? (
                        <button
                          onClick={() => handleArchive(user._id)}
                          className="text-amber-600 hover:text-amber-900 bg-amber-50 p-2 rounded-lg transition"
                          title="Archive"
                        >
                          Archive
                        </button>
                      ) : (
                        <button
                          onClick={() => handleUnarchive(user._id)}
                          className="text-emerald-600 hover:text-emerald-900 bg-emerald-50 p-2 rounded-lg transition"
                          title="Restore"
                        >
                          Restore
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="px-6 py-10 text-center text-gray-500 italic">
                  No users found matching your criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Styled Pagination Controls copied from Reports.jsx */}
      {totalPages > 1 && (
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between bg-white px-2 py-4 border border-gray-100 rounded-xl shadow-sm gap-4">
          <div className="text-sm text-gray-700">
            Showing <span className="font-bold text-blue-600">{(currentPage - 1) * limit + 1}</span> to <span className="font-bold text-blue-600">{Math.min(currentPage * limit, totalUsers)}</span> of <span className="font-bold text-blue-600">{totalUsers}</span> users
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="First page"
            >
              <ChevronsLeft size={16} />
            </button>
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Previous page"
            >
              <ChevronLeft size={16} />
            </button>

            <div className="flex items-center gap-1">
              {[...Array(totalPages)].map((_, idx) => {
                const page = idx + 1;
                // Complex pagination logic: show 1, last, and pages around current
                if (
                  page === 1 ||
                  page === totalPages ||
                  (page >= currentPage - 1 && page <= currentPage + 1)
                ) {
                  return (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                        currentPage === page
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'border border-gray-300 hover:bg-gray-100'
                      }`}
                    >
                      {page}
                    </button>
                  );
                } else if (page === currentPage - 2 || page === currentPage + 2) {
                  return <span key={page} className="px-2 text-gray-400 font-bold">...</span>;
                }
                return null;
              })}
            </div>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Next page"
            >
              <ChevronRight size={16} />
            </button>
            <button
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Last page"
            >
              <ChevronsRight size={16} />
            </button>
          </div>
        </div>
      )}

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

            <form onSubmit={handleSubmit} className="space-y-4">
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
                  placeholder="user@example.com"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Enter the email address manually
                </p>
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
                    Department *
                  </label>
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Department</option>
                    <option value="System">System</option>
                    <option value="OSA">OSA</option>
                    <option value="HR">HR</option>
                    <option value="Department Head">Department Head</option>
                    <option value="CIT">CIT</option>
                    <option value="Faculty">Faculty</option>
                    <option value="Student">Student</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    User Type *
                  </label>
                  <select
                    name="userType"
                    value={formData.userType}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Student">Student</option>
                    <option value="Faculty">Faculty</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Birthday *
                  </label>
                  <input
                    type="date"
                    name="birthday"
                    value={formData.birthday}
                    onChange={handleChange}
                    required
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
                  Gender *
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Activation Toggle (Edit only) */}
              {modalMode === 'edit' && (
                <div className="flex items-center gap-2 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                  <input
                    type="checkbox"
                    id="isActivated"
                    name="isActivated"
                    checked={formData.isActivated}
                    onChange={handleChange}
                    className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                  <label htmlFor="isActivated" className="text-sm font-medium text-gray-700 cursor-pointer">
                    Account is Activated (Allow login)
                  </label>
                </div>
              )}

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                >
                  {modalMode === 'create' ? 'Create User' : 'Update User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}