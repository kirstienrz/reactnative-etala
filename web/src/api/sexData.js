import API from "./config";

// UPLOAD
export const uploadSexDataExcel = async (formData) => {
  const res = await API.post("/datasets/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });
  return res.data;
};

// GET ALL
export const getSexDatasets = async () => {
  const res = await API.get("/datasets");
  return res.data;
};

// GET ONE
export const getSexDatasetById = async (id) => {
  const res = await API.get(`/datasets/${id}`);
  return res.data;
};

// DELETE
export const deleteSexDataset = async (id) => {
  const res = await API.delete(`/datasets/${id}`);
  return res.data;
};

// In your ../../api/sexData.js file, add these functions:

export const archiveSexDataset = async (id) => {
  const res = await API.put(`/datasets/${id}/archive`);
  return res.data;
};

// RESTORE DATASET
export const restoreSexDataset = async (id) => {
  const res = await API.put(`/datasets/${id}/restore`);
  return res.data;
};

// GET ARCHIVED DATASETS
export const getArchivedSexDatasets = async () => {
  const res = await API.get("/datasets/archived");
  return res.data;
};

// You might need to update your backend routes to handle these endpoints:
// PUT /api/sex-data/:id/archive - Archive a dataset
// PUT /api/sex-data/:id/restore - Restore a dataset
// GET /api/sex-data/archived - Get archived datasets