import React from 'react';

const buildPageNumbers = (current, total) => {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    const pages = [];
    const addRange = (a, b) => { for (let i = a; i <= b; i++) pages.push(i) };
    pages.push(1);
    if (current > 4) pages.push('...');
    addRange(Math.max(2, current - 2), Math.min(total - 1, current + 2));
    if (current < total - 3) pages.push('...');
    pages.push(total);
    return [...new Set(pages)];
};

const PageBtn = ({ label, active, disabled, onClick, wide }) => (
    <button
        onClick={disabled ? undefined : onClick}
        style={{
            minWidth: wide ? 'auto' : 34,
            height: 34,
            padding: wide ? '0 0.75rem' : '0 6px',
            borderRadius: '0.45rem',
            border: active ? '1px solid #e8950a' : '1px solid #1e3254',
            background: active ? '#e8950a' : disabled ? 'transparent' : '#111f3a',
            color: active ? '#080f1e' : disabled ? '#2a3f5a' : '#a8bcd4',
            cursor: disabled ? 'default' : 'pointer',
            fontSize: '0.82rem',
            fontFamily: 'Be Vietnam Pro, sans-serif',
            fontWeight: active ? 700 : 400,
            transition: 'background 0.15s, border-color 0.15s',
            lineHeight: 1,
            whiteSpace: 'nowrap',
        }}
        onMouseEnter={(e) => { if (!active && !disabled) (e.currentTarget).style.background = '#1e3254' }}
        onMouseLeave={(e) => { if (!active && !disabled) (e.currentTarget).style.background = '#111f3a' }}
    >
        {label}
    </button>
);

export default function Pagination({ page, totalPages, setPage }) {
    if (totalPages <= 1) return null;

    return (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
            <PageBtn label="← Trước" disabled={page === 1} onClick={() => setPage(p => p - 1)} wide />
            {buildPageNumbers(page, totalPages).map((item, i) =>
                item === '...'
                    ? <span key={`e${i}`} style={{ color: '#4a6080', fontSize: '0.82rem', padding: '0 4px', lineHeight: '34px' }}>...</span>
                    : <PageBtn key={item} label={String(item)} active={item === page} onClick={() => setPage(item)} />
            )}
            <PageBtn label="Sau →" disabled={page === totalPages} onClick={() => setPage(p => p + 1)} wide />
        </div>
    );
}