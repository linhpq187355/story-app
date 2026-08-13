import { Link } from 'react-router-dom'
import EmailInput from './EmailInput'
import UsernameInput from './UsernameInput'
import PasswordInput from '../login/PasswordInput'
import ConfirmPasswordInput from './ConfirmPasswordInput'
import RegisterButton from './RegisterButton'

export default function RegisterForm({
  formData,
  onFormChange,
  onSubmit,
  loading,
  error,
  fieldErrors,
}) {
  return (
    <>
      {/* Error Message */}
      {error && <div className="error-message">{error}</div>}

      {/* Form */}
      <form onSubmit={onSubmit} className="register-form">
        <EmailInput value={formData.email} onChange={onFormChange} error={fieldErrors?.email} />

        <UsernameInput value={formData.username} onChange={onFormChange} error={fieldErrors?.username} />

        <PasswordInput value={formData.password} onChange={onFormChange} error={fieldErrors?.password} />

        <ConfirmPasswordInput
          value={formData.passwordConfirm}
          onChange={onFormChange}
          error={fieldErrors?.passwordConfirm}
        />

        <RegisterButton loading={loading} />
      </form>

      {/* Divider */}
      <div className="divider-container">
        <div className="divider-line"></div>
        <span className="divider-text">Hoặc</span>
        <div className="divider-line"></div>
      </div>

      {/* Social Register Button */}
      <button type="button" className="social-button">
        Đăng ký với Google
      </button>

      {/* Login Link */}
      <div className="login-section">
        Đã có tài khoản?{' '}
        <Link to="/login" className="login-link">
          Đăng Nhập Ngay
        </Link>
      </div>
    </>
  )
}
