import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import '../styles/login.css';

const extractError = (err, fallback) => err.response?.data?.message || err.message || fallback;

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password, 4: Success
  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setInterval(() => {
        setCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  // Step 1: Send OTP to Email
  const handleSendOtp = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!email.trim()) {
      setError('Vui lòng nhập địa chỉ email của bạn.');
      return;
    }
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const res = await authService.forgotPassword(email.trim());
      setMessage(res.data.message || 'Mã OTP đã được gửi đến email của bạn.');
      setCooldown(60);
      setStep(2);
    } catch (err) {
      setError(extractError(err, 'Không thể gửi mã OTP. Vui lòng kiểm tra lại email.'));
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otpCode.trim()) {
      setError('Vui lòng nhập mã OTP.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await authService.verifyOtp(email.trim(), otpCode.trim());
      setStep(3);
    } catch (err) {
      setError(extractError(err, 'Mã OTP không hợp lệ hoặc đã hết hạn.'));
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    const passwordComplexityRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;
    if (!newPassword) {
      setError('Vui lòng nhập mật khẩu mới.');
      return;
    }
    if (newPassword.length < 8) {
      setError('Mật khẩu phải chứa ít nhất 8 ký tự.');
      return;
    }
    if (!passwordComplexityRegex.test(newPassword)) {
      setError('Mật khẩu phải chứa ít nhất một chữ hoa, một chữ thường và một chữ số.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Xác nhận mật khẩu không khớp.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await authService.resetPassword(email.trim(), otpCode.trim(), newPassword);
      setMessage(res.data.message || 'Mật khẩu đã được đặt lại thành công.');
      setStep(4);
    } catch (err) {
      setError(extractError(err, 'Đặt lại mật khẩu thất bại. Vui lòng thử lại.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card" style={{ maxWidth: '460px' }}>
        {/* Header */}
        <div className="login-header">
          <h1>Quên Mật Khẩu</h1>
          <p>
            {step === 1 && 'Nhập email đã đăng ký để nhận mã OTP xác minh'}
            {step === 2 && `Nhập mã OTP 6 chữ số vừa được gửi đến ${email}`}
            {step === 3 && 'Tạo mật khẩu mới cho tài khoản của bạn'}
            {step === 4 && 'Đổi mật khẩu thành công!'}
          </p>
        </div>

        {/* Error / Success Messages */}
        {error && <div className="error-message">{error}</div>}
        {message && step !== 4 && (
          <div
            style={{
              background: '#1d2d1f',
              border: '1px solid #4a7d54',
              borderRadius: '8px',
              padding: '12px 16px',
              marginBottom: '20px',
              color: '#51cf66',
              fontSize: '14px',
            }}
          >
            {message}
          </div>
        )}

        {/* STEP 1: Enter Email */}
        {step === 1 && (
          <form onSubmit={handleSendOtp} className="login-form">
            <div className="form-group">
              <label className="form-label">Email tài khoản</label>
              <div className="input-wrapper">
                <input
                  type="email"
                  placeholder="Nhập email của bạn..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <button type="submit" className="login-button" disabled={loading}>
              {loading ? 'Đang gửi mã...' : 'Gửi mã xác thực OTP'}
            </button>
          </form>
        )}

        {/* STEP 2: Enter OTP */}
        {step === 2 && (
          <form onSubmit={handleVerifyOtp} className="login-form">
            <div className="form-group">
              <label className="form-label">Mã OTP (6 chữ số)</label>
              <div className="input-wrapper">
                <input
                  type="text"
                  maxLength={6}
                  placeholder="Nhập 6 chữ số OTP..."
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  style={{ textAlign: 'center', letterSpacing: '4px', fontSize: '18px', fontWeight: 'bold' }}
                  required
                />
              </div>
            </div>

            <button type="submit" className="login-button" disabled={loading}>
              {loading ? 'Đang kiểm tra...' : 'Xác thực mã OTP'}
            </button>

            <div style={{ textAlign: 'center', marginTop: '1rem' }}>
              {cooldown > 0 ? (
                <span style={{ color: '#8fa3b8', fontSize: '14px' }}>
                  Gửi lại mã OTP sau ({cooldown}s)
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={loading}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#5fa3d0',
                    cursor: 'pointer',
                    fontSize: '14px',
                    textDecoration: 'underline',
                  }}
                >
                  Gửi lại mã OTP
                </button>
              )}
            </div>
          </form>
        )}

        {/* STEP 3: Enter New Password */}
        {step === 3 && (
          <form onSubmit={handleResetPassword} className="login-form">
            <div className="form-group">
              <label className="form-label">Mật khẩu mới</label>
              <div className="input-wrapper">
                <input
                  type="password"
                  placeholder="Nhập mật khẩu mới..."
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Xác nhận mật khẩu mới</label>
              <div className="input-wrapper">
                <input
                  type="password"
                  placeholder="Nhập lại mật khẩu mới..."
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button type="submit" className="login-button" disabled={loading}>
              {loading ? 'Đang lưu mật khẩu...' : 'Đặt lại mật khẩu'}
            </button>
          </form>
        )}

        {/* STEP 4: Success State */}
        {step === 4 && (
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
            <p style={{ color: '#c2d1dc', marginBottom: '1.5rem', lineHeight: 1.5 }}>
              Mật khẩu của bạn đã được cập nhật thành công. Vui lòng đăng nhập bằng mật khẩu mới.
            </p>
            <button
              onClick={() => navigate('/login')}
              className="login-button"
              style={{ width: '100%' }}
            >
              Quay lại Đăng Nhập
            </button>
          </div>
        )}

        {/* Return to Login link */}
        {step !== 4 && (
          <div className="register-section">
            <Link to="/login" className="register-link">
              ← Quay lại Đăng nhập
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
