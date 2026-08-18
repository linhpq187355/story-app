import { useState } from 'react'

export default function AdminNavbar({ onMenuClick }) {
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <header className="bg-slate-900 border-b border-slate-700 h-14 flex justify-between items-center px-6 sticky top-0 z-10">
      {/* Left: Mobile Menu Toggle & Title */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="md:hidden text-slate-400 hover:text-blue-400 transition-colors"
          aria-label="Toggle menu"
        >
          <span className="material-symbols-outlined">menu</span>
        </button>
        <h2 className="font-serif text-xl font-bold text-slate-100 hidden md:block">
          
        </h2>
      </div>

      {/* Right: Search & Actions */}
      <div className="flex items-center gap-6">

        {/* Actions */}
        <nav className="flex items-center gap-4" aria-label="Top actions">
          {/* Notifications */}
          <button
            className="text-slate-400 hover:text-blue-400 transition-colors relative"
            aria-label="Thông báo"
          >
            <span className="material-symbols-outlined">notifications</span>
            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* Account */}
          <button
            className="text-slate-400 hover:text-blue-400 transition-colors"
            aria-label="Tài khoản"
          >
            <span className="material-symbols-outlined">account_circle</span>
          </button>
        </nav>
      </div>
    </header>
  )
}