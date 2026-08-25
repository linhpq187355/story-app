import { useState } from 'react';
import { FaCog, FaTimes, FaPlus, FaMinus } from 'react-icons/fa';

export const READING_THEMES = {
  night: {
    id: 'night',
    name: 'Đêm',
    icon: '🌙',
    bg: '#080f1e',
    contentBg: '#0f172a',
    text: '#c8daf0',
    titleColor: '#dce8f5',
    subColor: '#7a96b8',
    borderColor: '#1e3254',
    buttonBg: '#0d1b33',
    buttonText: '#60a5fa',
    cardBg: '#1a2841',
  },
  dark: {
    id: 'dark',
    name: 'Huyền bí',
    icon: '🌑',
    bg: '#000000',
    contentBg: '#0a0a0a',
    text: '#d1d5db',
    titleColor: '#f3f4f6',
    subColor: '#9ca3af',
    borderColor: '#262626',
    buttonBg: '#171717',
    buttonText: '#38bdf8',
    cardBg: '#141414',
  },
  day: {
    id: 'day',
    name: 'Sáng',
    icon: '☀️',
    bg: '#f8fafc',
    contentBg: '#ffffff',
    text: '#1e293b',
    titleColor: '#0f172a',
    subColor: '#64748b',
    borderColor: '#cbd5e1',
    buttonBg: '#f1f5f9',
    buttonText: '#0284c7',
    cardBg: '#ffffff',
  },
  sepia: {
    id: 'sepia',
    name: 'Giấy cũ',
    icon: '📜',
    bg: '#fbf0d9',
    contentBg: '#f4e8c1',
    text: '#433422',
    titleColor: '#2c1f10',
    subColor: '#7c6549',
    borderColor: '#e2d2b0',
    buttonBg: '#ede0c4',
    buttonText: '#b45309',
    cardBg: '#f4e8c1',
  },
  emerald: {
    id: 'emerald',
    name: 'Mắt êm',
    icon: '🍃',
    bg: '#091e13',
    contentBg: '#0f291b',
    text: '#d8f3dc',
    titleColor: '#e8f5e9',
    subColor: '#74c69d',
    borderColor: '#1b4332',
    buttonBg: '#143823',
    buttonText: '#52b788',
    cardBg: '#0f291b',
  },
};

export const FONT_FAMILIES = [
  { id: 'sans-serif', name: 'Không chân (Sans)', family: 'system-ui, -apple-system, Roboto, sans-serif' },
  { id: 'serif', name: 'Có chân (Serif)', family: 'Georgia, Cambria, "Times New Roman", serif' },
  { id: 'monospace', name: 'Đơn cách (Mono)', family: 'ui-monospace, SFMono-Regular, Menlo, monospace' },
];

export const LINE_HEIGHTS = [
  { value: 1.5, name: 'Hẹp (1.5)' },
  { value: 1.8, name: 'Chuẩn (1.8)' },
  { value: 2.2, name: 'Rộng (2.2)' },
];

export const CONTENT_WIDTHS = [
  { value: 680, name: 'Hẹp (680px)' },
  { value: 780, name: 'Chuẩn (780px)' },
  { value: 920, name: 'Rộng (920px)' },
];

export const DEFAULT_SETTINGS = {
  theme: 'night',
  fontSize: 18,
  fontFamily: 'sans-serif',
  lineHeight: 1.8,
  maxWidth: 780,
};

export default function ReadingSettings({ settings, onUpdateSettings }) {
  const [isOpen, setIsOpen] = useState(false);

  const currentTheme = READING_THEMES[settings.theme] || READING_THEMES.night;

  const handleFontSizeChange = (delta) => {
    const newSize = Math.min(Math.max(settings.fontSize + delta, 13), 32);
    onUpdateSettings({ ...settings, fontSize: newSize });
  };

  const handleThemeSelect = (themeId) => {
    onUpdateSettings({ ...settings, theme: themeId });
  };

  return (
    <>
      {/* Top Right Fixed Settings Button */}
      <button
        onClick={() => setIsOpen(true)}
        title="Cài đặt giao diện đọc"
        style={{
          position: 'fixed',
          top: '76px',
          right: '24px',
          zIndex: 90,
          background: currentTheme.cardBg,
          color: currentTheme.buttonText,
          border: `1px solid ${currentTheme.borderColor}`,
          borderRadius: '2rem',
          padding: '0.55rem 1.1rem',
          fontSize: '0.85rem',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: '0.45rem',
          boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
          cursor: 'pointer',
          backdropFilter: 'blur(8px)',
          transition: 'all 0.2s ease',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
        onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
      >
        <FaCog style={{ fontSize: '0.95rem' }} />
        <span>Tùy chỉnh</span>
      </button>

      {/* Centered Modal Overlay (high z-index 9999 to sit above navbar) */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            alignItems: 'center',
            justify: 'center',
            zIndex: 9999,
            padding: '1.5rem 1rem',
            overflowY: 'auto',
          }}
          onClick={() => setIsOpen(false)}
        >
          <div
            style={{
              background: currentTheme.cardBg,
              color: currentTheme.text,
              border: `1px solid ${currentTheme.borderColor}`,
              borderRadius: '1rem',
              width: '100%',
              maxWidth: '480px',
              maxHeight: 'calc(100vh - 3rem)',
              overflowY: 'auto',
              padding: '1.75rem',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
              position: 'relative',
              margin: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: `1px solid ${currentTheme.borderColor}`, paddingBottom: '0.75rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 'bold', color: currentTheme.titleColor, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FaCog style={{ color: currentTheme.buttonText }} /> Cài đặt giao diện đọc
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                style={{ background: 'none', border: 'none', color: currentTheme.subColor, cursor: 'pointer', fontSize: '1.2rem', padding: '0.2rem' }}
              >
                <FaTimes />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* 1. Reading Theme */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: currentTheme.subColor, marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Chế độ đọc & Màu nền
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                  {Object.values(READING_THEMES).map((theme) => {
                    const isSelected = settings.theme === theme.id;
                    return (
                      <button
                        key={theme.id}
                        onClick={() => handleThemeSelect(theme.id)}
                        style={{
                          background: theme.bg,
                          color: theme.text,
                          border: isSelected ? `2px solid ${theme.buttonText}` : '1px solid rgba(128,128,128,0.3)',
                          borderRadius: '0.5rem',
                          padding: '0.6rem 0.5rem',
                          cursor: 'pointer',
                          textAlign: 'center',
                          fontSize: '0.85rem',
                          fontWeight: isSelected ? 'bold' : 'normal',
                          display: 'flex',
                          alignItems: 'center',
                          justify: 'center',
                          gap: '0.3rem',
                        }}
                      >
                        <span>{theme.icon}</span> {theme.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Font Size Controls */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: currentTheme.subColor, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Cỡ chữ ({settings.fontSize}px)
                  </label>
                  <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                    <button
                      onClick={() => handleFontSizeChange(-1)}
                      disabled={settings.fontSize <= 13}
                      style={{ background: currentTheme.buttonBg, color: currentTheme.text, border: `1px solid ${currentTheme.borderColor}`, borderRadius: '0.36rem', padding: '0.25rem 0.6rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.2rem' }}
                    >
                      <FaMinus style={{ fontSize: '0.65rem' }} /> A
                    </button>
                    <button
                      onClick={() => handleFontSizeChange(1)}
                      disabled={settings.fontSize >= 32}
                      style={{ background: currentTheme.buttonBg, color: currentTheme.text, border: `1px solid ${currentTheme.borderColor}`, borderRadius: '0.36rem', padding: '0.25rem 0.6rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.2rem' }}
                    >
                      A <FaPlus style={{ fontSize: '0.65rem' }} />
                    </button>
                  </div>
                </div>
                <input
                  type="range"
                  min="13"
                  max="32"
                  step="1"
                  value={settings.fontSize}
                  onChange={(e) => onUpdateSettings({ ...settings, fontSize: parseInt(e.target.value) })}
                  style={{ width: '100%', cursor: 'pointer' }}
                />
              </div>

              {/* 3. Font Family */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: currentTheme.subColor, marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Phông chữ
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                  {FONT_FAMILIES.map((font) => {
                    const isSelected = settings.fontFamily === font.id;
                    return (
                      <button
                        key={font.id}
                        onClick={() => onUpdateSettings({ ...settings, fontFamily: font.id })}
                        style={{
                          background: isSelected ? currentTheme.buttonBg : 'transparent',
                          color: isSelected ? currentTheme.buttonText : currentTheme.text,
                          border: isSelected ? `2px solid ${currentTheme.buttonText}` : `1px solid ${currentTheme.borderColor}`,
                          borderRadius: '0.5rem',
                          padding: '0.5rem 0.25rem',
                          cursor: 'pointer',
                          fontSize: '0.8rem',
                          fontFamily: font.family,
                          textAlign: 'center',
                        }}
                      >
                        {font.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 4. Line Height */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: currentTheme.subColor, marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Khoảng cách dòng
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                  {LINE_HEIGHTS.map((lh) => {
                    const isSelected = settings.lineHeight === lh.value;
                    return (
                      <button
                        key={lh.value}
                        onClick={() => onUpdateSettings({ ...settings, lineHeight: lh.value })}
                        style={{
                          background: isSelected ? currentTheme.buttonBg : 'transparent',
                          color: isSelected ? currentTheme.buttonText : currentTheme.text,
                          border: isSelected ? `2px solid ${currentTheme.buttonText}` : `1px solid ${currentTheme.borderColor}`,
                          borderRadius: '0.5rem',
                          padding: '0.5rem',
                          cursor: 'pointer',
                          fontSize: '0.8rem',
                          textAlign: 'center',
                        }}
                      >
                        {lh.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 5. Max Width */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: currentTheme.subColor, marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Chiều rộng khung đọc
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                  {CONTENT_WIDTHS.map((cw) => {
                    const isSelected = settings.maxWidth === cw.value;
                    return (
                      <button
                        key={cw.value}
                        onClick={() => onUpdateSettings({ ...settings, maxWidth: cw.value })}
                        style={{
                          background: isSelected ? currentTheme.buttonBg : 'transparent',
                          color: isSelected ? currentTheme.buttonText : currentTheme.text,
                          border: isSelected ? `2px solid ${currentTheme.buttonText}` : `1px solid ${currentTheme.borderColor}`,
                          borderRadius: '0.5rem',
                          padding: '0.5rem',
                          cursor: 'pointer',
                          fontSize: '0.8rem',
                          textAlign: 'center',
                        }}
                      >
                        {cw.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Reset Defaults & Close Button */}
            <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button
                onClick={() => onUpdateSettings(DEFAULT_SETTINGS)}
                style={{ background: 'none', border: 'none', color: currentTheme.subColor, cursor: 'pointer', fontSize: '0.8rem', textDecoration: 'underline' }}
              >
                Đặt lại mặc định
              </button>
              <button
                onClick={() => setIsOpen(false)}
                style={{
                  background: currentTheme.buttonBg,
                  color: currentTheme.buttonText,
                  border: `1px solid ${currentTheme.borderColor}`,
                  borderRadius: '0.5rem',
                  padding: '0.5rem 1.25rem',
                  fontWeight: 'bold',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                }}
              >
                Hoàn tất
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
