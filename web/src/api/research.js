import API from "./config"; // axios instance with baseURL & headers

// ========================================
// 📚 RESEARCH MANAGEMENT ROUTES
// ========================================

// 📋 GET all research with optional filters
export const getAllResearch = async (params = {}) => {
  const queryParams = new URLSearchParams();
  
  // Add all params to query string
  Object.keys(params).forEach(key => {
    if (params[key] !== undefined && params[key] !== '') {
      queryParams.append(key, params[key]);
    }
  });
  
  const queryString = queryParams.toString();
  const url = `/research${queryString ? `?${queryString}` : ''}`;
  
  const res = await API.get(url);
  return res.data;
};

// 📊 GET research statistics
export const getResearchStats = async () => {
  const res = await API.get("/research/stats");
  return res.data;
};

// 🔍 GET single research by ID
export const getResearchById = async (id) => {
  const res = await API.get(`/research/${id}`);
  return res.data;
};

// 📤 CREATE new research (with file upload)
export const createResearch = async (formData) => {
  const res = await API.post("/research", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

// ✏️ UPDATE research by ID (with optional file upload)
export const updateResearch = async (id, formData) => {
  const res = await API.put(`/research/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

// 🗃️ ARCHIVE a research item (soft delete)
export const archiveResearch = async (id) => {
  const res = await API.patch(`/research/${id}/archive`);
  return res.data;
};

// 🔄 RESTORE an archived research item
export const restoreResearch = async (id) => {
  const res = await API.patch(`/research/${id}/restore`);
  return res.data;
};

// 🗑️ DELETE research permanently
export const deleteResearch = async (id) => {
  const res = await API.delete(`/research/${id}`);
  return res.data;
};

// ========================================
// 🔢 BULK OPERATIONS
// ========================================

// 🗃️ BULK archive multiple research items
export const bulkArchiveResearch = async (ids) => {
  const res = await API.post("/research/bulk/archive", { ids });
  return res.data;
};

// 🔄 BULK restore multiple research items
export const bulkRestoreResearch = async (ids) => {
  const res = await API.post("/research/bulk/restore", { ids });
  return res.data;
};

// 🗑️ BULK delete multiple research items
export const bulkDeleteResearch = async (ids) => {
  const res = await API.post("/research/bulk/delete", { ids });
  return res.data;
};

// ========================================
// 🔧 HELPER FUNCTIONS
// ========================================

// 📁 Prepare form data for research creation/update
// 📁 Prepare form data for research creation/update
export const prepareResearchFormData = (researchData, thumbnailFile = null, researchFile = null) => {
  const formData = new FormData();
  
  // Add text fields
  formData.append('title', researchData.title);
  formData.append('authors', researchData.authors);
  formData.append('year', researchData.year);
  formData.append('abstract', researchData.abstract);
  formData.append('status', researchData.status || 'active');
  
  // Optional fields
  if (researchData.tags) {
    formData.append('tags', researchData.tags);
  }
  
  if (researchData.link) {
    formData.append('link', researchData.link);
  }
  
  // Add files if provided
  if (thumbnailFile) {
    // Ensure it's an image file
    if (!thumbnailFile.type.startsWith('image/')) {
      throw new Error('Thumbnail must be an image file (JPG, PNG, WebP, GIF)');
    }
    formData.append('thumbnail', thumbnailFile);
  }
  
  if (researchFile) {
    // Ensure it's a document file
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (!allowedTypes.includes(researchFile.type)) {
      throw new Error('Research file must be PDF, DOC, or DOCX');
    }
    formData.append('researchFile', researchFile);
  }
  
  return formData;
};

// 🎯 Default research filters
export const defaultResearchFilters = {
  status: 'active',
  year: 'All Years',
  search: '',
  page: 1,
  limit: 10,
  sortBy: 'newest'
};

// 🔍 Search research with filters
export const searchResearch = async (filters = {}) => {
  const mergedFilters = { ...defaultResearchFilters, ...filters };
  return getAllResearch(mergedFilters);
};

// 📊 Get years for filter dropdown
export const getAvailableYears = async () => {
  try {
    const stats = await getResearchStats();
    const years = stats.data.byYear.map(item => item._id);
    return ['All Years', ...years];
  } catch (error) {
    console.error('Error fetching years:', error);
    return ['All Years', '2024', '2023', '2022'];
  }
};

// 📈 Get research statistics summary
export const getResearchSummary = async () => {
  try {
    const stats = await getResearchStats();
    return {
      total: stats.data.total,
      active: stats.data.active,
      archived: stats.data.archived,
      withLinks: stats.data.withLinks
    };
  } catch (error) {
    console.error('Error fetching summary:', error);
    return { total: 0, active: 0, archived: 0, withLinks: 0 };
  }
};