import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import authService from '../services/authService'
import LoginForm from '../components/login/LoginForm'
import '../styles/login.css'

export default function LoginPage() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    username: '',
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
  e.preventDefault()
  setError('')
  setLoading(true)

  try {
    if (!formData.username || !formData.password) {
      setError('Vui lòng điền đầy đủ thông tin')
      return
    }

    const response = await authService.login(
      formData.username,
      formData.password
    )

    if (response.user.role === 'ROLE_ADMIN') {
      navigate('/admin/stories')
    } else {
      navigate('/')
    }
  } catch (err) {
    setError(err.message || 'Đăng nhập thất bại')
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
