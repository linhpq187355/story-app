import React from 'react';

export default function BookList({ books, setScreen, setCurrentBook, resetFilters }) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }}>
            {books.length === 0 ? (
                <div className="panel" style={{ padding: '3rem', textAlign: 'center' }}>
                    <p style={{ color: '#4a6080', fontSize: '1rem' }}>Không tìm thấy truyện phù hợp</p>
                    <button onClick={resetFilters} style={{ marginTop: '0.75rem', background: 'none', border: 'none', color: '#60a5fa', cursor: 'pointer', fontFamily: 'Be Vietnam Pro, sans-serif' }}>Xoá bộ lọc</button>
                </div>
            ) : books.map((book) => (
                <div
                    key={book.id}
                    onClick={() => { setCurrentBook(book); setScreen('story') }}
                    style={{
                        display: 'flex',
                        gap: '1rem',
                        background: '#0d1b33',
                        border: '1px solid #1e3254',
                        borderRadius: '0.75rem',
                        padding: '1rem',
                        cursor: 'pointer',
                        transition: 'border-color 0.15s, transform 0.15s',
                    }}
                    onMouseEnter={(e) => { const el = e.currentTarget; el.style.borderColor = '#3b82f6'; el.style.transform = 'translateY(-2px)' }}
                    onMouseLeave={(e) => { const el = e.currentTarget; el.style.borderColor = '#1e3254'; el.style.transform = 'translateY(0)' }}
                >
                    <div style={{ flexShrink: 0, borderRadius: '0.5rem', overflow: 'hidden', boxShadow: '0 4px 16px rgba(0,0,0,0.5)' }}>
                        <img src={book.cover} alt={book.title} style={{ width: 78, height: 108, objectFit: 'cover', display: 'block' }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                        <h3 style={{ color: '#dce8f5', fontSize: '1rem', fontWeight: 700, lineHeight: 1.35 }}>{book.title}</h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                            <span style={{ color: '#7a96b8', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                <span style={{ fontSize: '0.75rem' }}>👤</span> {book.author}
                            </span>
                            <span style={{ color: '#7a96b8', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                <span style={{ fontSize: '0.75rem' }}>◈</span>
                                {book.genre.slice(0, 2).join(', ')}
                            </span>
                            <span style={{ fontSize: '0.72rem', color: book.status === 'Hoàn thành' ? '#22c55e' : book.status === 'Tạm dừng' ? '#f87171' : '#e8950a', fontWeight: 500 }}>
                                ● {book.status}
                            </span>
                        </div>
                        <p style={{ color: '#7a96b8', fontSize: '0.82rem', lineHeight: 1.6, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                            {book.desc}
                        </p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginTop: 'auto', paddingTop: '0.2rem' }}>
                            <span style={{ color: '#4a6080', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                🕐 18/08/2026
                            </span>
                            <span style={{ color: '#f5b942', fontSize: '0.75rem' }}>★ {book.rating}</span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}