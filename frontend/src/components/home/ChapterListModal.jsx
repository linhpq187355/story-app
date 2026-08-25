import { useEffect, useState } from 'react';
import { publicStoryService } from '../../services/publicStoryService';

const ChapterCell = ({ chapter, onRead }) => {
  const accessTag =
    chapter.accessLevel === 'MEMBER'
      ? { label: 'Đăng nhập', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.3)' }
      : chapter.accessLevel === 'VIP'
      ? { label: 'VIP', color: '#a78bfa', bg: 'rgba(167,139,250,0.12)', border: 'rgba(167,139,250,0.3)' }
      : null;

  return (
    <div
      onClick={() => onRead(chapter.id)}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '0.5rem',
        padding: '0.6rem 0.75rem',
        background: '#0d1b33',
        border: '1px solid #1e3254',
        borderRadius: '0.55rem',
        cursor: 'pointer',
        transition: 'border-color 0.15s, background 0.15s',
        minWidth: 0,
      }}
    >
      <span style={{ color: '#c8daf0', fontSize: '0.8rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, minWidth: 0 }}>
        Chương {chapter.chapterNumber}: {chapter.title}
      </span>
      {accessTag && (
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.68rem', fontWeight: 600, color: accessTag.color, background: accessTag.bg, border: `1px solid ${accessTag.border}`, borderRadius: '4px', padding: '1px 6px', flexShrink: 0, whiteSpace: 'nowrap' }}>
          🔒 {accessTag.label}
        </span>
      )}
    </div>
  );
};

export default function ChapterListModal({ storyId, currentChapterId, isOpen, onClose, onSelectChapter }) {
  const [chapters, setChapters] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchChapters(0);
    }
  }, [isOpen]);

  const fetchChapters = async (newPage) => {
    setIsLoading(true);
    try {
      const response = await publicStoryService.getChaptersByStoryId(storyId, {
        page: newPage,
        size: 50,
        sort: 'chapterNumber,asc',
      });
      setChapters(response.data.content);
      setPage(newPage);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error('Failed to fetch chapters:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ background: '#0d1b33', borderRadius: '0.75rem', width: '90%', maxWidth: '800px', maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #1e3254', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ color: '#dce8f5', fontSize: '1.1rem', fontWeight: 700 }}>Danh sách chương</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#a8bcd4', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
        </div>
        <div style={{ overflowY: 'auto', padding: '1rem 1.5rem' }}>
          {isLoading ? (
            <div style={{ textAlign: 'center', color: '#93c5fd' }}>Đang tải...</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.5rem' }}>
              {chapters.map((chapter) => (
                <ChapterCell key={chapter.id} chapter={chapter} onRead={onSelectChapter} />
              ))}
            </div>
          )}
        </div>
        <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid #1e3254', display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
          {Array.from({ length: totalPages }, (_, i) => i).map(pageNumber => (
            <button
              key={pageNumber}
              onClick={() => fetchChapters(pageNumber)}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '0.5rem',
                border: page === pageNumber ? '1px solid #3b82f6' : '1px solid #1e3254',
                background: page === pageNumber ? '#3b82f6' : '#111f3a',
                color: '#fff',
                cursor: 'pointer',
              }}
            >
              {pageNumber + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}