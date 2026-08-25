import api from '../api/axiosConfig';

export const vipPackageService = {
  // Public APIs
  getActivePackages: () => api.get('/api/vip-packages'),

  // Admin APIs
  getAllAdminPackages: () => api.get('/api/admin/vip-packages'),

  getPackageById: (id) => api.get(`/api/admin/vip-packages/${id}`),

  createPackage: (data) => api.post('/api/admin/vip-packages', data),

  updatePackage: (id, data) => api.put(`/api/admin/vip-packages/${id}`, data),

  togglePackageStatus: (id) => api.patch(`/api/admin/vip-packages/${id}/toggle`),

  deletePackage: (id) => api.delete(`/api/admin/vip-packages/${id}`),
};
