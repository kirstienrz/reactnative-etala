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
