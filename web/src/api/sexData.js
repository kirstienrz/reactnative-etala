import API from "./config";

// INSPECT EXCEL — get sheet names + previews before committing to DB
export const inspectExcelSheets = async (formData) => {
  const res = await API.post("/datasets/inspect", formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });
  return res.data;
};

// DOWNLOAD TEMPLATE
export const downloadDatasetTemplate = () => {
  window.open(`${API.defaults.baseURL}/datasets/template`, '_blank');
};

// CREATE MANUAL DATASET — from form input (no Excel file)
export const createManualDataset = async (data) => {
  const res = await API.post("/datasets/manual", data);
  return res.data;
};

// UPLOAD (with optional sheetName in formData)
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

// UPDATE DATASET
export const updateSexDataset = async (id, data) => {
  const res = await API.put(`/datasets/${id}`, data);
  return res.data;
};