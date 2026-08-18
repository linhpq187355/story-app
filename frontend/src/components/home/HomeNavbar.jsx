import { useNavigate } from 'react-router-dom'
import { Search } from 'lucide-react'

export default function HomeNavbar({ search, setSearch, loggedIn, setLoggedIn }) {
  const navigate = useNavigate()

  return (
    <header
      style={{
        background: '#060d1a',
        borderBottom: '1px solid #1e3254',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}
    >
      <div
        style={{
          maxWidth: 1400,
          padding: '0 1.5rem',
          height: 60,
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          justifyContent: 'space-between',
        }}
      >
        <button
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none', height: '100%', cursor: 'pointer', width: '20%' }}
        >
          <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '30%', height: '100%' }}>
            <img src="../../../public/logo.png" alt="" />
          </span>
          <span className="logo-text" style={{ fontSize: '1.1rem', whiteSpace: 'nowrap' }}>
            Story World
          </span>
        </button>

        <div style={{ flex: 1, maxWidth: 520, display: 'flex', gap: '0.5rem' }}>
          <input
            className="input-field"
            placeholder="Tìm truyện..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ borderRadius: '0.6rem' }}
          />
          <button className="search-btn" style={{ width: 42, height: 42, borderRadius: '0.6rem', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Search size={18} aria-hidden="true" />
          </button>
        </div>

        <nav style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
          <button className="nav-link">Trang chủ</button>
          <button className="nav-link">Thể loại</button>
          <button className="nav-link">BXH</button>
        </nav>

        {loggedIn ? (
          <button onClick={() => setLoggedIn(false)} className="nav-link">
            Đăng xuất
          </button>
        ) : (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button onClick={() => navigate('/register')} className="nav-link">Đăng ký</button>
            <button onClick={() => navigate('/login')} className="btn-primary" style={{ padding: '0.45rem 0.9rem', borderRadius: '0.5rem' }}>
              Đăng nhập
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
