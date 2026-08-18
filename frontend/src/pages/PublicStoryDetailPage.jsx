import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import HomeNavbar from '../components/home/HomeNavbar'
import SectionHeader from '../components/home/SectionHeader'
import { publicStoryService } from '../services/publicStoryService'
import '../styles/homepage.css'
import { format, formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

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

  const [search, setSearch] = useState('')
  const [story, setStory] = useState(null)
  const [relatedStories, setRelatedStories] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  const [chapters, setChapters] = useState([])
  const [isLoadingChapters, setIsLoadingChapters] = useState(false)
  const [chapterPage, setChapterPage] = useState(1)
  const [totalChapterPages, setTotalChapterPages] = useState(1)
  const [chapterSort, setChapterSort] = useState('chapterNumber,asc')
  const [viewRecorded, setViewRecorded] = useState(false);
  const [readingProgress, setReadingProgress] = useState(null);

  const [tab, setTab] = useState('info')
  const [jumpInput, setJumpInput] = useState('')

  const loggedIn = Boolean(localStorage.getItem('token'))
  const setLoggedIn = (nextValue) => {
    if (!nextValue) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
  }

  useEffect(() => {
    let isMounted = true
    const loadStoryData = async () => {
      setIsLoading(true)
      setErrorMessage('')
      try {
        const [storyResponse, relatedResponse] = await Promise.all([
          publicStoryService.getStoryById(storyId),
          publicStoryService.getStories({ page: 0, size: 16, sort: 'createdAt,desc' }),
        ])
        const detail = storyResponse?.data
        const list = relatedResponse?.data?.content || []
        if (!detail) throw new Error('NOT_FOUND')
        if (isMounted) {
          setStory(detail)
          setRelatedStories(list.filter((item) => item.id !== detail.id))
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

  const chapterCount = useMemo(() => story?.chapterCount || 0, [story]);
  const latestChapter = useMemo(() => {
    if (!chapters || chapters.length === 0) return null;
    const sorted = [...chapters].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return sorted[0];
  }, [chapters]);

  const coverUrl = story?.coverImageUrl
    ? publicStoryService.buildCoverUrl(story.coverImageUrl)
    : 'https://images.unsplash.com/photo-1526243741027-444d633d7365?w=300&h=420&fit=crop&auto=format'

  const statusLabel = publicStoryService.mapStatus(story?.status)

  const handleReadChapter = (chapterId) => {
    navigate(`/stories/${storyId}/chapters/${chapterId}`);
  };

  const handleReadButton = () => {
    if (readingProgress?.lastReadChapterId) {
      navigate(`/stories/${storyId}/chapters/${readingProgress.lastReadChapterId}`);
    } else if (story?.firstChapterId) {
      navigate(`/stories/${storyId}/chapters/${story.firstChapterId}`);
    } else {
      // Fallback if no chapters or first chapter not found
      console.warn("No chapter to read from.");
    }
  };

  if (isLoading) {
    return (
      <div className="home-shell" style={{ minHeight: '100vh', background: '#080f1e' }}>
        <HomeNavbar search={search} setSearch={setSearch} loggedIn={loggedIn} setLoggedIn={setLoggedIn} />
        <div style={{ maxWidth: 1400, margin: '0 auto', padding: '2rem 1.5rem' }}>
          <div className="panel" style={{ padding: '2rem', textAlign: 'center', color: '#93c5fd' }}>
            Đang tải chi tiết truyện...
          </div>
        </div>
      </div>
    )
  }

  if (!story || errorMessage) {
    return (
      <div className="home-shell" style={{ minHeight: '100vh', background: '#080f1e' }}>
        <HomeNavbar search={search} setSearch={setSearch} loggedIn={loggedIn} setLoggedIn={setLoggedIn} />
        <div style={{ maxWidth: 1400, margin: '0 auto', padding: '2rem 1.5rem' }}>
          <div className="panel" style={{ padding: '2rem', textAlign: 'center' }}>
            <p style={{ color: '#fecaca' }}>{errorMessage || 'Không tìm thấy truyện.'}</p>
            <button className="btn-primary" style={{ marginTop: '1rem', padding: '0.6rem 1.2rem', borderRadius: '0.6rem' }} onClick={() => navigate('/')}>
              Quay lại trang chủ
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="home-shell" style={{ minHeight: '100vh', background: '#080f1e' }}>
      <HomeNavbar search={search} setSearch={setSearch} loggedIn={loggedIn} setLoggedIn={setLoggedIn} />

      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '1.25rem', fontSize: '0.8rem', color: '#4a6080' }}>
          <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', color: '#60a5fa', cursor: 'pointer' }}>
            Trang chủ
          </button>
          <span>/</span>
          <span style={{ color: '#dce8f5' }}>{story.title}</span>
        </div>

        <div className="detail-layout" style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '1.5rem' }}>
          <div>
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

                  <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <button
                      className="btn-primary"
                      onClick={handleReadButton}
                      style={{ padding: '0.65rem 1.5rem', borderRadius: '0.6rem', fontSize: '0.9rem' }}
                    >
                      {readingProgress?.lastReadChapterId ? `Đọc tiếp - Chương ${readingProgress.lastReadChapterNumber}` : 'Đọc từ đầu'}
                    </button>
                    <button style={{ padding: '0.65rem 1.5rem', borderRadius: '0.6rem', border: '1px solid #1e3254', background: '#111f3a', color: '#dce8f5', cursor: 'pointer', fontSize: '0.9rem' }}>
                      Đọc chương mới nhất
                    </button>
                  </div>
                </div>
              </div>
            </div>

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
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {tab === 'info' && (
              <div className="panel" style={{ padding: '1.25rem' }}>
                <p style={{ color: '#c8daf0', fontSize: '0.92rem', lineHeight: 1.8 }}>{story.description || 'Nội dung đang được cập nhật.'}</p>
              </div>
            )}

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

            {tab === 'comments' && (
              <div className="panel" style={{ padding: '1.25rem' }}>
                <p style={{ color: '#4a6080', fontSize: '0.85rem', marginBottom: '1rem' }}>
                  Tính năng bình luận sẽ sớm ra mắt.
                </p>
                <div style={{ borderTop: '1px solid #1e3254', paddingTop: '1rem' }}>
                  <p style={{ color: '#c8daf0', fontSize: '0.85rem', lineHeight: 1.7 }}>
                    Bạn có thể triển khai phần này theo mẫu hiện tại: form nhập bình luận + danh sách bình luận theo thời gian.
                  </p>
                </div>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="panel" style={{ padding: '1.25rem' }}>
              <SectionHeader title="Truyện Tương Tự" />
              {relatedStories.slice(0, 6).map((item) => {
                const relatedCover = publicStoryService.buildCoverUrl(item.coverImageUrl)
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
    </div>
  )
}