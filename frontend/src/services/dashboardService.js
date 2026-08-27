import api from '../api/axiosConfig';

export const dashboardService = {
  getDashboardData: async () => {
    const response = await api.get('/api/admin/dashboard');
    return response.data;
  },

  getReadingStatistics: async (period = '7d') => {
    const response = await api.get(`/api/admin/dashboard/reading-statistics?period=${period}`);
    return response.data;
  },
};
