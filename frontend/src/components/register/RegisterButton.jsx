import { Loader } from 'lucide-react'

export default function RegisterButton({ loading, onClick }) {
  return (
    <button
      type="submit"
      className="register-button"
      disabled={loading}
      onClick={onClick}
    >
      {loading && <Loader size={18} className="spinner" />}
      {loading ? 'Đang đăng ký...' : 'Đăng Ký'}
    </button>
  )
}
