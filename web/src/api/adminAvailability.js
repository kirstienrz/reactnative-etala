import API from "./config";

export const getAdminAvailability = async (adminId, date) => {
  const res = await API.get(`/admin-availability/${adminId}?date=${date}`);
  return res.data;
};

export const setAdminAvailabilityBulk = async (adminId, days, slotDuration, slotConfig) => {
  const res = await API.post(`/admin-availability/${adminId}/bulk`, { days, slotDuration, slotConfig });
  return res.data;
};

export const saveAdminSlotConfig = async (adminId, slotConfig) => {
  const res = await API.put(`/admin-availability/${adminId}/config`, { slotConfig });
  return res.data;
};

export const getPublicAvailability = async (date) => {
  const res = await API.get(`/admin-availability/public/available`, { params: { date } });
  return res.data;
};
