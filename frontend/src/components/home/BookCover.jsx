export default function BookCover({ book, width = 100, height = 140, badge, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        width,
        height,
        borderRadius: '0.5rem',
        overflow: 'hidden',
        position: 'relative',
        cursor: onClick ? 'pointer' : 'default',
        flexShrink: 0,
        boxShadow: '0 4px 20px rgba(0,0,0,0.6)',
      }}
    >
      <img
        src={book.cover}
        alt={book.title}
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 50%)',
        }}
      />
      {badge && (
        <div
          style={{
            position: 'absolute',
            top: 6,
            left: 6,
            background: badge === '#1' ? '#e8950a' : badge === 'De cu' ? '#7c3aed' : '#1e3254',
            color: 'white',
            fontSize: '0.65rem',
            fontWeight: 700,
            padding: '2px 6px',
            borderRadius: '4px',
          }}
        >
          {badge}
        </div>
      )}
      <div
        style={{
          position: 'absolute',
          bottom: 4,
          left: 4,
          right: 4,
          fontSize: '0.65rem',
          color: '#dce8f5',
          fontWeight: 600,
          textShadow: '0 1px 4px rgba(0,0,0,0.9)',
          lineHeight: 1.3,
        }}
      >
        {book.title}
      </div>
    </div>
  )
}
