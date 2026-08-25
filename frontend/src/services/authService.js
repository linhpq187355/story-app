import api from '../api/axiosConfig';

const authService = {
  login: async (usernameOrEmail, password) => {
    const response = await api.post('/api/auth/login', { usernameOrEmail, password });
    if (response.data.accessToken) {
      localStorage.setItem('token', response.data.accessToken);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  register: (data) => {
    const payload = typeof data === 'object' ? data : {};
    return api.post('/api/auth/register', payload);
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getMe: () => {
    return api.get('/api/users/me');
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  getCurrentUser: () => {
    try {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      return null;
    }
  },

  forgotPassword: (email) => {
    return api.post('/api/auth/forgot-password', { email });
  },

  verifyOtp: (email, otpCode) => {
    return api.post('/api/auth/verify-otp', { email, otpCode });
  },

  resetPassword: (email, otpCode, newPassword) => {
    return api.post('/api/auth/reset-password', { email, otpCode, newPassword });
  }
};

export default authService;