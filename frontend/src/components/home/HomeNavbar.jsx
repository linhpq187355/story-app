import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { userService } from '../../services/userService';
import CoinTopUpModal from './CoinTopUpModal';

// ─── User Dropdown ───────────────────────────────────────────────────────────
function UserDropdown({ setLoggedIn }) {
  const [open, setOpen] = useState(false);
  const [isCoinModalOpen, setIsCoinModalOpen] = useState(false);
  const [user, setUser] = useState(userService.getCurrentUser());
  const navigate = useNavigate();

  useEffect(() => {
    const syncUser = async () => {
      try {
        if (localStorage.getItem('token')) {
          const res = await userService.getMe();
          if (res?.data) {
            setUser(res.data);
            userService.updateCurrentUser(res.data);
          }
        }
      } catch (err) {
        console.error('Failed to sync user profile in Navbar:', err);
      }
    };

    syncUser();

    const handleStorageChange = () => {
      setUser(userService.getCurrentUser());
    };
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setLoggedIn(false);
    navigate('/'); 
  };

  const menuItem = (icon, label, color = '#c8daf0', onClick) => (
    <button
      key={label}
      onClick={() => { setOpen(false); onClick?.() }}
      style={{
        display: 'flex', alignItems: 'center', gap: '0.75rem',
        width: '100%', background: 'none', border: 'none',
        color, fontSize: '0.88rem', fontFamily: 'Be Vietnam Pro, sans-serif',
        padding: '0.6rem 1rem', cursor: 'pointer', textAlign: 'left',
        borderRadius: '0.5rem', transition: 'background 0.12s',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.background = '#111f3a' }}
      onMouseLeave={(e) => { e.currentTarget.style.background = 'none' }}
    >
      <span style={{ fontSize: '1rem', width: 20, textAlign: 'center', flexShrink: 0 }}>{icon}</span>
      {label}
    </button>
  );

  const avatarUrl = userService.buildAvatarUrl(user?.avatar);
  const displayName = user?.displayName || user?.username;
  const firstLetter = displayName?.charAt(0).toUpperCase() || '?';

  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
      {/* Coin badge */}
      <button
        onClick={() => setIsCoinModalOpen(true)}
        title="Bấm để nạp xu"
        style={{
          display: 'flex', alignItems: 'center', gap: '0.3rem',
          background: '#152033', border: '1px solid #d97706',
          borderRadius: '999px', padding: '3px 10px',
          color: '#fbbf24', fontSize: '0.78rem', fontWeight: 700, fontFamily: 'monospace',
          cursor: 'pointer', transition: 'all 0.15s',
          boxShadow: '0 0 10px rgba(245,158,11,0.2)',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#fbbf24' }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#d97706' }}
      >
        <span>🪙</span>
        <span>{user?.coins?.toLocaleString('vi-VN') || 0} xu</span>
        <span style={{ fontSize: '0.7rem', color: '#f59e0b', marginLeft: '0.1rem' }}>+</span>
      </button>

      {/* Trigger */}
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          display: 'flex', alignItems: 'center', gap: '0.4rem',
          background: open ? '#111f3a' : 'none',
          border: `1px solid ${open ? '#3b82f6' : '#1e3254'}`,
          borderRadius: '999px', padding: '3px 10px 3px 3px',
          cursor: 'pointer', transition: 'all 0.15s',
        }}
      >
        <div style={{
          width: 30, height: 30, borderRadius: '50%',
          background: 'linear-gradient(135deg, #3b82f6, #7c3aed)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '0.82rem', fontWeight: 700, color: '#fff', flexShrink: 0,
          overflow: 'hidden'
        }}>
          {user?.avatar ? <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" /> : firstLetter}
        </div>
        <span style={{
          color: '#a8bcd4', fontSize: '0.7rem',
          transition: 'transform 0.2s', display: 'inline-block',
          transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
        }}>▾</span>
      </button>

      {/* Dropdown panel */}
      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 199 }} />
          <div style={{
            position: 'absolute', top: 'calc(100% + 10px)', right: 0,
            width: 300, zIndex: 200,
            background: '#0d1b33', border: '1px solid #1e3254',
            borderRadius: '1rem', boxShadow: '0 16px 48px rgba(0,0,0,0.6)',
            overflow: 'hidden',
          }}>
            <div style={{ padding: '1rem', borderBottom: '1px solid #1e3254' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{
                  width: 44, height: 44, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #3b82f6, #7c3aed)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1rem', fontWeight: 700, color: '#fff', flexShrink: 0,
                  overflow: 'hidden'
                }}>
                  {user?.avatar ? <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" /> : firstLetter}
                </div>
                <div style={{ minWidth: 0 }}>
                  <p style={{ color: '#dce8f5', fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.15rem' }}>{displayName}</p>
                  <p style={{ color: '#4a6080', fontSize: '0.75rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email}</p>
                </div>
              </div>
            </div>

            {/* VIP Package & Coins Card */}
            <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #1e3254', background: '#0a1424' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
                  Gói: <strong style={{ color: user?.isVip ? '#a78bfa' : '#dce8f5' }}>{user?.isVip ? 'VIP' : 'Thường'}</strong>
                </span>
                <button
                  onClick={() => { setOpen(false); navigate('/account-settings?tab=plan'); }}
                  style={{
                    background: '#2563eb', color: '#fff', border: 'none',
                    borderRadius: '0.5rem', padding: '0.3rem 0.75rem',
                    fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer',
                    display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
                    boxShadow: '0 0 12px rgba(37,99,235,0.4)',
                  }}
                >
                  ✨ Nâng cấp VIP
                </button>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.82rem', paddingTop: '0.4rem', borderTop: '1px solid #17263d' }}>
                <span style={{ color: '#94a3b8' }}>
                  Số dư: <strong style={{ color: '#fbbf24', fontFamily: 'monospace' }}>{user?.coins?.toLocaleString('vi-VN') || 0} xu</strong>
                </span>
                <button
                  onClick={() => { setOpen(false); setIsCoinModalOpen(true); }}
                  style={{
                    background: 'rgba(245,158,11,0.15)', color: '#fbbf24', border: '1px solid rgba(245,158,11,0.4)',
                    borderRadius: '0.4rem', padding: '0.25rem 0.6rem',
                    fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer',
                  }}
                >
                  + Nạp Xu
                </button>
              </div>
            </div>

            {/* Menu Links */}
            <div style={{ padding: '0.4rem 0.25rem', borderBottom: '1px solid #1e3254' }}>
              {menuItem('🔖', 'Kệ sách', '#c8daf0', () => navigate('/bookshelf'))}
              {menuItem('⚙️', 'Cài đặt tài khoản', '#c8daf0', () => navigate('/account-settings'))}
            </div>
            <div style={{ padding: '0.4rem 0.25rem' }}>
              {menuItem('🚪', 'Đăng xuất', '#f87171', handleLogout)}
            </div>
          </div>
        </>
      )}

      {/* Coin Top-up Modal */}
      <CoinTopUpModal isOpen={isCoinModalOpen} onClose={() => setIsCoinModalOpen(false)} />
    </div>
  )
}


export default function HomeNavbar({ search, setSearch, loggedIn, setLoggedIn }) {
  const navigate = useNavigate();

  const handleSearch = () => {
    if (search.trim()) {
      navigate(`/search?q=${encodeURIComponent(search)}`);
    }
  };

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
          onClick={() => navigate('/')}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none', height: '100%', cursor: 'pointer' }}
        >
          <img src="/logo.png" alt="Story World Logo" style={{ height: 32, objectFit: 'contain' }} />
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
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            style={{ borderRadius: '0.6rem' }}
          />
          <button onClick={handleSearch} className="search-btn" style={{ width: 42, height: 42, borderRadius: '0.6rem', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Search size={18} aria-hidden="true" />
          </button>
        </div>

        <nav style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
          <button onClick={() => navigate('/')} className="nav-link">Trang chủ</button>
          <button onClick={() => navigate('/search')} className="nav-link">Tìm truyện</button>
          <button className="nav-link">BXH</button>
        </nav>

        {loggedIn ? (
          <UserDropdown setLoggedIn={setLoggedIn} />
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
  );
}