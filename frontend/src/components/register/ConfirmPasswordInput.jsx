import { Lock, Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'

export default function ConfirmPasswordInput({ value, onChange, error }) {
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  return (
    <div className="form-group">
      <label className="form-label">Xác Nhận Mật Khẩu</label>
      <div className="input-wrapper">
        <Lock size={18} color="#5fa3d0" />
        <input
          type={showConfirmPassword ? 'text' : 'password'}
          name="passwordConfirm"
          value={value}
          onChange={onChange}
          placeholder="••••••••"
        />
        <button
          type="button"
          className="icon-button"
          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
        >
          {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
      {error && <span style={{ color: '#ff6b6b', fontSize: '12px', fontFamily: 'Inter, sans-serif' }}>{error}</span>}
    </div>
  )
}
