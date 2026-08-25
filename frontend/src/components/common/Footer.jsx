import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebook } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer
      style={{
        background: '#060d1a',
        borderTop: '1px solid #1e3254',
        color: '#94a3b8',
        padding: '3.5rem 1.5rem 2rem 1.5rem',
        marginTop: 'auto',
        fontFamily: 'Be Vietnam Pro, sans-serif',
      }}
    >
      <div
        style={{
          maxWidth: 1400,
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '2.5rem',
          paddingBottom: '2.5rem',
          borderBottom: '1px solid #1e3254',
        }}
      >
        {/* Column 1: Brand & Slogan */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <img src="/logo.png" alt="StoryWorld Logo" style={{ height: 40, width: 40, objectFit: 'contain' }} />
            <div>
              <h3 style={{ color: '#dce8f5', fontSize: '1.25rem', fontWeight: 800, margin: 0, letterSpacing: '-0.3px' }}>
                StoryWorld
              </h3>
              <p style={{ color: '#a78bfa', fontSize: '0.78rem', fontStyle: 'italic', margin: 0 }}>
                Đắm mình trong bốn mùa thư hương
              </p>
            </div>
          </div>
          <p style={{ color: '#64748b', fontSize: '0.82rem', lineHeight: 1.65, margin: 0, maxWidth: 380 }}>
            Nền tảng đọc truyện chữ tiếng Việt — convert, dịch, và sáng tác. Cộng đồng tác giả & độc giả dành cho những ai say mê câu chữ.
          </p>
        </div>

        {/* Column 2: Về chúng tôi */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <h4 style={{ color: '#ffffff', fontSize: '0.95rem', fontWeight: 700, margin: 0 }}>
            Về chúng tôi
          </h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.55rem', fontSize: '0.84rem' }}>
            <li>
              <Link to="/about" style={{ color: '#94a3b8', textDecoration: 'none', transition: 'color 0.15s' }} onMouseEnter={(e) => e.target.style.color = '#60a5fa'} onMouseLeave={(e) => e.target.style.color = '#94a3b8'}>
                Giới thiệu
              </Link>
            </li>
            <li>
              <Link to="/team" style={{ color: '#94a3b8', textDecoration: 'none', transition: 'color 0.15s' }} onMouseEnter={(e) => e.target.style.color = '#60a5fa'} onMouseLeave={(e) => e.target.style.color = '#94a3b8'}>
                Đội ngũ
              </Link>
            </li>
            <li>
              <Link to="/news" style={{ color: '#94a3b8', textDecoration: 'none', transition: 'color 0.15s' }} onMouseEnter={(e) => e.target.style.color = '#60a5fa'} onMouseLeave={(e) => e.target.style.color = '#94a3b8'}>
                Tin tức
              </Link>
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" style={{ color: '#94a3b8', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', transition: 'color 0.15s' }} onMouseEnter={(e) => e.target.style.color = '#60a5fa'} onMouseLeave={(e) => e.target.style.color = '#94a3b8'}>
                <span>Liên hệ</span>
                <FaFacebook style={{ color: '#3b82f6', fontSize: '0.9rem' }} />
              </a>
            </li>
          </ul>
        </div>

        {/* Column 3: Hỗ trợ */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <h4 style={{ color: '#ffffff', fontSize: '0.95rem', fontWeight: 700, margin: 0 }}>
            Hỗ trợ
          </h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.55rem', fontSize: '0.84rem' }}>
            <li>
              <Link to="/faq" style={{ color: '#94a3b8', textDecoration: 'none', transition: 'color 0.15s' }} onMouseEnter={(e) => e.target.style.color = '#60a5fa'} onMouseLeave={(e) => e.target.style.color = '#94a3b8'}>
                Câu hỏi thường gặp
              </Link>
            </li>
            <li>
              <Link to="/terms" style={{ color: '#94a3b8', textDecoration: 'none', transition: 'color 0.15s' }} onMouseEnter={(e) => e.target.style.color = '#60a5fa'} onMouseLeave={(e) => e.target.style.color = '#94a3b8'}>
                Điều khoản dịch vụ
              </Link>
            </li>
            <li>
              <Link to="/privacy" style={{ color: '#94a3b8', textDecoration: 'none', transition: 'color 0.15s' }} onMouseEnter={(e) => e.target.style.color = '#60a5fa'} onMouseLeave={(e) => e.target.style.color = '#94a3b8'}>
                Chính sách bảo mật
              </Link>
            </li>
            <li>
              <Link to="/report" style={{ color: '#94a3b8', textDecoration: 'none', transition: 'color 0.15s' }} onMouseEnter={(e) => e.target.style.color = '#60a5fa'} onMouseLeave={(e) => e.target.style.color = '#94a3b8'}>
                Báo cáo vi phạm
              </Link>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Footer Section */}
      <div style={{ maxWidth: 1400, margin: '0 auto', paddingTop: '1.75rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{ display: 'flex', gap: '1.25rem', color: '#d97706', fontSize: '0.85rem' }}>
          <span>✿</span>
          <span>✿</span>
          <span>✿</span>
        </div>

        <p style={{ color: '#64748b', fontSize: '0.8rem', fontStyle: 'italic', margin: 0 }}>
          © 2026 StoryWorld — <span>Đắm mình trong bốn mùa thư hương</span>
        </p>
      </div>
    </footer>
  );
}
