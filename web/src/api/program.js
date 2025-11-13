import API from "./config";

// Program API calls
export const getPrograms = async () => {
  try {
    const response = await API.get('/programs');
    return response.data;
  } catch (error) {
    console.error('Error fetching programs:', error);
    throw error;
  }
};

export const getArchivedPrograms = async () => {
  try {
    const response = await API.get('/programs/archived');
    return response.data;
  } catch (error) {
    console.error('Error fetching archived programs:', error);
    throw error;
  }
};

export const getProgramStats = async () => {
  try {
    const response = await API.get('/programs/stats');
    return response.data;
  } catch (error) {
    console.error('Error fetching program stats:', error);
    throw error;
  }
};

export const createProgram = async (programData) => {
  try {
    const response = await API.post('/programs', programData);
    return response.data;
  } catch (error) {
    console.error('Error creating program:', error);
    throw error;
  }
};

export const updateProgram = async (id, programData) => {
  try {
    console.log('Updating program:', { id, programData });
    const response = await API.put(`/programs/${id}`, programData);
    return response.data;
  } catch (error) {
    console.error('Error updating program:', error);
    throw error;
  }
};

export const archiveProgram = async (id) => {
  try {
    console.log('Archiving program:', id);
    const response = await API.patch(`/programs/${id}/archive`);
    return response.data;
  } catch (error) {
    console.error('Error archiving program:', error);
    throw error;
  }
};

export const restoreProgram = async (id) => {
  try {
    console.log('Restoring program:', id);
    const response = await API.patch(`/programs/${id}/restore`);
    return response.data;
  } catch (error) {
    console.error('Error restoring program:', error);
    throw error;
  }
};

export const updateProgramStatus = async (id, status) => {
  try {
    console.log('Updating program status:', { id, status });
    const response = await API.patch(`/programs/${id}/status`, { status });
    return response.data;
  } catch (error) {
    console.error('Error updating program status:', error);
    throw error;
  }
};

export const deleteProgram = async (id) => {
  try {
    console.log('Deleting program:', id);
    const response = await API.delete(`/programs/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting program:', error);
    throw error;
  }
};

// Project API calls
export const addProject = async (programId, projectData) => {
  try {
    console.log('Adding project:', { programId, projectData });
    const response = await API.post(`/programs/${programId}/projects`, projectData);
    return response.data;
  } catch (error) {
    console.error('Error adding project:', error);
    throw error;
  }
};

export const updateProject = async (programId, projectId, projectData) => {
  try {
    console.log('Updating project:', { programId, projectId, projectData });
    const response = await API.put(`/programs/${programId}/projects/${projectId}`, projectData);
    return response.data;
  } catch (error) {
    console.error('Error updating project:', error);
    throw error;
  }
};

export const archiveProject = async (programId, projectId) => {
  try {
    console.log('Archiving project:', { programId, projectId });
    const response = await API.patch(`/programs/${programId}/projects/${projectId}/archive`);
    return response.data;
  } catch (error) {
    console.error('Error archiving project:', error);
    throw error;
  }
};

export const restoreProject = async (programId, projectId) => {
  try {
    console.log('Restoring project:', { programId, projectId });
    const response = await API.patch(`/programs/${programId}/projects/${projectId}/restore`);
    return response.data;
  } catch (error) {
    console.error('Error restoring project:', error);
    throw error;
  }
};

// Event API calls
export const addEvent = async (programId, projectId, eventData) => {
  try {
    console.log('Adding event:', { programId, projectId, eventData });
    const response = await API.post(`/programs/${programId}/projects/${projectId}/events`, eventData);
    return response.data;
  } catch (error) {
    console.error('Error adding event:', error);
    throw error;
  }
};

export const updateEvent = async (programId, projectId, eventId, eventData) => {
  try {
    console.log('Updating event:', { programId, projectId, eventId, eventData });
    const response = await API.put(`/programs/${programId}/projects/${projectId}/events/${eventId}`, eventData);
    return response.data;
  } catch (error) {
    console.error('Error updating event:', error);
    throw error;
  }
};

export const archiveEvent = async (programId, projectId, eventId) => {
  try {
    console.log('Archiving event:', { programId, projectId, eventId });
    const response = await API.patch(`/programs/${programId}/projects/${projectId}/events/${eventId}/archive`);
    return response.data;
  } catch (error) {
    console.error('Error archiving event:', error);
    throw error;
  }
};

export const restoreEvent = async (programId, projectId, eventId) => {
  try {
    console.log('Restoring event:', { programId, projectId, eventId });
    const response = await API.patch(`/programs/${programId}/projects/${projectId}/events/${eventId}/restore`);
    return response.data;
  } catch (error) {
    console.error('Error restoring event:', error);
    throw error;
  }
};

// Utility functions for filtering
export const getProgramsByYear = async (year) => {
  try {
    const response = await API.get(`/programs?year=${year}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching programs by year:', error);
    throw error;
  }
};

export const getProgramsByStatus = async (status) => {
  try {
    const response = await API.get(`/programs?status=${status}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching programs by status:', error);
    throw error;
  }
};

// Bulk operations
export const bulkArchivePrograms = async (programIds) => {
  try {
    const archivePromises = programIds.map(id => archiveProgram(id));
    const results = await Promise.allSettled(archivePromises);
    return results;
  } catch (error) {
    console.error('Error in bulk archive:', error);
    throw error;
  }
};

export const bulkRestorePrograms = async (programIds) => {
  try {
    const restorePromises = programIds.map(id => restoreProgram(id));
    const results = await Promise.allSettled(restorePromises);
    return results;
  } catch (error) {
    console.error('Error in bulk restore:', error);
    throw error;
  }
};