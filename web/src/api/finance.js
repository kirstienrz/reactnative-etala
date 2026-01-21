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
