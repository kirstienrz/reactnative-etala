import API from "./config";

// ============================
// 💰 FINANCE MANAGEMENT ROUTES
// ============================

// 📋 GET summary per month
export const getFinanceSummary = async (month) => {
  const res = await API.get(`/finance/summary?month=${month}`);
  return res.data;
};

// 💼 CREATE budget
export const createBudget = async (data) => {
  const res = await API.post("/finance/budget", data);
  return res.data;
};

// 🧾 CREATE expense
export const createExpense = async (data) => {
  const res = await API.post("/finance/expense", data);
  return res.data;
};

export const deleteExpense = async (expenseId) => {
  const res = await API.delete(`/finance/expense/${expenseId}`);
  return res.data;
}

export const updateExpense = async (expenseId, data) => {
  const res = await API.put(`/finance/expense/${expenseId}`, data);
  return res.data;
};

// 💼 UPDATE budget
export const updateBudget = async (budgetId, data) => {
  const res = await API.put(`/finance/budget/${budgetId}`, data);
  return res.data;
};

// 💼 DELETE budget
export const deleteBudget = async (budgetId) => {
  const res = await API.delete(`/finance/budget/${budgetId}`);
  return res.data;
};