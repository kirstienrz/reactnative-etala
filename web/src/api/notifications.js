import API from './config';

export const getNotifications = async () => {
  const res = await API.get('/notifications');
  return res.data.data;
};

export const markAsRead = async (id) => {
  const res = await API.patch(`/notifications/${id}/read`, {});
  return res.data.data;
};

export const markAllRead = async () => {
  const res = await API.post('/notifications/mark-all-read', {});
  return res.data;
};
