import API from "./config";

export const getAllBudgets = async () => {
  const res = await API.get("/budgets");
  return res.data;
};

// NEW: Get active (non-archived) budgets
export const getActiveBudgets = async () => {
  const res = await API.get("/budgets/active");
  return res.data;
};

// NEW: Get archived budgets
export const getArchivedBudgets = async () => {
  const res = await API.get("/budgets/archived");
  return res.data;
};

export const getBudgetById = async (id) => {
  const res = await API.get(`/budgets/${id}`);
  return res.data;
};

export const uploadBudget = async (formData) => {
  const res = await API.post("/budgets", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const updateBudget = async (id, data) => {
  const res = await API.put(`/budgets/${id}`, data);
  return res.data;
};

// NEW: Archive budget
export const archiveBudget = async (id) => {
  const res = await API.patch(`/budgets/${id}/archive`);
  return res.data;
};

// NEW: Unarchive budget
export const unarchiveBudget = async (id) => {
  const res = await API.patch(`/budgets/${id}/unarchive`);
  return res.data;
};

export const deleteBudget = async (id) => {
  const res = await API.delete(`/budgets/${id}`);
  return res.data;
};