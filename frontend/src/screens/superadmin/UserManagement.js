import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
  StyleSheet,
  RefreshControl,
  SafeAreaView,
  StatusBar
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
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
  const [refreshing, setRefreshing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showArchived, setShowArchived] = useState(false);
  const [filterRole, setFilterRole] = useState('all');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
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
      setTimeout(() => setError(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchUsers();
    setRefreshing(false);
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
    return age.toString();
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

  const handleChange = (name, value) => {
    let updatedForm = { ...formData, [name]: value };

    if (name === 'birthday') {
      updatedForm.age = calculateAge(value);
    }

    if (name === 'firstName' || name === 'lastName') {
      const first = (name === 'firstName' ? value : updatedForm.firstName)
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '');
      
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

  const handleSubmit = async () => {
    setError('');
    setSuccess('');

    if (!formData.firstName || !formData.lastName || !formData.tupId || !formData.email) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      const submitData = { ...formData };
      
      if (modalMode === 'create') {
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
    Alert.alert(
      'Archive User',
      'Are you sure you want to archive this user?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Archive',
          style: 'destructive',
          onPress: async () => {
            try {
              await archiveUser(userId);
              setSuccess('User archived successfully!');
              fetchUsers();
              setTimeout(() => setSuccess(''), 3000);
            } catch (err) {
              setError(err.response?.data?.message || 'Failed to archive user');
              setTimeout(() => setError(''), 3000);
            }
          }
        }
      ]
    );
  };

  const handleUnarchive = async (userId) => {
    Alert.alert(
      'Restore User',
      'Are you sure you want to restore this user?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Restore',
          onPress: async () => {
            try {
              await unarchiveUser(userId);
              setSuccess('User restored successfully!');
              fetchUsers();
              setTimeout(() => setSuccess(''), 3000);
            } catch (err) {
              setError(err.response?.data?.message || 'Failed to restore user');
              setTimeout(() => setError(''), 3000);
            }
          }
        }
      ]
    );
  };

  const getRoleBadgeColor = (role) => {
    switch(role) {
      case 'superadmin': return { bg: '#fef2f2', text: '#dc2626', border: '#fecaca' };
      case 'admin': return { bg: '#eff6ff', text: '#2563eb', border: '#bfdbfe' };
      default: return { bg: '#f9fafb', text: '#6b7280', border: '#e5e7eb' };
    }
  };

  const filteredUsers = users.filter(user => {
    const archivedMatch = showArchived ? user.isArchived : !user.isArchived;
    const roleMatch = filterRole === 'all' || user.role === filterRole;
    const departmentMatch = filterDepartment === 'all' || user.department === filterDepartment;
    return archivedMatch && roleMatch && departmentMatch;
  });

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.loadingText}>Loading users...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>User Management</Text>
          <Text style={styles.subtitle}>Manage system users and permissions</Text>
        </View>
      </View>

      {/* Alerts */}
      {error && (
        <View style={styles.errorAlert}>
          <Text style={styles.alertIcon}>⚠️</Text>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
      {success && (
        <View style={styles.successAlert}>
          <Text style={styles.alertIcon}>✓</Text>
          <Text style={styles.successText}>{success}</Text>
        </View>
      )}

      {/* Action Bar */}
      <View style={styles.actionBar}>
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.primaryButton} onPress={() => handleOpenModal('create')}>
            <Text style={styles.buttonIcon}>+</Text>
            <Text style={styles.primaryButtonText}>Add User</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.toggleButton, showArchived && styles.toggleButtonActive]}
            onPress={() => setShowArchived(!showArchived)}
          >
            <Text style={[styles.toggleButtonText, showArchived && styles.toggleButtonActiveText]}>
              {showArchived ? '📦 Archived' : '✓ Active'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.filterToggleButton, showFilters && styles.filterToggleActive]} 
            onPress={() => setShowFilters(!showFilters)}
          >
            <Text style={styles.filterToggleText}>🔍 Filters</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.userCount}>
          <Text style={styles.countLabel}>Total:</Text>
          <Text style={styles.countNumber}>{filteredUsers.length}</Text>
        </View>
      </View>

      {/* Filters */}
      {showFilters && (
        <View style={styles.filtersContainer}>
          <View style={styles.filterGrid}>
            <View style={styles.filterItem}>
              <Text style={styles.filterLabel}>Role</Text>
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={filterRole}
                  onValueChange={(value) => setFilterRole(value)}
                  style={styles.picker}
                >
                  <Picker.Item label="All Roles" value="all" />
                  <Picker.Item label="User" value="user" />
                  <Picker.Item label="Admin" value="admin" />
                  <Picker.Item label="Super Admin" value="superadmin" />
                </Picker>
              </View>
            </View>

            <View style={styles.filterItem}>
              <Text style={styles.filterLabel}>Department</Text>
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={filterDepartment}
                  onValueChange={(value) => setFilterDepartment(value)}
                  style={styles.picker}
                >
                  <Picker.Item label="All Departments" value="all" />
                  <Picker.Item label="System" value="System" />
                  <Picker.Item label="OSA" value="OSA" />
                  <Picker.Item label="HR" value="HR" />
                  <Picker.Item label="Department Head" value="Department Head" />
                  <Picker.Item label="CIT" value="CIT" />
                  <Picker.Item label="Faculty" value="Faculty" />
                  <Picker.Item label="Staff" value="Staff" />
                  <Picker.Item label="Student" value="Student" />
                </Picker>
              </View>
            </View>
          </View>

          {(filterRole !== 'all' || filterDepartment !== 'all') && (
            <TouchableOpacity
              style={styles.clearFiltersButton}
              onPress={() => {
                setFilterRole('all');
                setFilterDepartment('all');
              }}
            >
              <Text style={styles.clearFiltersText}>✕ Clear Filters</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Professional Table */}
      <View style={styles.tableContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.horizontalScroll}
        >
          <View style={styles.table}>
            {/* Table Header */}
            <View style={styles.tableHeader}>
              <Text style={[styles.headerCell, styles.colName]}>NAME</Text>
              <Text style={[styles.headerCell, styles.colId]}>TUP ID</Text>
              <Text style={[styles.headerCell, styles.colEmail]}>EMAIL</Text>
              <Text style={[styles.headerCell, styles.colRole]}>ROLE</Text>
              <Text style={[styles.headerCell, styles.colDept]}>DEPARTMENT</Text>
              <Text style={[styles.headerCell, styles.colActions]}>ACTIONS</Text>
            </View>

            {/* Table Body */}
            <ScrollView
              style={styles.tableBody}
              refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
              {filteredUsers.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyIcon}>📭</Text>
                  <Text style={styles.emptyText}>No users found</Text>
                  <Text style={styles.emptySubtext}>Try adjusting your filters</Text>
                </View>
              ) : (
                filteredUsers.map((user, index) => {
                  const badgeColors = getRoleBadgeColor(user.role);
                  return (
                    <View 
                      key={user._id} 
                      style={[
                        styles.tableRow,
                        index % 2 === 0 && styles.tableRowEven,
                        user.isArchived && styles.rowArchived
                      ]}
                    >
                      <View style={[styles.tableCell, styles.colName]}>
                        <Text style={styles.cellTextBold}>
                          {user.firstName} {user.lastName}
                        </Text>
                      </View>
                      
                      <View style={[styles.tableCell, styles.colId]}>
                        <Text style={styles.cellText}>{user.tupId}</Text>
                      </View>
                      
                      <View style={[styles.tableCell, styles.colEmail]}>
                        <Text style={styles.cellTextSmall}>{user.email}</Text>
                      </View>
                      
                      <View style={[styles.tableCell, styles.colRole]}>
                        <View style={[
                          styles.badge, 
                          { 
                            backgroundColor: badgeColors.bg,
                            borderColor: badgeColors.border
                          }
                        ]}>
                          <Text style={[styles.badgeText, { color: badgeColors.text }]}>
                            {user.role}
                          </Text>
                        </View>
                      </View>
                      
                      <View style={[styles.tableCell, styles.colDept]}>
                        <Text style={styles.cellText}>{user.department || '—'}</Text>
                      </View>
                      
                      <View style={[styles.tableCell, styles.colActions]}>
                        {!user.isArchived ? (
                          <View style={styles.actionButtons}>
                            <TouchableOpacity
                              style={styles.editButton}
                              onPress={() => handleOpenModal('edit', user)}
                            >
                              <Text style={styles.editButtonText}>Edit</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={styles.archiveButton}
                              onPress={() => handleArchive(user._id)}
                            >
                              <Text style={styles.archiveButtonText}>Archive</Text>
                            </TouchableOpacity>
                          </View>
                        ) : (
                          <TouchableOpacity
                            style={styles.restoreButton}
                            onPress={() => handleUnarchive(user._id)}
                          >
                            <Text style={styles.restoreButtonText}>Restore</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                  );
                })
              )}
            </ScrollView>
          </View>
        </ScrollView>
      </View>

      {/* Modal */}
      <Modal
        visible={showModal}
        animationType="slide"
        transparent={true}
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {modalMode === 'create' ? 'Add New User' : 'Edit User'}
              </Text>
              <TouchableOpacity onPress={handleCloseModal} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.formRow}>
                <View style={styles.formField}>
                  <Text style={styles.label}>First Name *</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.firstName}
                    onChangeText={(value) => handleChange('firstName', value)}
                    placeholder="Enter first name"
                  />
                </View>
                <View style={styles.formField}>
                  <Text style={styles.label}>Last Name *</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.lastName}
                    onChangeText={(value) => handleChange('lastName', value)}
                    placeholder="Enter last name"
                  />
                </View>
              </View>

              <View style={styles.formField}>
                <Text style={styles.label}>TUP ID *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.tupId}
                  onChangeText={(value) => handleChange('tupId', value)}
                  placeholder="Enter TUP ID"
                />
              </View>

              <View style={styles.formField}>
                <Text style={styles.label}>Email *</Text>
                <TextInput
                  style={[styles.input, styles.inputDisabled]}
                  value={formData.email}
                  editable={false}
                />
              </View>

              <View style={styles.formRow}>
                <View style={styles.formField}>
                  <Text style={styles.label}>Role</Text>
                  <View style={styles.pickerWrapper}>
                    <Picker
                      selectedValue={formData.role}
                      onValueChange={(value) => handleChange('role', value)}
                      style={styles.picker}
                    >
                      <Picker.Item label="User" value="user" />
                      <Picker.Item label="Admin" value="admin" />
                      <Picker.Item label="Super Admin" value="superadmin" />
                    </Picker>
                  </View>
                </View>
                <View style={styles.formField}>
                  <Text style={styles.label}>Gender</Text>
                  <View style={styles.pickerWrapper}>
                    <Picker
                      selectedValue={formData.gender}
                      onValueChange={(value) => handleChange('gender', value)}
                      style={styles.picker}
                    >
                      <Picker.Item label="Select..." value="" />
                      <Picker.Item label="Male" value="Male" />
                      <Picker.Item label="Female" value="Female" />
                    </Picker>
                  </View>
                </View>
              </View>

              <View style={styles.formField}>
                <Text style={styles.label}>Department</Text>
                <View style={styles.pickerWrapper}>
                  <Picker
                    selectedValue={formData.department}
                    onValueChange={(value) => handleChange('department', value)}
                    style={styles.picker}
                  >
                    <Picker.Item label="Select department..." value="" />
                    <Picker.Item label="System" value="System" />
                    <Picker.Item label="OSA" value="OSA" />
                    <Picker.Item label="HR" value="HR" />
                    <Picker.Item label="Department Head" value="Department Head" />
                    <Picker.Item label="CIT" value="CIT" />
                    <Picker.Item label="Faculty" value="Faculty" />
                    <Picker.Item label="Staff" value="Staff" />
                    <Picker.Item label="Student" value="Student" />
                  </Picker>
                </View>
              </View>

              <View style={styles.formRow}>
                <View style={styles.formField}>
                  <Text style={styles.label}>Birthday</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.birthday}
                    onChangeText={(value) => handleChange('birthday', value)}
                    placeholder="YYYY-MM-DD"
                  />
                </View>
                <View style={styles.formField}>
                  <Text style={styles.label}>Age</Text>
                  <TextInput
                    style={[styles.input, styles.inputDisabled]}
                    value={formData.age}
                    editable={false}
                    placeholder="Auto-calculated"
                  />
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.cancelButton} onPress={handleCloseModal}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                <Text style={styles.submitButtonText}>
                  {modalMode === 'create' ? 'Create User' : 'Save Changes'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
    color: '#64748b',
    fontWeight: '500',
  },
  
  // Header
  header: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0f172a',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
    fontWeight: '400',
  },
  
  // Alerts
  errorAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 16,
    padding: 14,
    backgroundColor: '#fef2f2',
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#ef4444',
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  successAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 16,
    padding: 14,
    backgroundColor: '#f0fdf4',
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#22c55e',
    shadowColor: '#22c55e',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  alertIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  errorText: {
    flex: 1,
    color: '#dc2626',
    fontSize: 14,
    fontWeight: '500',
  },
  successText: {
    flex: 1,
    color: '#16a34a',
    fontSize: 14,
    fontWeight: '500',
  },
  
  // Action Bar
  actionBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563eb',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonIcon: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    marginRight: 6,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  toggleButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  toggleButtonActive: {
    backgroundColor: '#1e293b',
    borderColor: '#1e293b',
  },
  toggleButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
  },
  toggleButtonActiveText: {
    color: '#ffffff',
  },
  filterToggleButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  filterToggleActive: {
    backgroundColor: '#eff6ff',
    borderColor: '#3b82f6',
  },
  filterToggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
  },
  userCount: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  countLabel: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '500',
    marginRight: 6,
  },
  countNumber: {
    fontSize: 16,
    color: '#0f172a',
    fontWeight: '700',
  },
  
  // Filters
  filtersContainer: {
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    marginTop: 12,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  filterGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  filterItem: {
    flex: 1,
  },
  filterLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  pickerWrapper: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
  },
  picker: {
    height: 48,
    color: '#0f172a',
  },
  clearFiltersButton: {
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#fee2e2',
    alignItems: 'center',
  },
  clearFiltersText: {
    color: '#dc2626',
    fontSize: 13,
    fontWeight: '600',
  },
  
  // Table
  tableContainer: {
    flex: 1,
    marginTop: 16,
    marginHorizontal: 20,
    marginBottom: 50,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  horizontalScroll: {
    flex: 1,
  },
  table: {
    minWidth: 1000,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f8fafc',
    borderBottomWidth: 2,
    borderBottomColor: '#e2e8f0',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  headerCell: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
    letterSpacing: 0.5,
  },
  tableBody: {
    flex: 1,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    alignItems: 'center',
  },
  tableRowEven: {
    backgroundColor: '#fafbfc',
  },
  rowArchived: {
    backgroundColor: '#f8f9fa',
    opacity: 0.7,
  },
  tableCell: {
    justifyContent: 'center',
  },
  
  // Column widths
  colName: {
    width: 180,
  },
  colId: {
    width: 120,
  },
  colEmail: {
    width: 220,
  },
  colRole: {
    width: 140,
  },
  colDept: {
    width: 160,
  },
  colActions: {
    width: 180,
  },
  
  // Cell text styles
  cellTextBold: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
  },
  cellText: {
    fontSize: 14,
    color: '#475569',
  },
  cellTextSmall: {
    fontSize: 13,
    color: '#64748b',
  },
  
  // Badge
  badge: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  
  // Action buttons in table
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  editButton: {
    backgroundColor: '#f59e0b',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 6,
    shadowColor: '#f59e0b',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  editButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
  },
  archiveButton: {
    backgroundColor: '#ef4444',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 6,
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  archiveButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
  },
  restoreButton: {
    backgroundColor: '#10b981',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 6,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  restoreButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
  },
  
  // Empty state
  emptyState: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#94a3b8',
  },
  
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '85%',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
  },
  closeButton: {
    padding: 4,
  },
  closeButtonText: {
    fontSize: 24,
    color: '#64748b',
    fontWeight: '300',
  },
  modalBody: {
    padding: 24,
  },
  formRow: {
    flexDirection: 'row',
    gap: 12,
  },
  formField: {
    flex: 1,
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#0f172a',
  },
  inputDisabled: {
    backgroundColor: '#f1f5f9',
    color: '#94a3b8',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  cancelButtonText: {
    color: '#475569',
    fontSize: 14,
    fontWeight: '600',
  },
  submitButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: '#2563eb',
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
});