import { Loader } from 'lucide-react'

export default function LoginButton({ loading, onClick }) {
  return (
    <button
      type="submit"
      className="login-button"
      disabled={loading}
      onClick={onClick}
    >
      {loading && <Loader size={18} className="spinner" />}
      {loading ? 'Đang đăng nhập...' : 'Đăng Nhập'}
    </button>
  )
}
