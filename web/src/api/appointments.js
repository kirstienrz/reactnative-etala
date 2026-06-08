import API from "./config";

export const bookAppointment = (data) => API.post("/appointments/book", data);

export const getAdminAppointments = (adminId) => {
  const url = adminId ? `/appointments/admin-list/${adminId}` : "/appointments/admin-list";
  return API.get(url);
};

export const getUserAppointments = () => API.get("/appointments/user-list");

export const approveAppointment = (id) => API.patch(`/appointments/approve/${id}`);

export const cancelAppointment = (id, data) => API.patch(`/appointments/cancel/${id}`, data);

export const rescheduleAppointment = (id, data) => API.patch(`/appointments/reschedule/${id}`, data);

export const completeAppointment = (id, data) => API.patch(`/appointments/complete/${id}`, data);

export const checkExistingBooking = () => API.get("/appointments/check-existing");

// User-specific actions
export const userCancelAppointment = (id, data) => API.patch(`/appointments/user-cancel/${id}`, data);

export const userRescheduleAppointment = (id, data) => API.patch(`/appointments/user-reschedule/${id}`, data);

// Accept admin-rescheduled appointment (user action)
export const acceptRescheduledAppointment = (id) => API.patch(`/appointments/accept-reschedule/${id}`);

// Request another time when admin rescheduled (user action) — triggers new booking email
export const requestAnotherTime = (id) => API.patch(`/appointments/request-another-time/${id}`);