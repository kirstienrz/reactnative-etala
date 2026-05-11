import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const getNotifications = async () => {
  const token = localStorage.getItem('token');
  const res = await axios.get(`${API_URL}/notifications`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data.data;
};

export const markAsRead = async (id) => {
  const token = localStorage.getItem('token');
  const res = await axios.patch(`${API_URL}/notifications/${id}/read`, {}, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data.data;
};

export const markAllRead = async () => {
  const token = localStorage.getItem('token');
  const res = await axios.post(`${API_URL}/notifications/mark-all-read`, {}, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};
