import { User } from 'lucide-react'

export default function UsernameInput({ value, onChange, error }) {
  return (
    <div className="form-group">
      <label className="form-label">Tên Đăng Nhập</label>
      <div className="input-wrapper">
        <User size={18} color="#5fa3d0" />
        <input
          type="text"
          name="username"
          value={value}
          onChange={onChange}
          placeholder="username"
        />
      </div>
      {error && <span style={{ color: '#ff6b6b', fontSize: '12px', fontFamily: 'Inter, sans-serif' }}>{error}</span>}
    </div>
  )
}
