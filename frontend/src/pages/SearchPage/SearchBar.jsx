import React from 'react';

export default function SearchBar({ query, setQuery, setPage }) {
    return (
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <div style={{ flex: 1, position: 'relative' }}>
                <span style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#4a6080', fontSize: '0.95rem' }}>📖</span>
                <input
                    className="input-field"
                    placeholder="Tìm tên truyện, tác giả..."
                    value={query}
                    onChange={(e) => { setQuery(e.target.value); setPage(1) }}
                    onKeyDown={(e) => e.key === 'Enter' && setPage(1)}
                    style={{ paddingLeft: '2.5rem', fontSize: '0.9rem' }}
                />
            </div>
            <button
                onClick={() => setPage(1)}
                style={{
                    padding: '0 1.5rem',
                    background: 'linear-gradient(135deg, #3b82f6, #7c3aed)',
                    border: 'none',
                    borderRadius: '0.6rem',
                    color: '#fff',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontFamily: 'Be Vietnam Pro, sans-serif',
                    whiteSpace: 'nowrap',
                }}
            >
                Tìm
            </button>
        </div>
    );
}