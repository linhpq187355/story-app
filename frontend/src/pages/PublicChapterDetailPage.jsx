import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { publicStoryService } from '../services/publicStoryService';
import HomeNavbar from '../components/home/HomeNavbar';
import ChapterListModal from '../components/home/ChapterListModal';

const LockedContent = ({ accessLevel, onLogin }) => {
  const message = accessLevel === 'MEMBER'
    ? 'Vui lòng đăng nhập để đọc chương này.'
    : 'Chương này yêu cầu quyền truy cập VIP.';

  return (
    <div style={{
      textAlign: 'center',
      padding: '4rem 2rem',
      background: 'rgba(0,0,0,0.2)',
      borderRadius: '0.75rem',
      border: '1px dashed #1e3254',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '1rem'
    }}>
      <span style={{ fontSize: '3rem' }}>🔒</span>
      <p style={{ color: '#a8bcd4', fontSize: '1rem' }}>{message}</p>
      {accessLevel === 'MEMBER' && (
        <button
          onClick={onLogin}
          className="btn-primary"
          style={{ padding: '0.6rem 1.5rem', borderRadius: '0.6rem', fontSize: '0.9rem' }}
        >
          Đăng nhập
        </button>
      )}
    </div>
  );
};

export default function PublicChapterDetailPage() {
  const { storyId, chapterId } = useParams();
  const navigate = useNavigate();
  const [chapter, setChapter] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [fontSize, setFontSize] = useState(16);
  const [bgMode, setBgMode] = useState('dark');
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchChapter = async () => {
      setIsLoading(true);
      setError('');
      try {
        const response = await publicStoryService.getChapterById(storyId, chapterId);
        setChapter(response.data);
        // Always attempt to record chapter view, regardless of content access
        publicStoryService.recordChapterView(chapterId).catch(err => console.error("Failed to record chapter view:", err));
      } catch (err) {
        setError('Không thể tải nội dung chương. Vui lòng thử lại.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchChapter();
  }, [storyId, chapterId]);

  const handleNavigate = (newChapterId) => {
    if (newChapterId) {
      navigate(`/stories/${storyId}/chapters/${newChapterId}`);
    }
  };

  const handleSelectChapter = (selectedChapterId) => {
    setIsModalOpen(false);
    handleNavigate(selectedChapterId);
  };

  const bgStyles = {
    dark: { background: '#080f1e', color: '#c8daf0' },
    sepia: { background: '#fbf3e4', color: '#5a4d3c' },
    light: { background: '#ffffff', color: '#2a2a2a' },
  };

  if (isLoading) {
    return <div style={{ background: '#080f1e', minHeight: '100vh', color: '#93c5fd', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Đang tải chương...</div>;
  }

  if (error) {
    return <div style={{ background: '#080f1e', minHeight: '100vh', color: '#fecaca', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{error}</div>;
  }

  if (!chapter) {
    return <div style={{ background: '#080f1e', minHeight: '100vh', color: '#93c5fd', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Không tìm thấy chương.</div>;
  }

  return (
    <div style={{ ...bgStyles[bgMode], minHeight: '100vh' }}>
      <HomeNavbar />
      <div
        style={{
          background: bgMode === 'light' ? '#e8e8e0' : '#0d1b33',
          borderBottom: `1px solid ${bgMode === 'light' ? '#ccc' : '#1e3254'}`,
          padding: '0.6rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          position: 'sticky',
          top: 0,
          zIndex: 50,
        }}
      >
        <button
          onClick={() => navigate(`/stories/${storyId}`)}
          style={{ background: 'none', border: 'none', color: '#60a5fa', cursor: 'pointer', fontSize: '0.85rem', fontFamily: 'Be Vietnam Pro, sans-serif', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
        >
          ← {chapter.storyTitle}
        </button>
        <div style={{ flex: 1, textAlign: 'center' }}>
          <span style={{ color: bgMode === 'light' ? '#555' : '#7a96b8', fontSize: '0.85rem' }}>
            Chương {chapter.chapterNumber}: {chapter.title}
          </span>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <button
            onClick={() => setFontSize((s) => Math.max(12, s - 2))}
            style={{ background: 'none', border: '1px solid #1e3254', color: '#a8bcd4', width: 30, height: 30, borderRadius: '0.4rem', cursor: 'pointer', fontSize: '0.8rem' }}
          >A-</button>
          <span style={{ color: '#7a96b8', fontSize: '0.8rem', width: 28, textAlign: 'center' }}>{fontSize}</span>
          <button
            onClick={() => setFontSize((s) => Math.min(24, s + 2))}
            style={{ background: 'none', border: '1px solid #1e3254', color: '#a8bcd4', width: 30, height: 30, borderRadius: '0.4rem', cursor: 'pointer', fontSize: '0.8rem' }}
          >A+</button>
          <div style={{ display: 'flex', gap: '0.3rem', marginLeft: '0.5rem' }}>
            {(['dark', 'sepia', 'light']).map((m) => (
              <button
                key={m}
                onClick={() => setBgMode(m)}
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: '50%',
                  border: bgMode === m ? '2px solid #3b82f6' : '2px solid #1e3254',
                  background: m === 'dark' ? '#080f1e' : m === 'sepia' ? '#fbf3e4' : '#ffffff',
                  cursor: 'pointer',
                }}
              />
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 780, margin: '0 auto', padding: '3rem 2rem' }}>
        <h1
          style={{
            fontFamily: 'Serif',
            fontSize: '1.4rem',
            fontWeight: 700,
            color: bgMode === 'light' ? '#333' : '#dce8f5',
            textAlign: 'center',
            marginBottom: '0.5rem',
          }}
        >
          Chương {chapter.chapterNumber}
        </h1>
        <h2
          style={{
            fontFamily: 'sans-serif',
            fontSize: '1rem',
            fontWeight: 500,
            color: bgMode === 'light' ? '#666' : '#7a96b8',
            textAlign: 'center',
            marginBottom: '3rem',
          }}
        >
          {chapter.title}
        </h2>

        {chapter.content ? (
          <div className="read-content" style={{ fontSize, color: bgStyles[bgMode].color, lineHeight: 1.8 }}
               dangerouslySetInnerHTML={{ __html: chapter.content.replace(/\n/g, '<br />') }}
          />
        ) : (
          <LockedContent accessLevel={chapter.accessLevel} onLogin={() => navigate('/login')} />
        )}

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '3rem',
            paddingTop: '2rem',
            borderTop: `1px solid ${bgMode === 'light' ? '#ccc' : '#1e3254'}`,
          }}
        >
          <button
            onClick={() => handleNavigate(chapter.previousChapterId)}
            disabled={!chapter.previousChapterId}
            style={{
              padding: '0.65rem 1.5rem',
              borderRadius: '0.6rem',
              border: '1px solid #1e3254',
              background: chapter.previousChapterId ? '#0d1b33' : 'transparent',
              color: chapter.previousChapterId ? '#60a5fa' : '#4a6080',
              cursor: chapter.previousChapterId ? 'pointer' : 'default',
              fontSize: '0.88rem',
              fontFamily: 'sans-serif',
            }}
          >
            ← Chương trước
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            style={{ background: 'none', border: 'none', color: '#7a96b8', cursor: 'pointer', fontSize: '0.85rem', fontFamily: 'sans-serif' }}
          >
            ☰ Danh sách chương
          </button>
          <button
            onClick={() => handleNavigate(chapter.nextChapterId)}
            disabled={!chapter.nextChapterId}
            style={{
              padding: '0.65rem 1.5rem',
              borderRadius: '0.6rem',
              border: '1px solid #1e3254',
              background: chapter.nextChapterId ? '#0d1b33' : 'transparent',
              color: chapter.nextChapterId ? '#60a5fa' : '#4a6080',
              cursor: chapter.nextChapterId ? 'pointer' : 'default',
              fontSize: '0.88rem',
              fontFamily: 'sans-serif',
            }}
          >
            Chương sau →
          </button>
        </div>
      </div>
      <ChapterListModal
        storyId={storyId}
        currentChapterId={chapterId}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelectChapter={handleSelectChapter}
      />
    </div>
  );
}