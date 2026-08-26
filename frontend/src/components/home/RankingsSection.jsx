import React from 'react';
import { useNavigate } from 'react-router-dom';
import { publicStoryService } from '../../services/publicStoryService';
import { FaFeatherAlt } from 'react-icons/fa';

const DEFAULT_COVER = 'https://images.unsplash.com/photo-1526243741027-444d633d7365?w=300&h=420&fit=crop&auto=format';

const RankBadge = ({ rank }) => {
  const isTop3 = rank <= 3;

  return (
    <div
      style={{
        width: 24,
        height: 24,
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '4px',
          transform: 'rotate(45deg)',
          background: isTop3
            ? 'linear-gradient(135deg, #d946ef 0%, #8b5cf6 100%)'
            : 'rgba(30, 50, 84, 0.6)',
          boxShadow: isTop3 ? '0 2px 8px rgba(217, 70, 239, 0.4)' : 'none',
        }}
      />
      <span
        style={{
          position: 'relative',
          zIndex: 1,
          color: isTop3 ? '#ffffff' : '#64748b',
          fontSize: '0.75rem',
          fontWeight: 700,
        }}
      >
        {rank}
      </span>
    </div>
  );
};

const RankingColumn = ({ title, items = [], onSelectStory }) => {
  const topItem = items[0];
  const otherItems = items.slice(1, 10);

  const getCoverUrl = (imageUrl) => {
    if (!imageUrl) return DEFAULT_COVER;
    return imageUrl;
  };

  return (
    <div
      className="panel"
      style={{
        padding: '1rem',
        background: '#0d1b33',
        border: '1px solid #1e3254',
        borderRadius: '0.75rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.65rem',
        minWidth: 0,
        overflow: 'hidden',
        boxSizing: 'border-box',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', minWidth: 0 }}>
        <h3
          style={{
            color: '#f59e0b',
            fontSize: '0.85rem',
            fontWeight: 800,
            letterSpacing: '0.5px',
            textTransform: 'uppercase',
            margin: 0,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {title}
        </h3>
        <button
          onClick={() => onSelectStory(null)}
          style={{
            background: 'none',
            border: 'none',
            color: '#60a5fa',
            fontSize: '0.75rem',
            cursor: 'pointer',
            flexShrink: 0,
          }}
        >
          Xem tất cả
        </button>
      </div>

      {/* Top 1 Featured Card */}
      {topItem && (
        <div
          onClick={() => onSelectStory(topItem.id)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            padding: '0.55rem',
            background: 'linear-gradient(135deg, #111f3a 0%, #172a4d 100%)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            borderRadius: '0.55rem',
            cursor: 'pointer',
            minWidth: 0,
            boxSizing: 'border-box',
            transition: 'transform 0.15s, border-color 0.15s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#3b82f6';
            e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.3)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <RankBadge rank={1} />

          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
            <h4
              style={{
                color: '#ffffff',
                fontSize: '0.82rem',
                fontWeight: 700,
                margin: 0,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {topItem.title}
            </h4>
            <p
              style={{
                color: '#cbd5e1',
                fontSize: '0.72rem',
                margin: 0,
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              <FaFeatherAlt style={{ fontSize: '0.6rem', color: '#f59e0b', flexShrink: 0 }} />
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {topItem.authorName || 'Đang cập nhật'}
              </span>
            </p>
            <p style={{ color: '#94a3b8', fontSize: '0.7rem', margin: 0 }}>
              {topItem.formattedValue}
            </p>
          </div>

          <div
            style={{
              width: 44,
              height: 62,
              flexShrink: 0,
              borderRadius: '0.35rem',
              overflow: 'hidden',
              boxShadow: '0 4px 10px rgba(0,0,0,0.5)',
            }}
          >
            <img
              src={getCoverUrl(topItem.coverImageUrl)}
              alt={topItem.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          </div>
        </div>
      )}

      {/* Ranks 2 - 10 List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', minWidth: 0 }}>
        {otherItems.map((item) => (
          <div
            key={item.id}
            onClick={() => onSelectStory(item.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.5rem',
              padding: '0.3rem 0.35rem',
              borderRadius: '0.4rem',
              cursor: 'pointer',
              minWidth: 0,
              transition: 'background 0.12s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#111f3a';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', minWidth: 0, flex: 1 }}>
              <RankBadge rank={item.rank} />
              <span
                style={{
                  color: '#dce8f5',
                  fontSize: '0.78rem',
                  fontWeight: 500,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {item.title}
              </span>
            </div>

            <span style={{ color: '#64748b', fontSize: '0.72rem', flexShrink: 0, fontWeight: 500 }}>
              {item.formattedValue}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function RankingsSection({ rankings }) {
  const navigate = useNavigate();

  const handleSelectStory = (storyId) => {
    if (storyId) {
      navigate(`/stories/${storyId}`);
    } else {
      navigate('/search');
    }
  };

  const topRated = rankings?.topRated || [];
  const topFollowed = rankings?.topFollowed || [];
  const topViewed = rankings?.topViewed || [];

  return (
    <div style={{ marginTop: '1.5rem', marginBottom: '2rem', width: '100%', boxSizing: 'border-box' }}>
      <h2
        style={{
          color: '#ffffff',
          fontSize: '1.3rem',
          fontWeight: 700,
          marginBottom: '1rem',
          fontFamily: 'serif, sans-serif',
        }}
      >
        Bảng xếp hạng
      </h2>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '1rem',
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        <RankingColumn
          title="TOP ĐÁNH GIÁ"
          items={topRated}
          onSelectStory={handleSelectStory}
        />
        <RankingColumn
          title="TOP THEO DÕI"
          items={topFollowed}
          onSelectStory={handleSelectStory}
        />
        <RankingColumn
          title="TOP LƯỢT ĐỌC"
          items={topViewed}
          onSelectStory={handleSelectStory}
        />
      </div>
    </div>
  );
}
