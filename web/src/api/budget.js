import API from "./config";

export const getAllBudgets = async () => {
  const res = await API.get("/budgets");
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

export const deleteBudget = async (id) => {
  const res = await API.delete(`/budgets/${id}`);
  return res.data;
};
