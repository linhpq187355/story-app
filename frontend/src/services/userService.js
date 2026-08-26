import api from '../api/axiosConfig';

const BASE_PATH = '/api/users/me';

export const userService = {
  /**
   * Lấy thông tin mới nhất của người dùng từ backend.
   * @returns {Promise}
   */
  getMe: () => {
    return api.get(BASE_PATH);
  },
  /**
   * Cập nhật tên hiển thị của người dùng.
   * @param {string} displayName
   * @returns {Promise}
   */
  updateProfile: (displayName) => {
    return api.put(`${BASE_PATH}/profile`, { displayName });
  },

  /**
   * Cập nhật ảnh đại diện của người dùng.
   * @param {File} file
   * @returns {Promise}
   */
  updateAvatar: (file) => {
    const formData = new FormData();
    formData.append('file', file);

    return api.put(`${BASE_PATH}/avatar`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  /**
   * Thay đổi mật khẩu người dùng.
   * @param {string} oldPassword
   * @param {string} newPassword
   * @param {string} confirmPassword
   * @returns {Promise}
   */
  changePassword: (oldPassword, newPassword, confirmPassword) => {
    return api.put(`${BASE_PATH}/password`, { oldPassword, newPassword, confirmPassword });
  },

  /**
   * Lấy danh sách truyện vừa đọc của người dùng.
   * @param {object} [params]
   * @returns {Promise}
   */
  getRecentlyReadStories: (params = {}) => {
    return api.get(`${BASE_PATH}/recently-read`, { params });
  },

  /**
   * Lấy thông tin người dùng hiện tại từ localStorage.
   * @returns {object | null}
   */
  getCurrentUser: () => {
    try {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      return null;
    }
  },

  /**
   * Cập nhật thông tin người dùng trong localStorage.
   * @param {object} updatedUser
   */
  updateCurrentUser: (updatedUser) => {
    try {
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      const newUser = { ...currentUser, ...updatedUser };
      localStorage.setItem('user', JSON.stringify(newUser));
      // Dispatch a custom event to notify other components like the navbar
      window.dispatchEvent(new Event('storage'));
    } catch (error) {
      console.error("Failed to update user in localStorage", error);
    }
  },

  /**
   * Xây dựng URL đầy đủ cho avatar.
   * @param {string} avatarPath
   * @returns {string}
   */
  buildAvatarUrl: (avatarPath) => {
    if (!avatarPath) return '/api/placeholder/96/96'; // Default avatar
    if (avatarPath.startsWith('http')) return avatarPath;

    const baseUrl = api.defaults?.baseURL || 'https://story-app-backend-czechbcvfdgec9ba.southeastasia-01.azurewebsites.net';
    return new URL(avatarPath, baseUrl).toString();
  },

  /**
   * Lấy danh sách người dùng cho Admin.
   * @param {object} [params]
   * @param {string} [params.search]
   * @param {boolean} [params.isVip]
   * @returns {Promise}
   */
  getAdminUsers: (params = {}) => {
    const queryParams = {};
    if (params?.search) queryParams.search = params.search;
    if (typeof params?.isVip === 'boolean') queryParams.isVip = params.isVip;
    return api.get('/api/admin/users', { params: queryParams });
  },

  /**
   * Cập nhật trạng thái VIP của người dùng (Admin).
   * @param {number|string} userId
   * @param {boolean} isVip
   * @returns {Promise}
   */
  updateVipStatus: (userId, isVip, packageId, durationDays) => {
    return api.patch(`/api/admin/users/${userId}/vip`, { vip: isVip, packageId, durationDays });
  }
};