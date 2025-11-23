import API from './config'; // Axios instance with baseURL & headers

// ✅ Get all active infographics
export const getInfographics = async () => {
  try {
    const res = await API.get('/infographics?status=active');
    return res.data;
  } catch (error) {
    console.error('Failed to fetch infographics:', error);
    return [];
  }
};
