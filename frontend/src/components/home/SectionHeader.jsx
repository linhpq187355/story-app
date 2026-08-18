export default function SectionHeader({ title, onSeeAll }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
      <h2 className="gold-label" style={{ fontSize: '0.85rem' }}>{title}</h2>
      {onSeeAll && (
        <button
          onClick={onSeeAll}
          style={{ background: 'none', border: 'none', color: '#60a5fa', fontSize: '0.78rem', cursor: 'pointer' }}
        >
          Tat ca {'>'}
        </button>
      )}
    </div>
  )
}
