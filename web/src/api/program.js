import API from "./config"; // axios instance with baseURL & headers

// ========================================
// 📊 PROGRAMS MANAGEMENT ROUTES
// ========================================

// 📋 GET all programs (with optional filters)
export const getAllPrograms = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.year) params.append('year', filters.year);
  if (filters.status) params.append('status', filters.status);
  if (filters.search) params.append('search', filters.search);
  if (filters.includeArchived) params.append('includeArchived', 'true');
  
  const res = await API.get(`/programs?${params.toString()}`);
  return res.data;
};

// 📄 GET single program by ID
export const getProgram = async (id) => {
  const res = await API.get(`/programs/${id}`);
  return res.data;
};

// ➕ CREATE new program
export const createProgram = async (programData) => {
  const res = await API.post("/programs", programData);
  return res.data;
};

// ✏️ UPDATE program
export const updateProgram = async (id, programData) => {
  const res = await API.put(`/programs/${id}`, programData);
  return res.data;
};

// 🗑️ DELETE program
export const deleteProgram = async (id) => {
  const res = await API.delete(`/programs/${id}`);
  return res.data;
};

// 🗃️ ARCHIVE/UNARCHIVE program
export const toggleArchiveProgram = async (id) => {
  const res = await API.patch(`/programs/${id}/archive`);
  return res.data;
};

// ========================================
// 🎯 PROJECT MANAGEMENT ROUTES
// ========================================

// ➕ ADD project to program
export const addProject = async (programId, projectData) => {
  const res = await API.post(`/programs/${programId}/projects`, projectData);
  return res.data;
};

// ✏️ UPDATE project
export const updateProject = async (programId, projectId, projectData) => {
  const res = await API.put(`/programs/${programId}/projects/${projectId}`, projectData);
  return res.data;
};

// 🗑️ DELETE project
export const deleteProject = async (programId, projectId) => {
  const res = await API.delete(`/programs/${programId}/projects/${projectId}`);
  return res.data;
};

// 🗃️ ARCHIVE/UNARCHIVE project
export const toggleArchiveProject = async (programId, projectId) => {
  const res = await API.patch(`/programs/${programId}/projects/${projectId}/archive`);
  return res.data;
};

// ========================================
// 📅 EVENT MANAGEMENT ROUTES
// ========================================

// ➕ ADD event to project
export const addEvent = async (programId, projectId, eventData) => {
  const res = await API.post(`/programs/${programId}/projects/${projectId}/events`, eventData);
  return res.data;
};

// ✏️ UPDATE event
export const updateEvent = async (programId, projectId, eventId, eventData) => {
  const res = await API.put(`/programs/${programId}/projects/${projectId}/events/${eventId}`, eventData);
  return res.data;
};

// 🗑️ DELETE event
export const deleteEvent = async (programId, projectId, eventId) => {
  const res = await API.delete(`/programs/${programId}/projects/${projectId}/events/${eventId}`);
  return res.data;
};

// 🗃️ ARCHIVE/UNARCHIVE event
export const toggleArchiveEvent = async (programId, projectId, eventId) => {
  const res = await API.patch(`/programs/${programId}/projects/${projectId}/events/${eventId}/archive`);
  return res.data;
};