import { Navigate, Outlet } from 'react-router-dom'
import authService from '../services/authService'

export default function AdminRoute() {
  const isAuthenticated = authService.isAuthenticated()
  const user = authService.getCurrentUser()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (!user || user.role !== 'ROLE_ADMIN') {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-center px-4">
        <span className="material-symbols-outlined text-[64px] text-red-400 mb-4">lock</span>
        <h1 className="font-sans text-3xl font-bold text-slate-100">Không có quyền truy cập</h1>
        <p className="font-sans text-base text-slate-400 mt-2 mb-6">
          Bạn cần đăng nhập với tài khoản Admin để vào trang này.
        </p>
        <button
          onClick={() => authService.logout()}
          className="bg-blue-400 hover:bg-blue-500 text-slate-950 font-mono text-sm font-bold py-3 px-6 rounded-lg transition-colors"
        >
          Đăng xuất
        </button>
      </div>
    )
  }

  return <Outlet />
}
