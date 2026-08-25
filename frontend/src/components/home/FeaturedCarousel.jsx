import { useEffect, useMemo, useState } from 'react'
import BookCover from './BookCover'

export default function FeaturedCarousel({ books, onSelectStory }) {
  const [idx, setIdx] = useState(0)
  const featured = useMemo(() => books.slice(0, 5), [books])
  const activeBook = featured[idx]

  useEffect(() => {
    if (!featured.length) return undefined
    const timer = setInterval(() => {
      setIdx((prev) => (prev + 1) % featured.length)
    }, 4000)
    return () => clearInterval(timer)
  }, [featured.length])

  if (!activeBook) return null

  return (
    <div className="panel" style={{ flex: 1, padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
      <h3 style={{ color: '#dce8f5', fontWeight: 700, fontSize: '1.5rem', fontFamily: 'Serif' }}>
        Truyện hot
      </h3>

      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', position: 'relative', height: 220, width: '100%' }}>
        {[-2, -1, 0, 1, 2].map((offset) => {
          const i = (idx + offset + featured.length) % featured.length
          if (!featured[i]) return null; // Add a guard for safety

          const isCenter = offset === 0
          const scale = isCenter ? 1 : Math.abs(offset) === 1 ? 0.82 : 0.68
          const zIndex = isCenter ? 10 : Math.abs(offset) === 1 ? 5 : 1
          const translateX = offset * 80
          const translateY = isCenter ? 0 : Math.abs(offset) === 1 ? 20 : 35
          const opacity = Math.abs(offset) > 1 ? 0.6 : 1

          return (
            <div
              key={featured[i].id} // Use a stable key for smooth transitions
              onClick={() => setIdx(i)}
              style={{
                position: 'absolute',
                transform: `translateX(${translateX}px) translateY(${translateY}px) scale(${scale})`,
                zIndex,
                opacity,
                transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                cursor: 'pointer',
              }}
            >
              <BookCover
                book={featured[i]}
                width={isCenter ? 130 : 100}
                height={isCenter ? 185 : 142}
                badge={isCenter && featured[i].rank ? `#${featured[i].rank}` : undefined}
              />
            </div>
          )
        })}
      </div>

      <div style={{ display: 'flex', gap: '6px' }}>
        {featured.map((item, i) => (
          <button
            key={item.id}
            onClick={() => setIdx(i)}
            style={{
              width: i === idx ? 20 : 6,
              height: 6,
              borderRadius: 3,
              border: 'none',
              background: i === idx ? '#3b82f6' : '#1e3254',
              cursor: 'pointer',
              transition: 'width 0.3s, background 0.3s',
              padding: 0,
            }}
          />
        ))}
      </div>

      <div style={{ textAlign: 'center', maxWidth: 360 }}>
        <h3 style={{ color: '#dce8f5', fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.4rem' }}>{activeBook.title}</h3>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
          {activeBook.genre.map((g) => (
            <span key={g} className="tag">{g}</span>
          ))}
          <span className="tag">{activeBook.status}</span>
          <span style={{ color: '#7a96b8', fontSize: '0.78rem' }}>Tác giả: {activeBook.author}</span>
        </div>
        <p style={{ color: '#7a96b8', fontSize: '0.82rem', lineHeight: 1.6 }}>
          {activeBook.desc.slice(0, 140)}...
        </p>
        <button
          className="btn-primary"
          onClick={() => onSelectStory?.(activeBook)}
          style={{ marginTop: '1rem', padding: '0.6rem 1.2rem', borderRadius: '0.6rem', fontSize: '0.88rem' }}
        >
          Đọc truyện
        </button>
      </div>
    </div>
  )
}