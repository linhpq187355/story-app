import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useOutletContext } from 'react-router-dom'
import BookCover from '../components/home/BookCover'
import FeaturedCarousel from '../components/home/FeaturedCarousel'
import SectionHeader from '../components/home/SectionHeader'
import RankingsSection from '../components/home/RankingsSection'
import { publicStoryService } from '../services/publicStoryService'
import '../styles/homepage.css'

const DEFAULT_COVER = 'https://images.unsplash.com/photo-1526243741027-444d633d7365?w=300&h=420&fit=crop&auto=format'

function mapStoryToBook(story, index) {
  const fallbackRating = 4 + ((story.id || index + 1) % 10) / 10
  const normalizedViewCount = Number(story.viewCount ?? 0)

  return {
    id: story.id,
    rank: story.rank,
    title: story.title || 'Đang cập nhật',
    author: story.authorName || 'Đang cập nhật',
    genre: story.genreName ? [story.genreName] : ['Khác'],
    status: publicStoryService.mapStatus(story.status),
    cover: story.coverImageUrl,
    rating: Number(fallbackRating.toFixed(1)),
    views: normalizedViewCount.toLocaleString('vi-VN'),
    viewCount: normalizedViewCount,
    chapters: story.lastReadChapterNumber || story.latestChapterNumber || 0,
    latestActivityAt: story.latestActivityAt,
    desc: story.description || 'Nội dung đang được cập nhật.',
  }
}

export default function HomePage() {
  const navigate = useNavigate()
  const outletCtx = useOutletContext() || {}
  const search = outletCtx.search || ''
  const loggedIn = outletCtx.loggedIn ?? Boolean(localStorage.getItem('token'))
  const goToStoryDetail = (storyId) => {
    if (!storyId) return
    navigate(`/stories/${storyId}`)
  }

  const [hotBooks, setHotBooks] = useState([])
  const [updatingBooks, setUpdatingBooks] = useState([])
  const [recentlyRead, setRecentlyRead] = useState([])
  const [followingStories, setFollowingStories] = useState([])
  const [rankings, setRankings] = useState(null)

  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    let isMounted = true

    const loadDashboardData = async () => {
      setIsLoading(true)
      setErrorMessage('')

      try {
        const response = await publicStoryService.getHomePageData()
        const data = response.data

        if (isMounted) {
          setHotBooks((data.hotStories || []).map(mapStoryToBook))
          setUpdatingBooks((data.updatingStories || []).map(mapStoryToBook))
          setRankings(data.rankings || null)

          if (loggedIn && data.recentlyRead) {
            setRecentlyRead(data.recentlyRead.map(mapStoryToBook))
          }
        }

        if (loggedIn) {
          try {
            const favRes = await publicStoryService.getUserFavoriteStories({ page: 0, size: 5 })
            if (isMounted) {
              setFollowingStories(favRes.data?.content || [])
            }
          } catch (e) {
            console.error("Failed to load user favorite stories:", e)
          }
        }
      } catch (error) {
        if (isMounted) {
          setErrorMessage('Không thể tải dữ liệu từ server. Vui lòng thử lại.')
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadDashboardData()

    return () => {
      isMounted = false
    }
  }, [loggedIn])

  const searchedBooks = useMemo(() => {
    const keyword = search.trim().toLowerCase()
    if (!keyword) return updatingBooks
    return updatingBooks.filter(
        (book) =>
            book.title.toLowerCase().includes(keyword) ||
            book.author.toLowerCase().includes(keyword),
    )
  }, [search, updatingBooks])

  function formatRelativeTime(dateString) {
    if (!dateString) return 'Chưa có dữ liệu'

    const date = new Date(dateString)
    if (Number.isNaN(date.getTime())) return 'Chưa có dữ liệu'

    const now = new Date()
    const diffMs = now - date
    const diffMinutes = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffMinutes < 1) return 'Vừa xong'
    if (diffMinutes < 60) return `${diffMinutes} phút trước`
    if (diffHours < 24) return `${diffHours} giờ trước`
    if (diffDays < 7) return `${diffDays} ngày trước`

    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', padding: '1.5rem', width: '100%', boxSizing: 'border-box' }}>
          {errorMessage && (
              <div style={{ marginBottom: '1rem', border: '1px solid #7f1d1d', background: '#3f1d1d', color: '#fecaca', borderRadius: '0.6rem', padding: '0.75rem 1rem', fontSize: '0.85rem' }}>
                {errorMessage}
              </div>
          )}

          {isLoading && (
              <div style={{ marginBottom: '1rem', border: '1px solid #1e3254', background: '#0d1b33', color: '#93c5fd', borderRadius: '0.6rem', padding: '0.75rem 1rem', fontSize: '0.85rem' }}>
                Đang tải...
              </div>
          )}

          <div className="home-layout" style={{ display: 'grid', gridTemplateColumns: '240px 1fr 240px', gap: '1rem', marginBottom: '2rem' }}>
            {/* Cột trái */}
            <div className="panel" style={{ padding: '1.25rem' }}>
              <SectionHeader title="Truyện Vừa Đọc" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {loggedIn ? (
                    recentlyRead.length > 0 ? (
                        recentlyRead.slice(0, 5).map((book) => (
                            <div
                                key={book.id}
                                style={{ display: 'flex', gap: '0.6rem', padding: '0.4rem', borderRadius: '0.5rem', cursor: 'pointer', transition: 'background 0.12s' }}
                                onClick={() => goToStoryDetail(book.id)}
                                onMouseEnter={(e) => { e.currentTarget.style.background = '#111f3a' }}
                                onMouseLeave={(e) => { e.currentTarget.style.background = 'none' }}
                            >
                              <BookCover book={book} width={50} height={70} />
                              <div style={{ minWidth: 0, flex: 1 }}>
                                <p style={{ color: '#dce8f5', fontSize: '0.78rem', fontWeight: 600, marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{book.title}</p>
                                <p style={{ color: '#7a96b8', fontSize: '0.72rem', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{book.author || 'Chưa cập nhật'}</p>
                                <p style={{ color: '#3b82f6', fontSize: '0.68rem', marginTop: '0.2rem' }}>{Array.isArray(book.genre) ? book.genre[0] : (book.genre || 'Khác')}</p>
                              </div>
                            </div>
                        ))
                    ) : (
                        <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                          <p style={{ color: '#4a6080', fontSize: '0.82rem', marginBottom: '0.75rem' }}>Chưa có lịch sử đọc.</p>
                        </div>
                    )
                ) : (
                    <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                      <p style={{ color: '#4a6080', fontSize: '0.82rem', marginBottom: '0.75rem' }}>Đăng nhập để xem lịch sử đọc.</p>
                      <button
                          onClick={() => navigate('/login')}
                          style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', fontSize: '0.82rem' }}
                      >
                        Đăng nhập →
                      </button>
                    </div>
                )}
              </div>
            </div>

            {/* Cột giữa */}
            <FeaturedCarousel books={hotBooks} onSelectStory={(book) => goToStoryDetail(book?.id)} />

            {/* Cột phải: 5 truyện đang theo dõi gần đây nhất */}
            <div className="panel" style={{ padding: '1.25rem' }}>
              <SectionHeader title="Đang Theo Dõi" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {loggedIn ? (
                  followingStories.length > 0 ? (
                    followingStories.slice(0, 5).map((story) => {
                      const storyId = story.storyId || story.id;
                      const cover = story.coverImageUrl;
                      const bookObj = { title: story.title, cover };

                      return (
                        <div
                          key={storyId}
                          style={{ display: 'flex', gap: '0.6rem', padding: '0.4rem', borderRadius: '0.5rem', cursor: 'pointer', transition: 'background 0.12s' }}
                          onClick={() => goToStoryDetail(storyId)}
                          onMouseEnter={(e) => { e.currentTarget.style.background = '#111f3a' }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = 'none' }}
                        >
                          <BookCover book={bookObj} width={50} height={70} />
                          <div style={{ minWidth: 0, flex: 1 }}>
                            <p style={{ color: '#dce8f5', fontSize: '0.78rem', fontWeight: 600, marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {story.title}
                            </p>
                            <p style={{ color: '#7a96b8', fontSize: '0.72rem', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {story.authorName || 'Chưa cập nhật'}
                            </p>
                            <p style={{ color: '#f59e0b', fontSize: '0.68rem', marginTop: '0.2rem' }}>
                              {story.genreName || 'Khác'}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                      <p style={{ color: '#4a6080', fontSize: '0.82rem', marginBottom: '0.75rem' }}>Chưa theo dõi bộ truyện nào.</p>
                      <button
                        onClick={() => navigate('/bookshelf')}
                        style={{ background: 'none', border: 'none', color: '#f59e0b', cursor: 'pointer', fontSize: '0.82rem' }}
                      >
                        Kệ sách của tôi →
                      </button>
                    </div>
                  )
                ) : (
                  <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                    <p style={{ color: '#4a6080', fontSize: '0.82rem', marginBottom: '0.75rem' }}>Đăng nhập để xem danh sách theo dõi.</p>
                    <button
                      onClick={() => navigate('/login')}
                      style={{ background: 'none', border: 'none', color: '#f59e0b', cursor: 'pointer', fontSize: '0.82rem' }}
                    >
                      Đăng nhập →
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* =========================================
            Bảng Xếp Hạng (3 cột: Top Đánh Giá, Top Theo Dõi, Top Lượt Đọc)
            ========================================= */}
          <RankingsSection rankings={rankings} />

          {/* =========================================
            Phần Truyện Mới Cập Nhật (Layout List)
            ========================================= */}
          <div style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 className="gold-label">Truyện Mới Cập Nhật</h2>
              <span style={{ color: '#4a6080', fontSize: '0.78rem' }}>{searchedBooks.length} truyện</span>
            </div>

            <div className="panel" style={{ padding: '0.75rem 1rem' }}>
              {!isLoading && searchedBooks.length === 0 && (
                  <div style={{ border: '1px dashed #1e3254', borderRadius: '0.8rem', padding: '1.2rem', color: '#7a96b8', textAlign: 'center' }}>
                    Không có dữ liệu.
                  </div>
              )}

              {searchedBooks.map((book) => (
                  <div
                      key={book.id}
                      onClick={() => goToStoryDetail(book.id)}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 0.5rem', borderBottom: '1px solid #1e3254', cursor: 'pointer', borderRadius: '0.5rem', transition: 'background 0.12s' }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = '#111f3a' }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'none' }}
                  >
                    <BookCover book={book} width={44} height={62} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ color: '#dce8f5', fontSize: '0.88rem', fontWeight: 600, display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {book.title}
                  </span>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: '0.2rem' }}>
                        {book.genre.slice(0, 1).map((g) => (
                            <span key={g} className="tag" style={{ fontSize: '0.65rem' }}>{g}</span>
                        ))}
                        <span style={{ color: '#4a6080', fontSize: '0.72rem' }}>✏️ {book.author}</span>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <p style={{ color: '#60a5fa', fontSize: '0.78rem', margin: 0 }}>Chương {book.chapters || 0}</p>
                      <p style={{ color: '#4a6080', fontSize: '0.68rem', margin: '0.2rem 0 0 0' }}>
                        {formatRelativeTime(book.latestActivityAt)}
                      </p>
                    </div>
                  </div>
              ))}
            </div>
          </div>
    </div>
  )
}