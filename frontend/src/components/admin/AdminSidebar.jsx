import { Link, useLocation, useNavigate } from 'react-router-dom'
import authService from '../../services/authService'

const ADMIN_NAV_ITEMS = [
  {
    label: 'Quản lý Truyện',
    icon: 'menu_book',
    path: '/admin/stories',
  },
  {
    label: 'Tác giả & Thể loại',
    icon: 'category',
    path: '/admin/categories',
  },
]

export default function AdminSidebar({ isOpen, onClose }) {
  const location = useLocation()
  const navigate = useNavigate()
  const user = authService.getCurrentUser()

  const handleLogout = () => {
    authService.logout()
    navigate('/login')
  }

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 md:hidden z-10"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`bg-slate-800 border-r border-slate-700 w-72 h-screen fixed left-0 top-0 flex flex-col py-6 z-20 transition-transform duration-300 md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Sidebar Header */}
        <header className="flex items-center px-6 mb-8">
          <img
            src="/logo.png"
            alt="StoryWorld Logo"
            className="w-16 h-16 object-cover"
          />
          <h1 className="font-serif text-2xl font-bold text-slate-100">
            StoryWorld
          </h1>
        </header>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto">
          <ul className="space-y-2 px-4">
            {ADMIN_NAV_ITEMS.map((item) => {
              const isActive = location.pathname.startsWith(item.path)
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    onClick={onClose}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all active:scale-90 ${
                      isActive
                        ? 'text-blue-400 font-bold border-r-4 border-blue-400 bg-blue-400/10 hover:bg-slate-700'
                        : 'text-slate-400 hover:bg-slate-700 hover:text-slate-100'
                    }`}
                  >
                    <span className="material-symbols-outlined">{item.icon}</span>
                    <span className="font-mono text-xs uppercase tracking-wider">{item.label}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        <footer className="px-4 mt-auto">
          <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-slate-700">
            <span className="material-symbols-outlined text-slate-300">account_circle</span>
            <div className="min-w-0 flex-1">
              <p className="font-mono text-xs uppercase tracking-wider text-slate-100 font-semibold truncate">
                {user?.username || 'Admin'}
              </p>
              <p className="font-mono text-[10px] uppercase text-slate-400">Hệ thống</p>
            </div>
            <button
              onClick={handleLogout}
              className="text-slate-400 hover:text-red-400 transition-colors"
              title="Đăng xuất"
              aria-label="Đăng xuất"
            >
              <span className="material-symbols-outlined text-[20px]">logout</span>
            </button>
          </div>
        </footer>
      </aside>
    </>
  )
}
