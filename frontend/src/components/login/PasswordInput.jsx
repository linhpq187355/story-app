import { Lock, Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'

export default function PasswordInput({ value, onChange }) {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className="form-group">
      <label className="form-label">Mật Khẩu</label>
      <div className="input-wrapper">
        <Lock size={18} color="#5fa3d0" />
        <input
          type={showPassword ? 'text' : 'password'}
          name="password"
          value={value}
          onChange={onChange}
          placeholder="••••••••"
        />
        <button
          type="button"
          className="icon-button"
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    </div>
  )
}
