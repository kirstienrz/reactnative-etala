// api/calendar.js
import API from "./config";

// Get current user from localStorage or context
const getCurrentUser = () => {
  try {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      return JSON.parse(userStr);
    }
  } catch (error) {
    console.error("Error getting user from localStorage:", error);
  }
  return null;
};

// Get all calendar events
export const getAllCalendarEvents = async (filters = {}) => {
  const params = new URLSearchParams();
  
  if (filters.startDate) params.append('startDate', filters.startDate);
  if (filters.endDate) params.append('endDate', filters.endDate);
  if (filters.type) params.append('type', filters.type);
  
  try {
    const res = await API.get(`/calendar/events?${params.toString()}`);
    
    console.log("📅 API Events Response:", {
      count: res.data.count,
      dataLength: res.data.data?.length,
      firstEvent: res.data.data?.[0]
    });
    
    return {
      success: true,
      data: res.data.data || [],
      count: res.data.count || 0,
      message: res.data.message || "Events fetched successfully"
    };
  } catch (error) {
    console.error("API Error fetching events:", {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    return {
      success: false,
      data: [],
      count: 0,
      message: error.response?.data?.message || "Failed to fetch events"
    };
  }
};

// Create calendar event
export const createCalendarEvent = async (eventData) => {
  try {
    // Get current user for userId
    const currentUser = getCurrentUser();
    
    // Prepare the data to send
    const dataToSend = {
      ...eventData,
      userId: currentUser?._id || currentUser?.id || null
    };
    
    console.log("📤 Creating calendar event:", {
      data: dataToSend,
      user: currentUser
    });
    
    const res = await API.post("/calendar/events", dataToSend);
    
    console.log("✅ Event created successfully:", res.data);
    
    return {
      success: true,
      data: res.data.data,
      message: res.data.message || "Event created successfully"
    };
  } catch (error) {
    console.error("❌ API Error creating event:", {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
      validationErrors: error.response?.data?.errors
    });
    
    return {
      success: false,
      data: null,
      message: error.response?.data?.message || "Failed to create event",
      errors: error.response?.data?.errors || []
    };
  }
};

// Update calendar event
export const updateCalendarEvent = async (id, eventData) => {
  try {
    console.log("🔄 Updating event:", { id, eventData });
    
    const res = await API.put(`/calendar/events/${id}`, eventData);
    
    return {
      success: true,
      data: res.data.data,
      message: res.data.message || "Event updated successfully"
    };
  } catch (error) {
    console.error("API Error updating event:", error);
    return {
      success: false,
      data: null,
      message: error.response?.data?.message || "Failed to update event"
    };
  }
};

// Delete calendar event
export const deleteCalendarEvent = async (id) => {
  try {
    const res = await API.delete(`/calendar/events/${id}`);
    return {
      success: true,
      data: res.data.data,
      message: res.data.message || "Event deleted successfully"
    };
  } catch (error) {
    console.error("API Error deleting event:", error);
    return {
      success: false,
      data: null,
      message: error.response?.data?.message || "Failed to delete event"
    };
  }
};

// Get event types
export const getEventTypes = () => {
  return [
    { value: "consultation", label: "Consultation", color: "#8b5cf6" },
    { value: "holiday", label: "Holiday", color: "#ef4444" },
    { value: "not_available", label: "Not Available", color: "#6b7280" },
    { value: "program_event", label: "Program Event", color: "#3b82f6" }
  ];
};