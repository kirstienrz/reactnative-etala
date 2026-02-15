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
      firstEvent: res.data.data?.[0],
      hasAttachments: res.data.data?.some(e => e.attachments && e.attachments.length > 0)
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
    const currentUser = getCurrentUser();

    // If eventData is FormData, append userId if not present
    let dataToSend = eventData;
    if (eventData instanceof FormData) {
      if (!eventData.has('userId')) {
        eventData.append('userId', currentUser?._id || currentUser?.id || '');
      }
      // Debug: log all FormData keys/values
      console.log('📤 Creating calendar event (FormData):');
      for (let pair of eventData.entries()) {
        if (pair[1] instanceof File) {
          console.log(`  ${pair[0]}: [File] ${pair[1].name} (${pair[1].size} bytes)`);
        } else {
          console.log(`  ${pair[0]}:`, pair[1]);
        }
      }
    } else {
      // Fallback for object payloads (should not be used for file uploads)
      dataToSend = {
        ...eventData,
        userId: eventData.userId || currentUser?._id || currentUser?.id || null
      };
      console.log('📤 Creating calendar event (object):', dataToSend);
    }

    const res = await API.post("/calendar/events", dataToSend, {
      headers: dataToSend instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : undefined
    });

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
    // Check if eventData is FormData (for file uploads)
    let dataToSend = eventData;
    
    if (eventData instanceof FormData) {
      // Debug: log all FormData keys/values
      console.log('🔄 Updating event with FormData:', { id });
      for (let pair of eventData.entries()) {
        if (pair[1] instanceof File) {
          console.log(`  ${pair[0]}: [File] ${pair[1].name} (${pair[1].size} bytes)`);
        } else {
          console.log(`  ${pair[0]}:`, pair[1]);
        }
      }
      
      // Use PUT with FormData
      const res = await API.put(`/calendar/events/${id}`, dataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      console.log("✅ Event updated successfully (with files):", res.data);
      
      return {
        success: true,
        data: res.data.data,
        message: res.data.message || "Event updated successfully"
      };
    } else {
      // Regular object payload (no files)
      console.log("🔄 Updating event (object):", { id, eventData });
      
      const res = await API.put(`/calendar/events/${id}`, dataToSend);
      
      console.log("✅ Event updated successfully:", res.data);
      
      return {
        success: true,
        data: res.data.data,
        message: res.data.message || "Event updated successfully"
      };
    }
  } catch (error) {
    console.error("❌ API Error updating event:", {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
      validationErrors: error.response?.data?.errors
    });
    
    return {
      success: false,
      data: null,
      message: error.response?.data?.message || "Failed to update event",
      errors: error.response?.data?.errors || []
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

// Get a single event by ID
export const getCalendarEventById = async (id) => {
  try {
    const res = await API.get(`/calendar/events/${id}`);
    
    console.log("📄 Fetched event:", res.data);
    
    return {
      success: true,
      data: res.data.data,
      message: res.data.message || "Event fetched successfully"
    };
  } catch (error) {
    console.error("API Error fetching event:", error);
    return {
      success: false,
      data: null,
      message: error.response?.data?.message || "Failed to fetch event"
    };
  }
};

// Verify booking access with ticket number
export const verifyBookingAccess = async (token, uid, ticket) => {
  try {
    const res = await API.get('/calendar/verify-booking-access', {
      params: { token, uid, ticket }
    });
    
    console.log("✅ Booking access verified:", res.data);
    
    return {
      success: true,
      user: res.data.user,
      ticketNumber: res.data.ticketNumber,
      expiresAt: res.data.expiresAt,
      message: res.data.message || 'Access granted'
    };
  } catch (error) {
    console.error("❌ Booking verification failed:", {
      status: error.response?.status,
      data: error.response?.data
    });
    
    const errorResponse = {
      success: false,
      message: error.response?.data?.message || 'Failed to verify booking access',
      expired: error.response?.data?.expired || false,
      alreadyBooked: error.response?.data?.alreadyBooked || false
    };
    
    throw errorResponse;
  }
};

export const getEventTypes = () => {
  return [
    { value: "consultation", label: "Consultation", color: "#8b5cf6" },
    { value: "holiday", label: "Holiday", color: "#ef4444" },
    { value: "not_available", label: "Not Available", color: "#6b7280" },
    { value: "program_event", label: "Program Event", color: "#3b82f6" }
  ];
};

export const sendBookingLinkEmail = async (data) => {
  try {
    const res = await API.post('/calendar/send-booking-link', data);
    
    console.log("✅ Booking link sent:", res.data);
    
    return {
      success: true,
      message: res.data.message || 'Booking link sent successfully',
      expiresAt: res.data.expiresAt
    };
  } catch (error) {
    console.error("❌ Failed to send booking link:", error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to send booking link'
    };
  }
};

// Delete a specific attachment from an event
export const deleteEventAttachment = async (eventId, attachmentId) => {
  try {
    const res = await API.delete(`/calendar/events/${eventId}/attachments/${attachmentId}`);
    
    console.log("✅ Attachment deleted:", res.data);
    
    return {
      success: true,
      data: res.data.data,
      message: res.data.message || "Attachment deleted successfully"
    };
  } catch (error) {
    console.error("❌ Failed to delete attachment:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Failed to delete attachment"
    };
  }
};

// Get all consultations for a specific user
export const getUserConsultations = async (userId) => {
  const params = new URLSearchParams();
  if (userId) params.append('userId', userId);
  params.append('type', 'consultation');

  try {
    const res = await API.get(`/calendar/events?${params.toString()}`);
    return {
      success: true,
      data: res.data.data || [],
      count: res.data.count || 0,
      message: res.data.message || "Consultations fetched successfully"
    };
  } catch (error) {
    console.error("API Error fetching user consultations:", {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    return {
      success: false,
      data: [],
      count: 0,
      message: error.response?.data?.message || "Failed to fetch consultations"
    };
  }
};