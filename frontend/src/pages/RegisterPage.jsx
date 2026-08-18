import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import authService from '../services/authService'
import RegisterForm from '../components/register/RegisterForm'
import '../styles/register.css'

export default function RegisterPage() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    passwordConfirm: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    setError('')
    // Clear field error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({
        ...prev,
        [name]: '',
      }))
    }
  }

  const validateForm = () => {
    const errors = {}

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!formData.email) {
      errors.email = 'Email là bắt buộc'
    } else if (!emailRegex.test(formData.email)) {
      errors.email = 'Email không hợp lệ'
    }

    // Validate username
    if (!formData.username) {
      errors.username = 'Tên đăng nhập là bắt buộc'
    } else if (formData.username.length < 3) {
      errors.username = 'Tên đăng nhập phải có ít nhất 3 ký tự'
    }

    // Validate password
    if (!formData.password) {
      errors.password = 'Mật khẩu là bắt buộc'
    } else if (formData.password.length < 6) {
      errors.password = 'Mật khẩu phải có ít nhất 6 ký tự'
    }

    // Validate confirm password
    if (!formData.passwordConfirm) {
      errors.passwordConfirm = 'Xác nhận mật khẩu là bắt buộc'
    } else if (formData.password !== formData.passwordConfirm) {
      errors.passwordConfirm = 'Mật khẩu không trùng khớp'
    }

    return errors
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setError('')
    setFieldErrors({})
    setLoading(true)

    // Validate form
    const errors = validateForm()
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      setLoading(false)
      return
    }

    try {
      // Call register service
      await authService.register(
        formData.email,
        formData.username,
        formData.password,
        formData.passwordConfirm
      )
      // Redirect to login page after successful registration
      navigate('/login')
    } catch (err) {
      setError(err.message || 'Đăng ký thất bại')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="register-container">
      <div className="register-card">
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
        <div className="register-header">
          <h1>Đăng Ký</h1>
          <p>Tạo tài khoản để khám phá thế giới truyện</p>
        </div>

        {/* Form */}
        <RegisterForm
          formData={formData}
          onFormChange={handleChange}
          onSubmit={handleRegister}
          loading={loading}
          error={error}
          fieldErrors={fieldErrors}
        />
      </div>
    </div>
  )
}
