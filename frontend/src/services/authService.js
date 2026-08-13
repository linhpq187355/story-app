import api from '../api/axiosConfig'

const API_BASE_URL = '/api/auth'

const authService = {
  login: async (username, password) => {
    try {
      const response = await api.post(`${API_BASE_URL}/login`, {
        usernameOrEmail: username,
        password,
      })

      if (response.data.accessToken) {
        localStorage.setItem('token', response.data.accessToken)
        localStorage.setItem('user', JSON.stringify(response.data.user))
      }

      return response.data
    } catch (error) {
      throw error.response?.data || { message: 'Đăng nhập thất bại' }
    }
  },

  // Register
  register: async (email, username, password, passwordConfirm) => {
    try {
      const response = await api.post(`${API_BASE_URL}/register`, {
        email,
        username,
        password,
        passwordConfirm,
      })

      return response.data
    } catch (error) {
      throw error.response?.data || { message: 'Đăng ký thất bại' }
    }
  },

  // Logout
  logout: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  },

  // Get current user
  getCurrentUser: () => {
    const user = localStorage.getItem('user')
    return user ? JSON.parse(user) : null
  },

  // Get token
  getToken: () => {
    return localStorage.getItem('token')
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem('token')
  },

  // Refresh token
  refreshToken: async () => {
    try {
      const response = await api.post(`${API_BASE_URL}/refresh`)
      if (response.data.accessToken) {
        localStorage.setItem('token', response.data.accessToken)
        localStorage.setItem('user', JSON.stringify(response.data.user))
      }
      return response.data
    } catch (error) {
      throw error.response?.data || { message: 'Refresh token thất bại' }
    }
  },

  // Forgot password
  forgotPassword: async (email) => {
    try {
      const response = await api.post(`${API_BASE_URL}/forgot-password`, { email })
      return response.data
    } catch (error) {
      throw error.response?.data || { message: 'Yêu cầu reset mật khẩu thất bại' }
    }
  },

  // Reset password
  resetPassword: async (token, password, passwordConfirm) => {
    try {
      const response = await api.post(`${API_BASE_URL}/reset-password`, {
        token,
        password,
        passwordConfirm,
      })
      return response.data
    } catch (error) {
      throw error.response?.data || { message: 'Reset mật khẩu thất bại' }
    }
  },
}

export default authService
