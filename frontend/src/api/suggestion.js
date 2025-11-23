import API from "./config"; // your axios instance

export const getSuggestions = async () => {
  const res = await API.get("/suggestions"); // Changed from /gad-suggestions
  return res.data;
};

export const createSuggestion = async (data) => {
  const res = await API.post("/suggestions", data); // Changed from /gad-suggestions
  return res.data;
};

export const updateSuggestion = async (id, data) => {
  const res = await API.put(`/suggestions/${id}`, data); // Changed from /gad-suggestions
  return res.data;
};

export const deleteSuggestion = async (id) => {
  const res = await API.delete(`/suggestions/${id}`); // Changed from /gad-suggestions
  return res.data;
};

export const toggleArchive = async (id) => {
  const res = await API.patch(`/suggestions/${id}/archive`); // Changed from /gad-suggestions
  return res.data;
};