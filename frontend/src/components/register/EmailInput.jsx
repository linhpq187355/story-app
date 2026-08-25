import { Mail } from 'lucide-react'

export default function EmailInput({ value, onChange, error }) {
  return (
    <div className="form-group">
      <label className="form-label">Email</label>
      <div className="input-wrapper">
        <Mail size={18} color="#5fa3d0" />
        <input
          type="email"
          name="email"
          value={value}
          onChange={onChange}
          maxLength={100}
          placeholder="example@email.com"
        />
      </div>
      {error && <span style={{ color: '#ff6b6b', fontSize: '12px', fontFamily: 'Inter, sans-serif' }}>{error}</span>}
    </div>
  )
}
