import { Mail } from 'lucide-react'

export default function EmailInput({ value, onChange }) {
  return (
    <div className="form-group">
      <label className="form-label">Email hoặc Tên đăng nhập</label>
      <div className="input-wrapper">
        <Mail size={18} color="#5fa3d0" />
        <input
          type="text"
          name="username"
          value={value}
          onChange={onChange}
          placeholder="example@email.com hoặc username"
        />
      </div>
    </div>
  )
}
