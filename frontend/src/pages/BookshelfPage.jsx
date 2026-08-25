import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, useOutletContext } from 'react-router-dom';
import { publicStoryService } from '../services/publicStoryService';
import { userService } from '../services/userService';
import { FaBookOpen, FaTrashAlt } from 'react-icons/fa';

export default function BookshelfPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const outletCtx = useOutletContext() || {};
  const loggedIn = outletCtx.loggedIn ?? Boolean(localStorage.getItem('token'));

  const activeTab = searchParams.get('tab') === 'history' ? 'history' : 'following';

  const [followingStories, setFollowingStories] = useState([]);
  const [followingPage, setFollowingPage] = useState(0);
  const [followingTotalPages, setFollowingTotalPages] = useState(1);
  const [followingTotalElements, setFollowingTotalElements] = useState(0);

  const [recentlyReadStories, setRecentlyReadStories] = useState([]);
  const [historyPage, setHistoryPage] = useState(0);
  const [historyTotalPages, setHistoryTotalPages] = useState(1);
  const [historyTotalElements, setHistoryTotalElements] = useState(0);

  const [isLoading, setIsLoading] = useState(true);

  const PAGE_SIZE = 12;

  const handleTabChange = (tabName) => {
    if (tabName === 'history') {
      setSearchParams({ tab: 'history' });
    } else {
      setSearchParams({});
    }
  };

  const fetchFollowing = async (page = 0) => {
    try {
      const res = await publicStoryService.getUserFavoriteStories({ page, size: PAGE_SIZE });
      const data = res.data || {};
      setFollowingStories(data.content || []);
      setFollowingTotalPages(data.totalPages || 1);
      setFollowingTotalElements(data.totalElements || 0);
      setFollowingPage(data.number || 0);
    } catch (err) {
      console.error("Failed to fetch favorite stories:", err);
    }
  };

  const fetchRecentlyRead = async (page = 0) => {
    try {
      const res = await userService.getRecentlyReadStories({ page, size: PAGE_SIZE });
      const data = res.data || {};
      setRecentlyReadStories(data.content || []);
      setHistoryTotalPages(data.totalPages || 1);
      setHistoryTotalElements(data.totalElements || 0);
      setHistoryPage(data.number || 0);
    } catch (err) {
      console.error("Failed to fetch recently read stories:", err);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      if (activeTab === 'following') {
        await fetchFollowing(followingPage);
      } else {
        await fetchRecentlyRead(historyPage);
      }
      setIsLoading(false);
    };
    loadData();
  }, [activeTab, followingPage, historyPage]);

  const handleRemoveFavorite = async (e, storyId) => {
    e.stopPropagation();
    try {
      await publicStoryService.toggleFavorite(storyId);
      fetchFollowing(followingPage);
    } catch (err) {
      console.error("Failed to remove favorite:", err);
    }
  };

  const handlePageChange = (newPage) => {
    if (activeTab === 'following') {
      setFollowingPage(newPage);
    } else {
      setHistoryPage(newPage);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const currentList = activeTab === 'following' ? followingStories : recentlyReadStories;
  const currentPage = activeTab === 'following' ? followingPage : historyPage;
  const totalPages = activeTab === 'following' ? followingTotalPages : historyTotalPages;
  const totalElements = activeTab === 'following' ? followingTotalElements : historyTotalElements;

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem 1.5rem', width: '100%', boxSizing: 'border-box', color: '#c8daf0', fontFamily: 'Be Vietnam Pro, sans-serif' }}>
        {/* Banner Header */}
        <div
          style={{
            background: 'linear-gradient(135deg, #112347 0%, #0a162b 100%)',
            border: '1px solid #1e355e',
            borderRadius: '1rem',
            padding: '1.75rem 2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '2rem',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          }}
        >
          <div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 700, color: '#f59e0b', margin: 0, display: 'flex', alignItems: 'center', gap: '0.6rem', fontFamily: 'Merriweather, serif' }}>
              ❖ Kệ sách của tôi
            </h1>
            <p style={{ color: '#7a96b8', fontSize: '0.9rem', marginTop: '0.4rem', margin: 0 }}>
              Nơi lưu giữ hành trình đọc truyện của bạn
            </p>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '2.5rem', fontWeight: 800, color: '#f59e0b', lineHeight: 1 }}>
              {totalElements}
            </span>
            <p style={{ fontSize: '0.72rem', fontWeight: 700, color: '#60a5fa', letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: '0.2rem', margin: 0 }}>
              {activeTab === 'following' ? 'TRUYỆN ĐANG THEO DÕI' : 'TRUYỆN VỪA ĐỌC'}
            </p>
          </div>
        </div>

        {/* Tabs Bar */}
        <div style={{ display: 'flex', gap: '1.5rem', borderBottom: '1px solid #1e3254', marginBottom: '1.5rem', paddingBottom: '0.2rem' }}>
          <button
            onClick={() => handleTabChange('following')}
            style={{
              background: 'none',
              border: 'none',
              borderBottom: `2px solid ${activeTab === 'following' ? '#f59e0b' : 'transparent'}`,
              color: activeTab === 'following' ? '#f59e0b' : '#7a96b8',
              fontWeight: activeTab === 'following' ? 700 : 500,
              fontSize: '0.95rem',
              padding: '0.6rem 0.4rem',
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            Đang theo dõi ({followingTotalElements})
          </button>
          <button
            onClick={() => handleTabChange('history')}
            style={{
              background: 'none',
              border: 'none',
              borderBottom: `2px solid ${activeTab === 'history' ? '#f59e0b' : 'transparent'}`,
              color: activeTab === 'history' ? '#f59e0b' : '#7a96b8',
              fontWeight: activeTab === 'history' ? 700 : 500,
              fontSize: '0.95rem',
              padding: '0.6rem 0.4rem',
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            Vừa đọc ({historyTotalElements})
          </button>
        </div>

        {/* Content Section */}
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '4rem 0', color: '#60a5fa' }}>
            Đang tải kệ sách của bạn...
          </div>
        ) : currentList.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '4rem 2rem',
              background: '#0d1b33',
              border: '1px dashed #1e3254',
              borderRadius: '1rem',
            }}
          >
            <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}>📚</span>
            <h3 style={{ color: '#dce8f5', fontSize: '1.1rem', fontWeight: 600, margin: '0 0 0.5rem' }}>
              {activeTab === 'following' ? 'Bạn chưa theo dõi bộ truyện nào' : 'Bạn chưa có lịch sử đọc truyện'}
            </h3>
            <p style={{ color: '#7a96b8', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
              {activeTab === 'following'
                ? 'Hãy bấm nút "Thêm vào yêu thích" ở trang chi tiết truyện để lưu vào kệ nhé!'
                : 'Khám phá ngay các bộ truyện hấp dẫn để bắt đầu đọc.'}
            </p>
            <button
              onClick={() => navigate('/')}
              className="btn-primary"
              style={{ padding: '0.6rem 1.4rem', borderRadius: '0.6rem', fontSize: '0.88rem' }}
            >
              Khám phá ngay
            </button>
          </div>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
              {currentList.map((story) => {
                const storyId = story.storyId || story.id;
                const cover = publicStoryService.buildCoverUrl(story.coverImageUrl);
                const hasRead = Boolean(story.lastReadChapterId);
                const targetChapterId = story.lastReadChapterId || story.firstChapterId;

                const progressText = hasRead
                  ? `Đã đọc Chương ${story.lastReadChapterNumber}`
                  : 'Chưa đọc chương nào';

                const btnLabel = hasRead
                  ? `Đọc tiếp - Chương ${story.lastReadChapterNumber}`
                  : 'Đọc từ đầu';

                const handleReadClick = () => {
                  if (targetChapterId) {
                    navigate(`/stories/${storyId}/chapters/${targetChapterId}`);
                  } else {
                    navigate(`/stories/${storyId}`);
                  }
                };

                return (
                  <div
                    key={storyId}
                    style={{
                      background: '#0d1b33',
                      border: '1px solid #1e3254',
                      borderRadius: '0.85rem',
                      padding: '0.85rem',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      transition: 'border-color 0.2s, transform 0.2s',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#3b82f6';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#1e3254';
                    }}
                  >
                    {/* Card Header Content */}
                    <div
                      onClick={() => navigate(`/stories/${storyId}`)}
                      style={{ display: 'flex', gap: '0.85rem', cursor: 'pointer', marginBottom: '0.85rem' }}
                    >
                      <img
                        src={cover}
                        alt={story.title}
                        style={{
                          width: 72,
                          height: 100,
                          objectFit: 'cover',
                          borderRadius: '0.5rem',
                          border: '1px solid #1e3254',
                          flexShrink: 0,
                        }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h3
                          style={{
                            color: '#dce8f5',
                            fontSize: '0.92rem',
                            fontWeight: 700,
                            margin: '0 0 0.3rem',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            lineHeight: 1.35,
                          }}
                        >
                          {story.title}
                        </h3>
                        <p style={{ color: '#7a96b8', fontSize: '0.78rem', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {story.authorName || 'Chưa cập nhật'}
                        </p>
                      </div>
                    </div>

                    {/* Reading Status Progress */}
                    <div style={{ borderTop: '1px solid #1e3254', borderBottom: '1px solid #1e3254', padding: '0.5rem 0', marginBottom: '0.75rem' }}>
                      <p style={{ color: hasRead ? '#60a5fa' : '#4a6080', fontSize: '0.76rem', fontWeight: hasRead ? 600 : 400, fontStyle: hasRead ? 'normal' : 'italic', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {progressText}
                      </p>
                    </div>

                    {/* Footer Actions */}
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <button
                        onClick={handleReadClick}
                        style={{
                          flex: 1,
                          background: '#2563eb',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '0.55rem',
                          padding: '0.55rem 0.8rem',
                          fontSize: '0.82rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.4rem',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          transition: 'background 0.15s',
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = '#1d4ed8' }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = '#2563eb' }}
                      >
                        <FaBookOpen style={{ fontSize: '0.85rem', flexShrink: 0 }} /> {btnLabel}
                      </button>

                      {activeTab === 'following' && (
                        <button
                          onClick={(e) => handleRemoveFavorite(e, storyId)}
                          title="Bỏ theo dõi"
                          style={{
                            width: 36,
                            height: 34,
                            background: '#111f3a',
                            border: '1px solid #1e3254',
                            borderRadius: '0.55rem',
                            color: '#f87171',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                            transition: 'border-color 0.15s, background 0.15s',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = '#f87171';
                            e.currentTarget.style.background = 'rgba(248, 113, 113, 0.15)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = '#1e3254';
                            e.currentTarget.style.background = '#111f3a';
                          }}
                        >
                          <FaTrashAlt style={{ fontSize: '0.85rem' }} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', marginTop: '2.5rem' }}>
                <button
                  disabled={currentPage === 0}
                  onClick={() => handlePageChange(currentPage - 1)}
                  style={{
                    padding: '0.45rem 0.85rem',
                    borderRadius: '0.5rem',
                    background: currentPage === 0 ? '#0d1b33' : '#1e3254',
                    color: currentPage === 0 ? '#4a6080' : '#c8daf0',
                    border: '1px solid #1e3254',
                    cursor: currentPage === 0 ? 'not-allowed' : 'pointer',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    transition: 'all 0.15s'
                  }}
                >
                  « Trang trước
                </button>
                {Array.from({ length: totalPages }, (_, i) => i).map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: '0.5rem',
                      background: pageNum === currentPage ? '#2563eb' : '#0d1b33',
                      color: pageNum === currentPage ? '#ffffff' : '#7a96b8',
                      border: `1px solid ${pageNum === currentPage ? '#2563eb' : '#1e3254'}`,
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      transition: 'all 0.15s'
                    }}
                  >
                    {pageNum + 1}
                  </button>
                ))}
                <button
                  disabled={currentPage >= totalPages - 1}
                  onClick={() => handlePageChange(currentPage + 1)}
                  style={{
                    padding: '0.45rem 0.85rem',
                    borderRadius: '0.5rem',
                    background: currentPage >= totalPages - 1 ? '#0d1b33' : '#1e3254',
                    color: currentPage >= totalPages - 1 ? '#4a6080' : '#c8daf0',
                    border: '1px solid #1e3254',
                    cursor: currentPage >= totalPages - 1 ? 'not-allowed' : 'pointer',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    transition: 'all 0.15s'
                  }}
                >
                  Trang sau »
                </button>
              </div>
            )}
          </>
        )}
    </div>
  );
}
