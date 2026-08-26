import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams, useOutletContext } from 'react-router-dom'
import SectionHeader from '../components/home/SectionHeader'
import { publicStoryService } from '../services/publicStoryService'
import { userService } from '../services/userService'
import { coinService } from '../services/coinService'
import { getErrorMessage } from '../utils/errorHandler'
import '../styles/homepage.css'
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { FaStar, FaRegStar, FaReply, FaTrashAlt, FaCommentDots, FaHeart, FaRegHeart } from 'react-icons/fa';

const ChapterCell = ({ chapter, onRead }) => {
  const accessTag =
    chapter.accessLevel === 'MEMBER'
      ? { label: 'Đăng nhập', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.3)' }
      : chapter.accessLevel === 'VIP'
      ? { label: 'VIP', color: '#a78bfa', bg: 'rgba(167,139,250,0.12)', border: 'rgba(167,139,250,0.3)' }
      : null

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
      onMouseEnter={(e) => {
        const el = e.currentTarget
        el.style.borderColor = '#3b82f6'
        el.style.background = '#111f3a'
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget
        el.style.borderColor = '#1e3254'
        el.style.background = '#0d1b33'
      }}
    >
      <span
        style={{
          color: '#c8daf0',
          fontSize: '0.8rem',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          flex: 1,
          minWidth: 0,
        }}
      >
        Chương {chapter.chapterNumber}: {chapter.title}
      </span>
      {accessTag && (
        <span
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.2rem',
            fontSize: '0.68rem',
            fontWeight: 600,
            color: accessTag.color,
            background: accessTag.bg,
            border: `1px solid ${accessTag.border}`,
            borderRadius: '4px',
            padding: '1px 6px',
            flexShrink: 0,
            whiteSpace: 'nowrap',
          }}
        >
          🔒 {accessTag.label}
        </span>
      )}
    </div>
  )
}

function buildPageNumbers(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)

  const pages = [1]
  const left = Math.max(2, current - 2)
  const right = Math.min(total - 1, current + 2)

  if (left > 2) pages.push('...')
  for (let i = left; i <= right; i += 1) pages.push(i)
  if (right < total - 1) pages.push('...')

  pages.push(total)
  return pages
}

export default function PublicStoryDetailPage() {
  const { storyId } = useParams()
  const navigate = useNavigate()

  const [story, setStory] = useState(null)
  const [relatedStories, setRelatedStories] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  const [chapters, setChapters] = useState([])
  const [isLoadingChapters, setIsLoadingChapters] = useState(false)
  const [chapterPage, setChapterPage] = useState(1)
  const [totalChapterPages, setTotalChapterPages] = useState(1)
  const [chapterSort, setChapterSort] = useState('chapterNumber,asc')
  const [readingProgress, setReadingProgress] = useState(null);

  // Rating State
  const [ratingData, setRatingData] = useState({ averageRating: 0, totalRatings: 0, userRating: null })
  const [hoverStar, setHoverStar] = useState(0)
  const [isRatingSubmitting, setIsRatingSubmitting] = useState(false)

  // Favorite State
  const [favoriteData, setFavoriteData] = useState({ isFavorite: false, totalFavorites: 0 })
  const [isFavoriteSubmitting, setIsFavoriteSubmitting] = useState(false)

  // Comments State
  const [comments, setComments] = useState([])
  const [isLoadingComments, setIsLoadingComments] = useState(false)
  const [commentPage, setCommentPage] = useState(1)
  const [totalCommentPages, setTotalCommentPages] = useState(1)
  const [newCommentText, setNewCommentText] = useState('')
  const [replyingToId, setReplyingToId] = useState(null)
  const [replyText, setReplyText] = useState('')
  const [commentError, setCommentError] = useState('')
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)

  const [tab, setTab] = useState('info')
  const outletCtx = useOutletContext() || {}
  const search = outletCtx.search || ''
  const loggedIn = outletCtx.loggedIn ?? Boolean(localStorage.getItem('token'))

  const currentUser = userService.getCurrentUser();

  // Load Favorite Status
  useEffect(() => {
    if (!storyId) return;
    publicStoryService.getFavoriteStatus(storyId)
      .then(res => setFavoriteData(res.data))
      .catch(err => console.error("Failed to load favorite status:", err))
  }, [storyId, loggedIn])

  // Load Story Details & Related (Filtered by Genre)
  useEffect(() => {
    let isMounted = true
    const loadStoryData = async () => {
      setIsLoading(true)
      setErrorMessage('')
      try {
        const storyResponse = await publicStoryService.getStoryById(storyId)
        const detail = storyResponse?.data
        if (!detail) throw new Error('NOT_FOUND')

        // Fetch stories of the SAME genre
        let relatedList = []
        try {
          const relatedResponse = await publicStoryService.getStories({
            genreId: detail.genreId,
            page: 0,
            size: 16,
            sort: 'createdAt,desc',
          })
          relatedList = (relatedResponse?.data?.content || []).filter((item) => item.id !== detail.id)
        } catch (e) {
          console.error("Failed to fetch same-genre stories:", e)
        }

        // Fallback to latest stories if same-genre items are less than 6
        if (relatedList.length < 6) {
          try {
            const fallbackResponse = await publicStoryService.getStories({ page: 0, size: 16, sort: 'createdAt,desc' })
            const fallbackItems = (fallbackResponse?.data?.content || []).filter(
              (item) => item.id !== detail.id && !relatedList.some((r) => r.id === item.id)
            )
            relatedList = [...relatedList, ...fallbackItems]
          } catch (e) {
            console.error("Failed to fetch fallback stories:", e)
          }
        }

        if (isMounted) {
          setStory(detail)
          setRelatedStories(relatedList)
        }
      } catch (error) {
        if (isMounted) setErrorMessage('Không thể tải chi tiết truyện. Vui lòng thử lại.')
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }
    loadStoryData()
    return () => { isMounted = false }
  }, [storyId])

  // Load Rating Summary
  useEffect(() => {
    if (!storyId) return;
    publicStoryService.getStoryRating(storyId)
      .then(res => setRatingData(res.data))
      .catch(err => console.error("Failed to load rating summary:", err))
  }, [storyId, loggedIn])

  // Load Reading Progress
  useEffect(() => {
    if (loggedIn && storyId) {
      publicStoryService.getReadingProgressForStory(storyId)
        .then(response => {
          if (response.data) {
            setReadingProgress(response.data);
          } else {
            setReadingProgress(null);
          }
        })
        .catch(err => {
          console.error("Failed to fetch reading progress:", err);
          setReadingProgress(null);
        });
    } else {
      setReadingProgress(null);
    }
  }, [loggedIn, storyId]);

  // Load Chapters
  useEffect(() => {
    if (!storyId) return;
    let isMounted = true
    const loadChapters = async () => {
      setIsLoadingChapters(true)
      try {
        const response = await publicStoryService.getChaptersByStoryId(storyId, {
          page: chapterPage - 1,
          size: 24,
          sort: chapterSort,
        })
        if (isMounted) {
          setChapters(response.data.content)
          setTotalChapterPages(response.data.totalPages)
        }
      } catch (error) {
        console.error('Failed to fetch chapters:', error)
      } finally {
        if (isMounted) setIsLoadingChapters(false)
      }
    }
    loadChapters()
    return () => { isMounted = false }
  }, [storyId, chapterPage, chapterSort])

  // Load Comments
  const loadComments = async () => {
    if (!storyId) return;
    setIsLoadingComments(true);
    try {
      const response = await publicStoryService.getStoryComments(storyId, {
        page: commentPage - 1,
        size: 10,
      });
      setComments(response.data.content);
      setTotalCommentPages(response.data.totalPages);
    } catch (err) {
      console.error("Failed to load comments:", err);
    } finally {
      setIsLoadingComments(false);
    }
  };

  useEffect(() => {
    if (tab === 'comments') {
      loadComments();
    }
  }, [storyId, commentPage, tab]);

  // Submit Rating
  const handleRate = async (score) => {
    if (!loggedIn) {
      navigate('/login');
      return;
    }
    setIsRatingSubmitting(true);
    try {
      const response = await publicStoryService.rateStory(storyId, score);
      setRatingData(response.data);
    } catch (err) {
      console.error("Failed to submit rating:", err);
    } finally {
      setIsRatingSubmitting(false);
    }
  };

  // Toggle Favorite
  const handleToggleFavorite = async () => {
    if (!loggedIn) {
      navigate('/login');
      return;
    }
    setIsFavoriteSubmitting(true);
    try {
      const response = await publicStoryService.toggleFavorite(storyId);
      setFavoriteData(response.data);
    } catch (err) {
      console.error("Failed to toggle favorite:", err);
    } finally {
      setIsFavoriteSubmitting(false);
    }
  };

  // Submit Comment / Reply
  const handlePostComment = async (parentCommentId = null) => {
    if (!loggedIn) {
      navigate('/login');
      return;
    }
    const text = parentCommentId ? replyText.trim() : newCommentText.trim();
    if (!text) return;

    setIsSubmittingComment(true);
    setCommentError('');
    try {
      await publicStoryService.addComment(storyId, {
        content: text,
        parentCommentId,
      });
      if (parentCommentId) {
        setReplyText('');
        setReplyingToId(null);
      } else {
        setNewCommentText('');
      }
      await loadComments();
    } catch (err) {
      setCommentError(getErrorMessage(err, 'Không thể gửi bình luận. Vui lòng thử lại.'));
    } finally {
      setIsSubmittingComment(false);
    }
  };

  // Delete Comment
  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa bình luận này?')) return;
    try {
      await publicStoryService.deleteComment(storyId, commentId);
      await loadComments();
    } catch (err) {
      alert(getErrorMessage(err, 'Không thể xóa bình luận.'));
    }
  };

  const chapterCount = useMemo(() => story?.chapterCount || 0, [story]);
  const latestChapter = useMemo(() => {
    if (!chapters || chapters.length === 0) return null;
    const sorted = [...chapters].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return sorted[0];
  }, [chapters]);

  const coverUrl = story?.coverImageUrl
    ? story.coverImageUrl
    : 'https://images.unsplash.com/photo-1526243741027-444d633d7365?w=300&h=420&fit=crop&auto=format'

  const statusLabel = publicStoryService.mapStatus(story?.status)

  const handleReadChapter = (chapterId) => {
    navigate(`/stories/${storyId}/chapters/${chapterId}`);
  };

  const [isPurchasingStory, setIsPurchasingStory] = useState(false);

  const handlePurchaseStory = async () => {
    if (!loggedIn) {
      navigate('/login');
      return;
    }
    if (story?.isPurchased) {
      alert('Bạn đã sở hữu trọn bộ truyện này!');
      return;
    }
    const confirmed = window.confirm(
      `Bạn có muốn dùng ${story.coinPrice} xu để mở khóa toàn bộ các chương của truyện "${story.title}" không?`
    );
    if (!confirmed) return;

    setIsPurchasingStory(true);
    try {
      await coinService.purchaseStory(storyId);
      alert('🎉 Chúc mừng! Bạn đã mua thành công trọn bộ truyện!');
      const meRes = await userService.getMe();
      if (meRes?.data) userService.updateCurrentUser(meRes.data);
      const storyRes = await publicStoryService.getStoryById(storyId);
      setStory(storyRes.data);
    } catch (err) {
      alert(getErrorMessage(err, 'Không thể mua trọn bộ truyện. Vui lòng kiểm tra lại số dư xu.'));
    } finally {
      setIsPurchasingStory(false);
    }
  };

  const handleReadButton = () => {
    if (readingProgress?.lastReadChapterId) {
      navigate(`/stories/${storyId}/chapters/${readingProgress.lastReadChapterId}`);
    } else if (story?.firstChapterId) {
      navigate(`/stories/${storyId}/chapters/${story.firstChapterId}`);
    } else {
      console.warn("No chapter to read from.");
    }
  };

  if (isLoading) {
    return (
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '2rem 1.5rem', width: '100%', boxSizing: 'border-box' }}>
        <div className="panel" style={{ padding: '2rem', textAlign: 'center', color: '#93c5fd' }}>
          Đang tải chi tiết truyện...
        </div>
      </div>
    )
  }

  if (!story || errorMessage) {
    return (
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '2rem 1.5rem', width: '100%', boxSizing: 'border-box' }}>
        <div className="panel" style={{ padding: '2rem', textAlign: 'center' }}>
          <p style={{ color: '#fecaca' }}>{errorMessage || 'Không tìm thấy truyện.'}</p>
          <button className="btn-primary" style={{ marginTop: '1rem', padding: '0.6rem 1.2rem', borderRadius: '0.6rem' }} onClick={() => navigate('/')}>
            Quay lại trang chủ
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', padding: '1.5rem', width: '100%', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '1.25rem', fontSize: '0.8rem', color: '#4a6080' }}>
          <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', color: '#60a5fa', cursor: 'pointer' }}>
            Trang chủ
          </button>
          <span>/</span>
          <span style={{ color: '#dce8f5' }}>{story.title}</span>
        </div>

        <div className="detail-layout" style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '1.5rem' }}>
          <div>
            {/* Story Hero Header */}
            <div className="panel" style={{ padding: '1.5rem', marginBottom: '1rem', background: 'linear-gradient(135deg, #0d1b33 0%, #111f3a 100%)' }}>
              <div className="detail-hero" style={{ display: 'flex', gap: '1.5rem' }}>
                <div style={{ flexShrink: 0, boxShadow: '0 8px 40px rgba(0,0,0,0.7)', borderRadius: '0.75rem', overflow: 'hidden' }}>
                  <img src={coverUrl} alt={story.title} style={{ width: 180, height: 252, objectFit: 'cover', display: 'block' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <h1 style={{ color: '#dce8f5', fontSize: '1.7rem', fontWeight: 700, marginBottom: '0.5rem' }}>{story.title}</h1>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                    <span className="tag-genre" style={{ fontSize: '0.72rem' }}>{story.genreName || 'Khác'}</span>
                    <span className="tag-genre" style={{ fontSize: '0.72rem' }}>{statusLabel}</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
                    <p style={{ color: '#7a96b8', fontSize: '0.9rem' }}>Tác giả: <span style={{ color: '#dce8f5' }}>{story.authorName || 'Đang cập nhật'}</span></p>
                    <p style={{ color: '#7a96b8', fontSize: '0.9rem' }}>Số chương: <span style={{ color: '#dce8f5' }}>{chapterCount.toLocaleString('vi-VN')}</span></p>
                    <p style={{ color: '#7a96b8', fontSize: '0.9rem' }}>Lượt xem: <span style={{ color: '#dce8f5' }}>{Number(story.viewCount ?? 0).toLocaleString('vi-VN')}</span></p>
                  </div>

                  {/* 🌟 Star Rating Widget */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem', background: '#0a1424', padding: '0.6rem 1rem', borderRadius: '0.6rem', border: '1px solid #1e3254', width: 'fit-content' }}>
                    <div style={{ display: 'flex', gap: '0.2rem' }}>
                      {[1, 2, 3, 4, 5].map((star) => {
                        const isFilled = (hoverStar || ratingData.userRating || Math.round(ratingData.averageRating)) >= star;
                        return (
                          <button
                            key={star}
                            onClick={() => handleRate(star)}
                            onMouseEnter={() => setHoverStar(star)}
                            onMouseLeave={() => setHoverStar(0)}
                            disabled={isRatingSubmitting}
                            title={`Đánh giá ${star} sao`}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontSize: '1.2rem', color: isFilled ? '#f59e0b' : '#4a6080', transition: 'transform 0.1s' }}
                          >
                            {isFilled ? <FaStar /> : <FaRegStar />}
                          </button>
                        );
                      })}
                    </div>
                    <span style={{ color: '#f59e0b', fontWeight: 700, fontSize: '0.95rem' }}>
                      {ratingData.averageRating > 0 ? ratingData.averageRating.toFixed(1) : '0.0'}
                    </span>
                    <span style={{ color: '#7a96b8', fontSize: '0.8rem' }}>
                      ({ratingData.totalRatings.toLocaleString('vi-VN')} đánh giá)
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
                    <button
                      className="btn-primary"
                      onClick={handleReadButton}
                      style={{ padding: '0.65rem 1.5rem', borderRadius: '0.6rem', fontSize: '0.9rem' }}
                    >
                      {readingProgress?.lastReadChapterId ? `Đọc tiếp - Chương ${readingProgress.lastReadChapterNumber}` : 'Đọc từ đầu'}
                    </button>

                    {story?.coinPrice > 0 && (
                      <button
                        onClick={handlePurchaseStory}
                        disabled={isPurchasingStory || story.isPurchased}
                        style={{
                          padding: '0.65rem 1.25rem',
                          borderRadius: '0.6rem',
                          border: '1px solid #f59e0b',
                          background: story.isPurchased ? 'rgba(16, 185, 129, 0.2)' : 'linear-gradient(135deg, #d97706, #b45309)',
                          color: '#fff',
                          cursor: story.isPurchased ? 'default' : 'pointer',
                          fontSize: '0.9rem',
                          fontWeight: 700,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.45rem',
                          boxShadow: '0 0 16px rgba(245,158,11,0.3)',
                          opacity: isPurchasingStory ? 0.7 : 1,
                        }}
                      >
                        🪙 {story.isPurchased ? 'Đã sở hữu trọn bộ' : `Mua trọn bộ (${story.coinPrice} xu)`}
                      </button>
                    )}
                    <button
                      onClick={handleToggleFavorite}
                      disabled={isFavoriteSubmitting}
                      style={{
                        padding: '0.65rem 1.25rem',
                        borderRadius: '0.6rem',
                        border: `1px solid ${favoriteData.isFavorite ? '#ef4444' : '#1e3254'}`,
                        background: favoriteData.isFavorite ? 'rgba(239, 68, 68, 0.15)' : '#111f3a',
                        color: favoriteData.isFavorite ? '#f87171' : '#dce8f5',
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.45rem',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      {favoriteData.isFavorite ? <FaHeart style={{ color: '#ef4444' }} /> : <FaRegHeart style={{ color: '#94a3b8' }} />}
                      <span>{favoriteData.isFavorite ? 'Đã yêu thích' : 'Thêm vào yêu thích'}</span>
                      {favoriteData.totalFavorites > 0 && (
                        <span style={{ fontSize: '0.75rem', opacity: 0.85, background: 'rgba(255,255,255,0.1)', padding: '1px 6px', borderRadius: '10px' }}>
                          {favoriteData.totalFavorites}
                        </span>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '1rem', borderBottom: '1px solid #1e3254' }}>
              {[
                { key: 'info', label: 'Giới thiệu' },
                { key: 'chapters', label: `Danh sách chương (${chapterCount})` },
                { key: 'comments', label: 'Bình luận' },
              ].map((item) => (
                <button
                  key={item.key}
                  onClick={() => setTab(item.key)}
                  style={{
                    background: 'none',
                    border: 'none',
                    borderBottom: `2px solid ${tab === item.key ? '#3b82f6' : 'transparent'}`,
                    color: tab === item.key ? '#60a5fa' : '#7a96b8',
                    padding: '0.6rem 1.2rem',
                    cursor: 'pointer',
                    fontSize: '0.88rem',
                    marginBottom: -1,
                    fontWeight: tab === item.key ? 'bold' : 'normal',
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Tab 1: Info */}
            {tab === 'info' && (
              <div className="panel" style={{ padding: '1.25rem' }}>
                <p style={{ color: '#c8daf0', fontSize: '0.92rem', lineHeight: 1.8 }}>{story.description || 'Nội dung đang được cập nhật.'}</p>
              </div>
            )}

            {/* Tab 2: Chapters */}
            {tab === 'chapters' && (
              <div className="panel" style={{ padding: '1.25rem' }}>
                <div style={{ marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '0.3rem' }}>
                    <h3 style={{ color: '#dce8f5', fontSize: '1rem', fontWeight: 700 }}>Danh sách chương</h3>
                    <span style={{ color: '#4a6080', fontSize: '0.82rem' }}>({chapterCount.toLocaleString('vi-VN')} chương)</span>
                  </div>
                  {latestChapter && (
                    <p style={{ color: '#7a96b8', fontSize: '0.8rem' }}>
                      Mới nhất:{' '}
                      <span style={{ color: '#dce8f5', fontWeight: 500 }}>
                        Chương {latestChapter.chapterNumber}: {latestChapter.title}
                      </span>
                      {' · '}
                      <span>{formatDistanceToNow(new Date(latestChapter.createdAt), { addSuffix: true, locale: vi })}</span>
                    </p>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', borderBottom: '1px solid #1e3254', paddingBottom: '0.75rem' }}>
                  {(['chapterNumber,asc', 'chapterNumber,desc']).map((s) => (
                    <button
                      key={s}
                      onClick={() => { setChapterSort(s); setChapterPage(1) }}
                      style={{
                        background: chapterSort === s ? 'rgba(59,130,246,0.15)' : 'none',
                        border: `1px solid ${chapterSort === s ? '#3b82f6' : '#1e3254'}`,
                        color: chapterSort === s ? '#60a5fa' : '#7a96b8',
                        fontSize: '0.78rem',
                        padding: '0.3rem 0.8rem',
                        borderRadius: '0.4rem',
                        cursor: 'pointer',
                        fontFamily: 'Be Vietnam Pro, sans-serif',
                        transition: 'all 0.15s',
                      }}
                    >
                      {s === 'chapterNumber,asc' ? '↑ Cũ nhất' : '↓ Mới nhất'}
                    </button>
                  ))}
                </div>

                {isLoadingChapters ? (
                  <div style={{ textAlign: 'center', padding: '2rem', color: '#93c5fd' }}>Đang tải danh sách chương...</div>
                ) : (
                  <>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', marginBottom: '1.25rem' }}>
                      {chapters.map((chapter) => (
                        <ChapterCell key={chapter.id} chapter={chapter} onRead={handleReadChapter} />
                      ))}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.35rem', marginTop: '1.25rem', flexWrap: 'wrap' }}>
                      {buildPageNumbers(chapterPage, totalChapterPages).map((item, index) => (
                        item === '...'
                          ? <span key={`ellipsis-${index}`} style={{ color: '#4a6080', fontSize: '0.82rem', padding: '0 4px' }}>…</span>
                          : (
                            <button
                              key={item}
                              onClick={() => setChapterPage(item)}
                              style={{
                                minWidth: 34,
                                height: 34,
                                padding: '0 6px',
                                borderRadius: '0.45rem',
                                border: item === chapterPage ? '1px solid #3b82f6' : '1px solid #1e3254',
                                background: item === chapterPage ? '#3b82f6' : '#111f3a',
                                color: '#fff',
                                cursor: 'pointer',
                                fontSize: '0.82rem',
                              }}
                            >
                              {item}
                            </button>
                          )
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* 💬 Tab 3: Comments */}
            {tab === 'comments' && (
              <div className="panel" style={{ padding: '1.5rem' }}>
                <h3 style={{ color: '#dce8f5', fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <FaCommentDots style={{ color: '#60a5fa' }} /> Bình luận & Thảo luận
                </h3>

                {/* Comment Input Form */}
                {loggedIn ? (
                  <div style={{ marginBottom: '2rem', background: '#0d1b33', padding: '1rem', borderRadius: '0.75rem', border: '1px solid #1e3254' }}>
                    <textarea
                      placeholder="Viết bình luận của bạn về truyện..."
                      rows={3}
                      value={newCommentText}
                      onChange={(e) => setNewCommentText(e.target.value)}
                      style={{
                        width: '100%',
                        background: '#080f1e',
                        border: '1px solid #1e3254',
                        borderRadius: '0.5rem',
                        padding: '0.75rem',
                        color: '#dce8f5',
                        fontSize: '0.9rem',
                        fontFamily: 'Be Vietnam Pro, sans-serif',
                        resize: 'vertical',
                        outline: 'none',
                      }}
                    />
                    {commentError && <p style={{ color: '#f87171', fontSize: '0.8rem', marginTop: '0.4rem' }}>{commentError}</p>}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.75rem' }}>
                      <button
                        className="btn-primary"
                        onClick={() => handlePostComment(null)}
                        disabled={isSubmittingComment || !newCommentText.trim()}
                        style={{ padding: '0.5rem 1.25rem', borderRadius: '0.5rem', fontSize: '0.85rem' }}
                      >
                        {isSubmittingComment ? 'Đang gửi...' : 'Gửi bình luận'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '1.25rem', background: '#0d1b33', borderRadius: '0.75rem', border: '1px dashed #1e3254', marginBottom: '2rem' }}>
                    <p style={{ color: '#7a96b8', fontSize: '0.88rem', marginBottom: '0.75rem' }}>Vui lòng đăng nhập để tham gia bình luận.</p>
                    <button className="btn-primary" onClick={() => navigate('/login')} style={{ padding: '0.45rem 1.2rem', borderRadius: '0.5rem', fontSize: '0.85rem' }}>
                      Đăng nhập ngay
                    </button>
                  </div>
                )}

                {/* Comments List */}
                {isLoadingComments ? (
                  <div style={{ textAlign: 'center', padding: '2rem', color: '#93c5fd' }}>Đang tải bình luận...</div>
                ) : comments.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '2rem', color: '#4a6080', fontSize: '0.9rem' }}>
                    Chưa có bình luận nào. Hãy là người đầu tiên bình luận về truyện này!
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    {comments.map((comment) => {
                      const isOwner = currentUser?.id === comment.userId;
                      const isAdmin = currentUser?.role === 'ROLE_ADMIN' || currentUser?.role === 'ADMIN';

                      return (
                        <div key={comment.id} style={{ background: '#0d1b33', border: '1px solid #1e3254', borderRadius: '0.75rem', padding: '1rem' }}>
                          {/* Comment Header */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                              <div style={{
                                width: 36, height: 36, borderRadius: '50%',
                                background: 'linear-gradient(135deg, #3b82f6, #7c3aed)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontWeight: 'bold', color: '#fff', fontSize: '0.85rem', flexShrink: 0, overflow: 'hidden'
                              }}>
                                {comment.userAvatar ? (
                                  <img src={userService.buildAvatarUrl(comment.userAvatar)} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                  comment.userName?.charAt(0).toUpperCase()
                                )}
                              </div>
                              <div>
                                <h4 style={{ color: '#dce8f5', fontSize: '0.88rem', fontWeight: 600, margin: 0 }}>{comment.userName}</h4>
                                <span style={{ color: '#4a6080', fontSize: '0.75rem' }}>
                                  {comment.createdAt ? formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true, locale: vi }) : ''}
                                </span>
                              </div>
                            </div>

                            {/* Delete Action */}
                            {(isOwner || isAdmin) && (
                              <button
                                onClick={() => handleDeleteComment(comment.id)}
                                title="Xóa bình luận"
                                style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', fontSize: '0.82rem', padding: '0.2rem' }}
                              >
                                <FaTrashAlt />
                              </button>
                            )}
                          </div>

                          {/* Comment Content */}
                          <p style={{ color: '#c8daf0', fontSize: '0.9rem', lineHeight: 1.6, margin: '0.5rem 0' }}>
                            {comment.content}
                          </p>

                          {/* Reply Trigger */}
                          {loggedIn && (
                            <button
                              onClick={() => setReplyingToId(replyingToId === comment.id ? null : comment.id)}
                              style={{ background: 'none', border: 'none', color: '#60a5fa', fontSize: '0.78rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: 0 }}
                            >
                              <FaReply /> Trả lời
                            </button>
                          )}

                          {/* Inline Reply Form */}
                          {replyingToId === comment.id && (
                            <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid #1e3254' }}>
                              <textarea
                                placeholder={`Trả lời ${comment.userName}...`}
                                rows={2}
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                style={{
                                  width: '100%',
                                  background: '#080f1e',
                                  border: '1px solid #1e3254',
                                  borderRadius: '0.4rem',
                                  padding: '0.6rem',
                                  color: '#dce8f5',
                                  fontSize: '0.85rem',
                                  fontFamily: 'Be Vietnam Pro, sans-serif',
                                  resize: 'vertical',
                                  outline: 'none',
                                }}
                              />
                              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
                                <button
                                  onClick={() => setReplyingToId(null)}
                                  style={{ background: 'none', border: 'none', color: '#7a96b8', fontSize: '0.8rem', cursor: 'pointer' }}
                                >
                                  Hủy
                                </button>
                                <button
                                  className="btn-primary"
                                  onClick={() => handlePostComment(comment.id)}
                                  disabled={isSubmittingComment || !replyText.trim()}
                                  style={{ padding: '0.35rem 0.9rem', borderRadius: '0.4rem', fontSize: '0.8rem' }}
                                >
                                  Gửi trả lời
                                </button>
                              </div>
                            </div>
                          )}

                          {/* Replies List */}
                          {comment.replies && comment.replies.length > 0 && (
                            <div style={{ marginTop: '0.85rem', paddingLeft: '1.25rem', borderLeft: '2px solid #1e3254', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                              {comment.replies.map((reply) => {
                                const isReplyOwner = currentUser?.id === reply.userId;
                                return (
                                  <div key={reply.id} style={{ background: '#0a1424', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #1e3254' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                                        <div style={{
                                          width: 28, height: 28, borderRadius: '50%',
                                          background: 'linear-gradient(135deg, #3b82f6, #7c3aed)',
                                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                                          fontWeight: 'bold', color: '#fff', fontSize: '0.75rem', flexShrink: 0, overflow: 'hidden'
                                        }}>
                                          {reply.userAvatar ? (
                                            <img src={userService.buildAvatarUrl(reply.userAvatar)} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                          ) : (
                                            reply.userName?.charAt(0).toUpperCase()
                                          )}
                                        </div>
                                        <h5 style={{ color: '#dce8f5', fontSize: '0.82rem', fontWeight: 600, margin: 0 }}>{reply.userName}</h5>
                                        <span style={{ color: '#4a6080', fontSize: '0.72rem' }}>
                                          {reply.createdAt ? formatDistanceToNow(new Date(reply.createdAt), { addSuffix: true, locale: vi }) : ''}
                                        </span>
                                      </div>
                                      {(isReplyOwner || isAdmin) && (
                                        <button
                                          onClick={() => handleDeleteComment(reply.id)}
                                          title="Xóa trả lời"
                                          style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', fontSize: '0.75rem', padding: '0.2rem' }}
                                        >
                                          <FaTrashAlt />
                                        </button>
                                      )}
                                    </div>
                                    <p style={{ color: '#c8daf0', fontSize: '0.85rem', margin: 0 }}>{reply.content}</p>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {/* Pagination for Comments */}
                    {totalCommentPages > 1 && (
                      <div style={{ display: 'flex', justifyContent: 'center', gap: '0.35rem', marginTop: '1rem' }}>
                        {buildPageNumbers(commentPage, totalCommentPages).map((item, index) => (
                          item === '...'
                            ? <span key={`c-ellipsis-${index}`} style={{ color: '#4a6080', fontSize: '0.82rem', padding: '0 4px' }}>…</span>
                            : (
                              <button
                                key={item}
                                onClick={() => setCommentPage(item)}
                                style={{
                                  minWidth: 32,
                                  height: 32,
                                  borderRadius: '0.4rem',
                                  border: item === commentPage ? '1px solid #3b82f6' : '1px solid #1e3254',
                                  background: item === commentPage ? '#3b82f6' : '#111f3a',
                                  color: '#fff',
                                  cursor: 'pointer',
                                  fontSize: '0.8rem',
                                }}
                              >
                                {item}
                              </button>
                            )
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Sidebar: Related Stories */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="panel" style={{ padding: '1.25rem' }}>
              <SectionHeader title="Truyện Tương Tự" />
              {relatedStories.slice(0, 6).map((item) => {
                const relatedCover = item.coverImageUrl
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => navigate(`/stories/${item.id}`)}
                    style={{ display: 'flex', gap: '0.6rem', width: '100%', padding: '0.5rem', borderRadius: '0.5rem', border: 'none', background: 'transparent', textAlign: 'left', cursor: 'pointer', marginBottom: '0.25rem' }}
                    className="related-item"
                  >
                    <img src={relatedCover} alt={item.title} style={{ width: 48, height: 68, objectFit: 'cover', borderRadius: '0.4rem', border: '1px solid #1e3254' }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ color: '#dce8f5', fontSize: '0.78rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title}</p>
                      <p style={{ color: '#4a6080', fontSize: '0.72rem', marginTop: '0.2rem' }}>{item.authorName || 'Đang cập nhật'}</p>
                      <p style={{ color: '#60a5fa', fontSize: '0.7rem', marginTop: '0.2rem' }}>{publicStoryService.mapStatus(item.status)}</p>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
    </div>
  )
}