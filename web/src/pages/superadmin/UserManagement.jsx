import React, { useState, useEffect } from 'react';
import { 
  getAllUsersForManagement, 
  createUser, 
  updateUser, 
  resendActivationLink,
  archiveUser,
  unarchiveUser,
  getAllAppeals,
  respondToAppeal,
  bulkArchiveUsers
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
  ArrowUpDown,
  Edit2,
  Archive,
  RotateCcw
} from 'lucide-react';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [limit, setLimit] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showArchived, setShowArchived] = useState(false);
  const [activeTab, setActiveTab] = useState('active'); // 'active' | 'pending_archive' | 'archived' | 'appeals'
  const [appeals, setAppeals] = useState([]);
  const [pendingArchiveCount, setPendingArchiveCount] = useState(0);
  const [showArchiveReasonModal, setShowArchiveReasonModal] = useState(false);
  const [archivingUserId, setArchivingUserId] = useState(null);
  const [archiveReasonInput, setArchiveReasonInput] = useState('');
  const [archiveGraceDaysInput, setArchiveGraceDaysInput] = useState(7);
  const [customArchiveReason, setCustomArchiveReason] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [filterArchiveStatus, setFilterArchiveStatus] = useState('all');
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
    fetchCounts();
  }, []);

  useEffect(() => {
    if (activeTab === 'appeals') {
      fetchAppeals();
    } else {
      fetchUsers();
    }
  }, [currentPage, debouncedSearch, showArchived, activeTab, filterRole, filterDepartment, filterArchiveStatus]);

  const fetchCounts = async () => {
    try {
      const appealsData = await getAllAppeals();
      setAppeals(appealsData);

      const pendingResponse = await getAllUsersForManagement({
        limit: 1,
        archiveStatus: 'Pending Archive',
        isArchived: false
      });
      setPendingArchiveCount(pendingResponse.totalUsers || 0);
    } catch (err) {
      console.error("Failed to load counts:", err);
    }
  };

  const fetchAppeals = async () => {
    try {
      setLoading(true);
      const data = await getAllAppeals();
      setAppeals(data);
      setTotalUsers(data.length);
      setTotalPages(1);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch appeals');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: limit,
        search: debouncedSearch,
        role: filterRole,
        department: filterDepartment,
        archiveStatus: activeTab === 'pending_archive' ? 'Pending Archive' : filterArchiveStatus,
        isArchived: showArchived
      };
      
      const response = await getAllUsersForManagement(params);
      setUsers(response.users);
      setTotalPages(response.totalPages);
      setTotalUsers(response.totalUsers);
      
      // Keep badges updated
      fetchCounts();
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
        role: (user.role === 'admin' || user.role === 'superadmin') ? 'superadmin' : 'user',
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

  const handleArchive = (userId) => {
    setArchivingUserId(userId);
    setArchiveReasonInput('');
    setCustomArchiveReason('');
    setArchiveGraceDaysInput(7);
    setShowArchiveReasonModal(true);
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

  const handleRespondToAppeal = async (userId, action) => {
    const confirmationMsg = action === 'approve'
      ? "Are you sure you want to approve this user's appeal? Their account will be fully restored."
      : "Are you sure you want to reject this user's appeal? Their account will be deactivated permanently.";
    
    if (!window.confirm(confirmationMsg)) return;

    try {
      setLoading(true);
      await respondToAppeal(userId, { action });
      setSuccess(`Appeal ${action === 'approve' ? 'approved' : 'rejected'} successfully!`);
      fetchAppeals();
      fetchAppealsCount();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || `Failed to ${action} appeal`);
      setTimeout(() => setError(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  const getUserTypeBadgeColor = (type) => {
    switch(type) {
      case 'Faculty': return 'bg-purple-100 text-purple-800';
      case 'Student': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleLabel = (role) => {
    return (role === 'superadmin' || role === 'admin') ? 'Admin' : 'User';
  };

  const getRoleBadgeColor = (role) => {
    return (role === 'superadmin' || role === 'admin')
      ? 'bg-red-100 text-red-700'
      : 'bg-blue-100 text-blue-700';
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
    <div className="w-full max-w-[98%] mx-auto px-4 sm:px-8 py-6">
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
        <div className="flex gap-2 items-center">
          <button
            onClick={() => handleOpenModal('create')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-sm font-medium mr-2"
          >
            + Add New User
          </button>
          <div className="flex bg-gray-100 p-1 rounded-lg border border-gray-200 shadow-inner">
            <button
              onClick={() => {
                setActiveTab('active');
                setShowArchived(false);
                setCurrentPage(1);
                setSelectedUserIds([]);
              }}
              className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-all ${
                activeTab === 'active' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Active
            </button>
            <button
              onClick={() => {
                setActiveTab('pending_archive');
                setShowArchived(false);
                setCurrentPage(1);
                setSelectedUserIds([]);
              }}
              className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-all relative ${
                activeTab === 'pending_archive' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Pending Archive
              {pendingArchiveCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-white animate-pulse">
                  {pendingArchiveCount}
                </span>
              )}
            </button>
            <button
              onClick={() => {
                setActiveTab('archived');
                setShowArchived(true);
                setCurrentPage(1);
                setSelectedUserIds([]);
              }}
              className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-all ${
                activeTab === 'archived' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Archived
            </button>
            <button
              onClick={() => {
                setActiveTab('appeals');
                setCurrentPage(1);
                setSelectedUserIds([]);
              }}
              className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-all relative ${
                activeTab === 'appeals' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Appeals
              {appeals.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white animate-pulse">
                  {appeals.length}
                </span>
              )}
            </button>
          </div>
        </div>
        <div className="text-sm text-gray-600 font-semibold bg-gray-100 px-4 py-1.5 rounded-full shadow-sm">
          {activeTab === 'active' ? 'Active' : activeTab === 'pending_archive' ? 'Pending Archive' : activeTab === 'archived' ? 'Archived' : 'Appeals under review'}: <span className="text-blue-600 font-bold">{totalUsers}</span>
        </div>
      </div>

      {/* Bulk Actions Banner */}
      {selectedUserIds.length > 0 && activeTab === 'active' && (
        <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl shadow-md flex flex-col sm:flex-row items-center justify-between gap-4 animate-modal-zoom">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm shadow-inner">
              {selectedUserIds.length}
            </div>
            <div>
              <h3 className="font-bold text-blue-900 text-sm leading-none mb-1">
                {selectedUserIds.length === 1 ? "1 User Selected" : `${selectedUserIds.length} Users Selected`}
              </h3>
              <p className="text-xs text-blue-700 font-semibold leading-relaxed">
                You can schedule deactivation for all selected users at once.
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              onClick={() => {
                setArchivingUserId('bulk');
                setArchiveReasonInput('');
                setCustomArchiveReason('');
                setArchiveGraceDaysInput(7);
                setShowArchiveReasonModal(true);
              }}
              className="flex-1 sm:flex-none px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-all font-bold text-xs shadow-md shadow-amber-600/20 hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Archive size={14} strokeWidth={2.5} />
              Bulk Archive
            </button>
            
            <button
              onClick={() => setSelectedUserIds([])}
              className="flex-1 sm:flex-none px-4 py-2 border border-gray-200 hover:bg-gray-100 text-gray-700 rounded-lg transition font-semibold text-xs text-center cursor-pointer"
            >
              Deselect All
            </button>
          </div>
        </div>
      )}
      
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
              <option value="MAAD">MAAD</option>
              <option value="CAAD">CAAD</option>
              <option value="EAAD">EAAD</option>
              <option value="BASD">BASD</option>
            </select>
          </div>

          {activeTab === 'active' && (
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Status</label>
              <select
                value={filterArchiveStatus}
                onChange={(e) => {
                  setFilterArchiveStatus(e.target.value);
                  setCurrentPage(1);
                  setSelectedUserIds([]);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all outline-none bg-white min-w-[180px]"
              >
                <option value="all">All Statuses</option>
                <option value="Active">Active Only</option>
                <option value="Pending Archive">Pending Archive Only</option>
              </select>
            </div>
          )}
          
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

          {(filterRole !== 'all' || filterDepartment !== 'all' || searchQuery || filterArchiveStatus !== 'all') && (
            <button
              onClick={() => {
                setFilterRole('all');
                setFilterDepartment('all');
                setFilterArchiveStatus('all');
                setSearchQuery('');
                setCurrentPage(1);
                setSelectedUserIds([]);
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
              {(activeTab === 'active' || activeTab === 'archived') && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-10">
                  <input
                    type="checkbox"
                    checked={
                      users.length > 0 &&
                      users.filter(u => u.archiveStatus !== 'Pending Archive' && !u.isArchived).length > 0 &&
                      users.filter(u => u.archiveStatus !== 'Pending Archive' && !u.isArchived).every(u => selectedUserIds.includes(u._id))
                    }
                    onChange={() => {
                      const pageEligible = users.filter(u => u.archiveStatus !== 'Pending Archive' && !u.isArchived);
                      const pageEligibleIds = pageEligible.map(u => u._id);
                      const allChecked = pageEligible.length > 0 && pageEligible.every(u => selectedUserIds.includes(u._id));
                      if (allChecked) {
                        setSelectedUserIds(prev => prev.filter(id => !pageEligibleIds.includes(id)));
                      } else {
                        setSelectedUserIds(prev => {
                          const newSelections = [...prev];
                          pageEligibleIds.forEach(id => {
                            if (!newSelections.includes(id)) newSelections.push(id);
                          });
                          return newSelections;
                        });
                      }
                    }}
                    className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
                  />
                </th>
              )}
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
                Role
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
            {activeTab === 'appeals' ? (
              appeals && appeals.length > 0 ? (
                appeals.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">
                        {user.firstName} {user.lastName}
                      </div>
                      <div className="text-xs text-gray-500 font-medium">{user.tupId}</div>
                    </td>
                    <td className="px-6 py-4" colSpan="2">
                      <div className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Archiving Reason:</div>
                      <div className="text-xs text-amber-700 bg-amber-50 px-2.5 py-1.5 rounded-lg border border-amber-100 font-semibold max-w-xs truncate" title={user.archiveReason}>
                        "{user.archiveReason}"
                      </div>
                    </td>
                    <td className="px-6 py-4" colSpan="4">
                      <div className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">User's Appeal Reason:</div>
                      <div className="text-xs text-indigo-700 bg-indigo-50 px-3 py-2 rounded-lg border border-indigo-100 font-semibold max-w-md whitespace-pre-wrap break-words">
                        "{user.archiveAppealReason}"
                      </div>
                      <div className="text-[10px] text-gray-400 mt-1 font-semibold">
                        Submitted: {new Date(user.archiveAppealSubmittedAt).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleRespondToAppeal(user._id, 'approve')}
                          className="px-3 py-1.5 text-xs font-bold text-white bg-green-600 rounded-lg hover:bg-green-700 shadow transition active:scale-95"
                          title="Approve Appeal"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleRespondToAppeal(user._id, 'reject')}
                          className="px-3 py-1.5 text-xs font-bold text-white bg-red-600 rounded-lg hover:bg-red-700 shadow transition active:scale-95"
                          title="Reject Appeal"
                        >
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center text-gray-500 italic font-semibold">
                    No pending appeals under review.
                  </td>
                </tr>
              )
            ) : (
              users && users.length > 0 ? (
                users.map((user) => (
                  <tr key={user._id} className={`${user.isArchived ? 'bg-gray-50' : ''} hover:bg-gray-50 transition-colors`}>
                    {(activeTab === 'active' || activeTab === 'archived') && (
                      <td className="px-6 py-4 whitespace-nowrap w-10">
                        <input
                          type="checkbox"
                          disabled={user.archiveStatus === 'Pending Archive' || user.isArchived}
                          checked={selectedUserIds.includes(user._id)}
                          onChange={() => {
                            if (selectedUserIds.includes(user._id)) {
                              setSelectedUserIds(prev => prev.filter(id => id !== user._id));
                            } else {
                              setSelectedUserIds(prev => [...prev, user._id]);
                            }
                          }}
                          className={`w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer ${
                            (user.archiveStatus === 'Pending Archive' || user.isArchived) ? 'opacity-30 cursor-not-allowed' : ''
                          }`}
                        />
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">
                        {user.firstName} {user.lastName}
                      </div>
                      {user.archiveStatus === 'Pending Archive' && (
                        <span className="inline-block mt-0.5 px-2 py-0.5 text-[9px] font-bold text-amber-800 bg-amber-100 rounded-full border border-amber-200">
                          Pending Archive
                        </span>
                      )}
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {user.userType || 'Student'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full ${getRoleBadgeColor(user.role)} shadow-sm`}>
                        {getRoleLabel(user.role)}
                      </span>
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
                          className="text-indigo-600 hover:text-indigo-950 bg-indigo-50 hover:bg-indigo-100 p-2 rounded-lg transition-all flex items-center justify-center w-8 h-8 shadow-sm hover:shadow active:scale-95"
                          title="Edit User"
                        >
                          <Edit2 size={14} strokeWidth={2.5} />
                        </button>
                        
                        {!user.isActivated && !user.isArchived ? (
                          <button
                            onClick={() => handleResendActivation(user._id)}
                            className="text-blue-600 hover:text-blue-950 bg-blue-50 hover:bg-blue-100 p-2 rounded-lg transition-all flex items-center justify-center w-8 h-8 shadow-sm hover:shadow active:scale-95"
                            title="Resend Activation Link"
                          >
                            <Mail size={14} strokeWidth={2.5} />
                          </button>
                        ) : (
                          <div className="w-8 h-8" /> /* Grid placeholder to ensure perfect columns */
                        )}

                        {user.archiveStatus === 'Pending Archive' ? (
                          <button
                            onClick={() => handleUnarchive(user._id)}
                            className="text-emerald-600 hover:text-emerald-950 bg-emerald-50 hover:bg-emerald-100 p-2 rounded-lg transition-all flex items-center justify-center w-8 h-8 shadow-sm hover:shadow active:scale-95"
                            title="Cancel Scheduled Archiving (Restore)"
                          >
                            <RotateCcw size={14} strokeWidth={2.5} />
                          </button>
                        ) : !user.isArchived ? (
                          <button
                            onClick={() => handleArchive(user._id)}
                            className="text-amber-600 hover:text-amber-950 bg-amber-50 hover:bg-amber-100 p-2 rounded-lg transition-all flex items-center justify-center w-8 h-8 shadow-sm hover:shadow active:scale-95"
                            title="Archive User"
                          >
                            <Archive size={14} strokeWidth={2.5} />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleUnarchive(user._id)}
                            className="text-emerald-600 hover:text-emerald-950 bg-emerald-50 hover:bg-emerald-100 p-2 rounded-lg transition-all flex items-center justify-center w-8 h-8 shadow-sm hover:shadow active:scale-95"
                            title="Restore User"
                          >
                            <RotateCcw size={14} strokeWidth={2.5} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={(activeTab === 'active' || activeTab === 'archived') ? 9 : 8} className="px-6 py-12 text-center text-gray-500 italic font-semibold">
                    No users found matching your criteria.
                  </td>
                </tr>
              )
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
                    <option value="superadmin">Admin</option>
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
                    <option value="MAAD">MAAD</option>
                    <option value="CAAD">CAAD</option>
                    <option value="EAAD">EAAD</option>
                    <option value="BASD">BASD</option>
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
                  value={["Male", "Female", "Gay", "Lesbian", "Bisexual", "Transgender", "Queer", "Non-binary", "Prefer not to say", ""].includes(formData.gender) ? formData.gender : (formData.gender ? "Other" : "")}
                  onChange={(e) => {
                    const { value } = e.target;
                    if (value === "Other") {
                      setFormData({ ...formData, gender: "Other" });
                    } else {
                      setFormData({ ...formData, gender: value });
                    }
                  }}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Gay">Gay</option>
                  <option value="Lesbian">Lesbian</option>
                  <option value="Bisexual">Bisexual</option>
                  <option value="Transgender">Transgender</option>
                  <option value="Queer">Queer/Questioning</option>
                  <option value="Non-binary">Non-binary</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                  <option value="Other">Other (Please specify)</option>
                </select>

                {(formData.gender === "Other" || (!["Male", "Female", "Gay", "Lesbian", "Bisexual", "Transgender", "Queer", "Non-binary", "Prefer not to say", ""].includes(formData.gender))) && (
                  <input
                    type="text"
                    placeholder="Please specify your gender"
                    value={formData.gender === "Other" ? "" : formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                )}
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

      {/* Archive Reason Modal (Option A) */}
      {showArchiveReasonModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative bg-white border border-gray-200 w-full max-w-md shadow-2xl rounded-2xl p-6 transition-all transform scale-100">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-xl font-bold text-gray-900">Schedule Account Archive</h3>
              <button
                onClick={() => {
                  setShowArchiveReasonModal(false);
                  setArchivingUserId(null);
                }}
                className="text-gray-400 hover:text-gray-600 text-2xl transition"
              >
                &times;
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Reason for Archiving</label>
                <select
                  value={archiveReasonInput}
                  onChange={(e) => {
                    setArchiveReasonInput(e.target.value);
                    if (e.target.value !== 'Other') setCustomArchiveReason('');
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all outline-none bg-white text-sm"
                >
                  <option value="">-- Select a Reason --</option>
                  <option value="Inactivity (No login for more than 6 months)">💤 Inactivity (No login for &gt;6 months)</option>
                  <option value="Graduated / Left the Institution">🎓 Graduated / Left Institution</option>
                  <option value="Policy Violation / Misbehavior">⚠️ Policy Violation / Misbehavior</option>
                  <option value="Duplicate / Registered by mistake">👥 Duplicate Account</option>
                  <option value="Other">✏️ Other Reason...</option>
                </select>
              </div>

              {archiveReasonInput === 'Other' && (
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Custom Reason *</label>
                  <textarea
                    value={customArchiveReason}
                    onChange={(e) => setCustomArchiveReason(e.target.value)}
                    placeholder="Enter custom reason here..."
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all outline-none text-sm"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Grace Period (Days)</label>
                <select
                  value={archiveGraceDaysInput}
                  onChange={(e) => setArchiveGraceDaysInput(parseInt(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all outline-none bg-white text-sm"
                >
                  <option value={3}>3 Days (Urgent)</option>
                  <option value={7}>7 Days (Recommended)</option>
                  <option value={14}>14 Days (Two Weeks)</option>
                  <option value={30}>30 Days (One Month)</option>
                </select>
                <p className="text-[11px] text-gray-400 mt-1 font-semibold">
                  The user can log in and submit an appeal during this window.
                </p>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3 border-t border-gray-100 pt-4">
              <button
                onClick={() => {
                  setShowArchiveReasonModal(false);
                  setArchivingUserId(null);
                }}
                className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  const finalReason = archiveReasonInput === 'Other' ? customArchiveReason : archiveReasonInput;
                  if (!finalReason || !finalReason.trim()) {
                    alert('Please select or specify a reason.');
                    return;
                  }
                  
                  try {
                    setLoading(true);
                    setShowArchiveReasonModal(false);
                    if (archivingUserId === 'bulk') {
                      await bulkArchiveUsers({ userIds: selectedUserIds, reason: finalReason, graceDays: archiveGraceDaysInput });
                      setSuccess(`Successfully scheduled archiving for ${selectedUserIds.length} users!`);
                      setSelectedUserIds([]);
                    } else {
                      await archiveUser(archivingUserId, { reason: finalReason, graceDays: archiveGraceDaysInput });
                      setSuccess('User scheduled for archiving successfully!');
                    }
                    setArchivingUserId(null);
                    setArchiveReasonInput('');
                    setCustomArchiveReason('');
                    fetchUsers();
                    setTimeout(() => setSuccess(''), 3000);
                  } catch (err) {
                    setError(err.response?.data?.message || 'Failed to archive user');
                    setTimeout(() => setError(''), 3000);
                  } finally {
                    setLoading(false);
                  }
                }}
                className="px-5 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-md shadow-blue-500/20 transition font-bold"
              >
                Schedule Archive
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}