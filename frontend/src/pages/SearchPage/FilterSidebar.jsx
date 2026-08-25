import React, { useState, useEffect } from 'react';
import { publicGenreService } from '../../services/publicGenreService';
import { publicAuthorService } from '../../services/publicAuthorService';

const FilterSection = ({ title, open, onToggle, children }) => (
    <div style={{ borderBottom: '1px solid #1e3254', paddingBottom: '1rem', marginBottom: '1rem' }}>
        <button
            onClick={onToggle}
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', background: 'none', border: 'none', cursor: 'pointer', marginBottom: open ? '0.75rem' : 0, padding: 0 }}
        >
            <span style={{ color: '#e8950a', fontSize: '0.85rem', fontWeight: 700 }}>{title}</span>
            <span style={{ color: '#4a6080', fontSize: '0.75rem', transition: 'transform 0.2s', display: 'inline-block', transform: open ? 'rotate(0deg)' : 'rotate(-90deg)' }}>∧</span>
        </button>
        {open && children}
    </div>
);

const PillBtn = ({ label, active, dot, onClick }) => (
    <button
        onClick={onClick}
        style={{
            padding: '0.3rem 0.75rem',
            borderRadius: '999px',
            border: `1px solid ${active ? '#3b82f6' : '#1e3254'}`,
            background: active ? '#3b82f6' : 'transparent',
            color: active ? '#fff' : '#a8bcd4',
            fontSize: '0.78rem',
            cursor: 'pointer',
            fontFamily: 'Be Vietnam Pro, sans-serif',
            display: 'flex',
            alignItems: 'center',
            gap: '0.3rem',
            transition: 'all 0.15s',
            whiteSpace: 'nowrap',
        }}
    >
        {dot && <span style={{ width: 7, height: 7, borderRadius: '50%', background: dot, flexShrink: 0 }} />}
        {label}
    </button>
);

export default function FilterSidebar({
    status,
    setStatus,
    genre,
    setGenre,
    author,
    setAuthor,
    sort,
    setSort,
    resetFilters,
    setPage,
}) {
    const [statusOpen, setStatusOpen] = useState(true);
    const [genreOpen, setGenreOpen] = useState(true);
    const [authorOpen, setAuthorOpen] = useState(true);
    const [sortOpen, setSortOpen] = useState(true);
    const [genres, setGenres] = useState([]);
    const [authors, setAuthors] = useState([]);

    useEffect(() => {
        publicGenreService.getAllGenres().then(response => {
            setGenres(response.data);
        }).catch(error => {
            console.error("Failed to fetch genres:", error);
        });

        publicAuthorService.getAllAuthors().then(response => {
            setAuthors(response.data);
        }).catch(error => {
            console.error("Failed to fetch authors:", error);
        });
    }, []);

    return (
        <div className="panel" style={{ padding: '1.25rem', position: 'sticky', top: 76 }}>
            <FilterSection title="↗ Tình trạng" open={statusOpen} onToggle={() => setStatusOpen(o => !o)}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                    <PillBtn label="Toàn bộ" active={status === 'Toàn bộ'} onClick={() => { setStatus('Toàn bộ'); setPage(1) }} />
                    <PillBtn label="Đang ra" active={status === 'ONGOING'} dot="#22c55e" onClick={() => { setStatus('ONGOING'); setPage(1) }} />
                    <PillBtn label="Hoàn thành" active={status === 'COMPLETED'} dot="#a78bfa" onClick={() => { setStatus('COMPLETED'); setPage(1) }} />
                </div>
            </FilterSection>

            <FilterSection title="◈ Thể loại" open={genreOpen} onToggle={() => setGenreOpen(o => !o)}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                    <PillBtn label="Tất cả" active={genre === 'Tất cả'} onClick={() => { setGenre('Tất cả'); setPage(1) }} />
                    {genres.map((g) => (
                        <PillBtn key={g.id} label={g.name} active={genre === g.id} onClick={() => { setGenre(g.id); setPage(1) }} />
                    ))}
                </div>
            </FilterSection>

            <FilterSection title="◈ Tác giả" open={authorOpen} onToggle={() => setAuthorOpen(o => !o)}>
                <div style={{ position: 'relative' }}>
                    <select
                        value={author}
                        onChange={(e) => { setAuthor(e.target.value); setPage(1) }}
                        style={{
                            width: '100%',
                            padding: '0.5rem 2rem 0.5rem 0.75rem',
                            background: '#0d1b33',
                            border: '1px solid #1e3254',
                            borderRadius: '0.5rem',
                            color: author ? '#dce8f5' : '#4a6080',
                            fontSize: '0.82rem',
                            fontFamily: 'Be Vietnam Pro, sans-serif',
                            outline: 'none',
                            cursor: 'pointer',
                            appearance: 'none',
                        }}
                    >
                        <option value="">Chọn tác giả...</option>
                        {authors.map((a) => (
                            <option key={a.id} value={a.id} style={{ background: '#0d1b33' }}>{a.name}</option>
                        ))}
                    </select>
                    <span style={{ position: 'absolute', right: '0.6rem', top: '50%', transform: 'translateY(-50%)', color: '#4a6080', pointerEvents: 'none', fontSize: '0.7rem' }}>∨</span>
                </div>
                {author && (
                    <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                        <span style={{ background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.35)', color: '#60a5fa', fontSize: '0.72rem', padding: '2px 8px', borderRadius: '999px', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                            {authors.find(a => a.id.toString() === author)?.name}
                            <button onClick={() => setAuthor('')} style={{ background: 'none', border: 'none', color: '#60a5fa', cursor: 'pointer', padding: 0, lineHeight: 1, fontSize: '0.8rem' }}>×</button>
                        </span>
                    </div>
                )}
            </FilterSection>

            <FilterSection title="↕ Sắp xếp theo" open={sortOpen} onToggle={() => setSortOpen(o => !o)}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                    <PillBtn label="Mới nhất" active={sort === 'createdAt,desc'} onClick={() => { setSort('createdAt,desc'); setPage(1) }} />
                    <PillBtn label="Cũ nhất" active={sort === 'createdAt,asc'} onClick={() => { setSort('createdAt,asc'); setPage(1) }} />
                    <PillBtn label="Đọc nhiều nhất" active={sort === 'viewCount,desc'} onClick={() => { setSort('viewCount,desc'); setPage(1) }} />
                </div>
            </FilterSection>

            <button
                onClick={resetFilters}
                style={{
                    width: '100%',
                    marginTop: '0.25rem',
                    padding: '0.6rem',
                    background: 'none',
                    border: '1px solid #1e3254',
                    borderRadius: '0.5rem',
                    color: '#7a96b8',
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    fontFamily: 'Be Vietnam Pro, sans-serif',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.4rem',
                    transition: 'border-color 0.15s, color 0.15s',
                }}
                onMouseEnter={(e) => { (e.currentTarget).style.borderColor = '#f87171'; (e.currentTarget).style.color = '#f87171' }}
                onMouseLeave={(e) => { (e.currentTarget).style.borderColor = '#1e3254'; (e.currentTarget).style.color = '#7a96b8' }}
            >
                ↺ Xoá tất cả bộ lọc
            </button>
        </div>
    );
}