import API from "./config"; // ✅ your axios instance

// ✅ Get all non-archived projects
export const getProjects = async () => {
  const res = await API.get("/projects");
  return res.data;
};

// ✅ Get archived projects
export const getArchivedProjects = async () => {
  const res = await API.get("/projects/archived");
  return res.data;
};

// ✅ Upload a new project with image (Cloudinary)
export const uploadProject = async (formData) => {
  const res = await API.post("/projects/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

// ✅ Archive (soft delete)
export const archiveProject = async (id) => {
  const res = await API.patch(`/projects/${id}/archive`);
  return res.data;
};

// ✅ Restore archived project
export const restoreProject = async (id) => {
  const res = await API.patch(`/projects/${id}/restore`);
  return res.data;
};
