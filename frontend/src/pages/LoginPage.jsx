import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import authService from '../services/authService'
import LoginForm from '../components/login/LoginForm'
import '../styles/login.css'

export default function LoginPage() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    usernameOrEmail: '',
    password: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    setError('')
  }

  const handleLogin = async (e) => {
    if (e && e.preventDefault) {
      e.preventDefault()
    }
    setError('')

    const val = formData.usernameOrEmail ? formData.usernameOrEmail.trim() : ''
    const pwd = formData.password ? formData.password.trim() : ''

    if (!val || !pwd) {
      setError('Vui lòng điền đầy đủ tên đăng nhập/email và mật khẩu')
      return
    }

    if (val.includes('@')) {
      if (val.length > 100) {
        setError('Email không được vượt quá 100 ký tự')
        return
      }
    } else {
      if (val.length > 50) {
        setError('Tên đăng nhập không được vượt quá 50 ký tự')
        return
      }
    }

    setLoading(true)

    try {
      const response = await authService.login(val, formData.password)
      if (response.user.role === 'ROLE_ADMIN') {
        navigate('/admin/stories')
      } else {
        navigate('/')
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Tên đăng nhập/email hoặc mật khẩu không chính xác')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-container">
        <div className="login-card">
          <button
          onClick={() => navigate('/')}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#5fa3d0',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
            fontFamily: 'Inter, sans-serif',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'color 0.3s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#7bb8e8')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#5fa3d0')}
        >
          ← Quay về trang chủ
        </button>
        {/* Logo */}
        <div style={{ marginBottom: '2px' }}>
          <img
            src="/logo.png"
            alt="Logo"
            style={{
              width: '30%',
              margin: '0 auto',
              borderRadius: '8px',
            }}
          />
        </div>

        {/* Header */}
        <div className="login-header">
          <h1>Đăng Nhập</h1>
          <p>Chào mừng trở lại Story World</p>
        </div>

        {/* Form */}
        <LoginForm
          formData={formData}
          onFormChange={handleChange}
          onSubmit={handleLogin}
          loading={loading}
          error={error}
        />
      </div>
    </div>
  )
}
