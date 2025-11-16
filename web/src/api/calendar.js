import API from "./config";

// Get all calendar events (combines program events + holidays + consultations)
export const getAllCalendarEvents = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.startDate) params.append('startDate', filters.startDate);
  if (filters.endDate) params.append('endDate', filters.endDate);
  if (filters.type) params.append('type', filters.type);
  
  const res = await API.get(`/calendar/events?${params.toString()}`);
  return res.data;
};

// Create calendar event (holiday, consultation, not available)
export const createCalendarEvent = async (eventData) => {
  const res = await API.post("/calendar/events", eventData);
  return res.data;
};

// Update calendar event
export const updateCalendarEvent = async (id, eventData) => {
  const res = await API.put(`/calendar/events/${id}`, eventData);
  return res.data;
};

// Delete calendar event
export const deleteCalendarEvent = async (id) => {
  const res = await API.delete(`/calendar/events/${id}`);
  return res.data;
};