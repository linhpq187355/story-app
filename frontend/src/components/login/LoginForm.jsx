import { Link } from 'react-router-dom'
import EmailInput from './EmailInput'
import PasswordInput from './PasswordInput'
import LoginButton from './LoginButton'

const GOOGLE_AUTH_URL = 'https://story-app-backend-czechbcvfdgec9ba.southeastasia-01.azurewebsites.net/oauth2/authorization/google';

export default function LoginForm({ formData, onFormChange, onSubmit, loading, error }) {
  return (
    <>
      {/* Error Message */}
      {error && <div className="error-message">{error}</div>}

      {/* Form */}
      <form onSubmit={onSubmit} className="login-form">
        <EmailInput value={formData.usernameOrEmail} onChange={onFormChange} />

        <PasswordInput value={formData.password} onChange={onFormChange} />

        {/* Remember & Forgot */}
        <div className="form-footer">
          <div className="remember-me">
          </div>
          <Link to="/forgot-password" className="forgot-password">
            Quên mật khẩu?
          </Link>
        </div>

        <LoginButton loading={loading} />
      </form>

      {/* Divider */}
      <div className="divider-container">
        <div className="divider-line"></div>
        <span className="divider-text">Hoặc</span>
        <div className="divider-line"></div>
      </div>

      {/* Social Login Button */}
      <a href={GOOGLE_AUTH_URL} className="social-button">
        Đăng nhập với Google
      </a>

      {/* Register Link */}
      <div className="register-section">
        Chưa có tài khoản?{' '}
        <Link to="/register" className="register-link">
          Đăng Ký Ngay
        </Link>
      </div>
    </>
  )
}