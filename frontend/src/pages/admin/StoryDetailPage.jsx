import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import AdminLayout from '../../layouts/AdminLayout'
import { chapterService } from '../../services/chapterService'
import { storyService } from '../../services/storyService'

const STATUS_CONFIG = {
  ONGOING: {
    label: 'Đang ra',
    textColor: 'text-amber-400',
    bgColor: 'bg-amber-500/15',
    borderColor: 'border-amber-500/20',
  },
  COMPLETED: {
    label: 'Hoàn thành',
    textColor: 'text-green-400',
    bgColor: 'bg-green-500/15',
    borderColor: 'border-green-500/20',
  },
}

export default function StoryDetailPage() {
  const navigate = useNavigate()
  const { storyId } = useParams()
  const [story, setStory] = useState(null)
  const [chapters, setChapters] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadStoryDetail = async () => {
      try {
        const [storyResponse, chapterResponse] = await Promise.all([
          storyService.getStoryById(storyId),
          chapterService.getChapters(storyId),
        ])

        setStory(storyResponse.data)
        setChapters(chapterResponse.data || [])
        setError('')
      } catch (err) {
        const message = err?.response?.data?.message || 'Không thể tải thông tin truyện.'
        setError(message)
      } finally {
        setIsLoading(false)
      }
    }

    loadStoryDetail()
  }, [storyId])

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-8 text-center">
          <span className="material-symbols-outlined text-[48px] text-blue-400 opacity-75 block mb-4 animate-spin">
            hourglass_empty
          </span>
          <p className="font-sans text-base text-slate-400">Đang tải thông tin truyện...</p>
        </div>
      </AdminLayout>
    )
  }

  if (error || !story) {
    return (
      <AdminLayout>
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-8 text-center">
          <span className="material-symbols-outlined text-[48px] text-red-400 opacity-75 block mb-4">
            error
          </span>
          <p className="font-sans text-base text-slate-400">{error || 'Không tìm thấy truyện.'}</p>
          <button
            type="button"
            onClick={() => navigate('/admin/stories')}
            className="mt-4 bg-blue-400 hover:bg-blue-500 text-slate-950 font-mono text-sm font-bold px-6 py-3 rounded-lg transition-colors"
          >
            Quay lại danh sách
          </button>
        </div>
      </AdminLayout>
    )
  }

  const statusConfig = STATUS_CONFIG[story.status] || STATUS_CONFIG.ONGOING
  const coverImage = story.coverImageUrl ? `${story.coverImageUrl}` : ''

  return (
    <AdminLayout>
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <button
            type="button"
            onClick={() => navigate('/admin/stories')}
            className="flex items-center gap-1 text-slate-400 hover:text-blue-400 font-mono text-xs uppercase tracking-wider mb-2 transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            Quản lý Truyện
          </button>
          <h2 className="text-3xl font-bold text-slate-100">Chi tiết truyện</h2>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(`/admin/stories/${storyId}/chapters`)}
            className="bg-blue-400 hover:bg-blue-500 text-slate-950 font-mono text-sm font-bold py-3 px-6 rounded-lg shadow-lg shadow-blue-400/20 transition-all"
          >
            Quản lý chương
          </button>
          <button
            type="button"
            onClick={() => navigate(`/admin/stories/${storyId}/edit`)}
            className="border border-slate-600 text-slate-300 hover:bg-slate-700 font-mono text-sm font-bold py-3 px-6 rounded-lg transition-colors"
          >
            Sửa truyện
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-[260px_minmax(0,1fr)] gap-8">
        <aside className="bg-slate-800 rounded-xl border border-slate-700 p-5">
          {coverImage ? (
            <img
              src={coverImage}
              alt={story.title}
              className="w-full aspect-[3/4] object-cover rounded-lg border border-slate-600"
            />
          ) : (
            <div className="w-full aspect-[3/4] rounded-lg border border-dashed border-slate-600 bg-slate-900 flex items-center justify-center">
              <span className="material-symbols-outlined text-[52px] text-slate-500">image_not_supported</span>
            </div>
          )}

          <div className="mt-5 space-y-4">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-wider text-slate-400">Trạng thái</p>
              <span
                className={`mt-2 inline-flex items-center gap-2 px-2.5 py-1 rounded-full font-mono text-[10px] font-semibold uppercase border ${statusConfig.bgColor} ${statusConfig.textColor} ${statusConfig.borderColor}`}
              >
                {statusConfig.label}
              </span>
            </div>

            <div>
              <p className="font-mono text-[10px] uppercase tracking-wider text-slate-400">Giá mua trọn bộ (Xu)</p>
              <p className="mt-2 text-xl font-bold text-amber-400 flex items-center gap-1.5">
                <span className="text-lg">🪙</span>
                {story.coinPrice > 0 ? (
                  <span>{story.coinPrice.toLocaleString('vi-VN')} Xu</span>
                ) : (
                  <span className="text-slate-300 font-medium text-base">Miễn phí (0 Xu)</span>
                )}
              </p>
            </div>

            <div>
              <p className="font-mono text-[10px] uppercase tracking-wider text-slate-400">Số chương</p>
              <p className="mt-2 text-xl font-bold text-slate-100">{chapters.length}</p>
            </div>

            <div>
              <p className="font-mono text-[10px] uppercase tracking-wider text-slate-400">Lượt xem</p>
              <p className="mt-2 text-xl font-bold text-slate-100">{(story.viewCount ?? 0).toLocaleString('vi-VN')}</p>
            </div>
          </div>
        </aside>

        <section className="space-y-6">
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
            <p className="font-mono text-xs uppercase tracking-wider text-slate-400">Tên truyện</p>
            <h3 className="font-serif text-3xl font-bold text-slate-100 mt-2">{story.title}</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
              <p className="font-mono text-[10px] uppercase tracking-wider text-slate-400">Tác giả</p>
              <p className="mt-3 text-lg text-slate-100">{story.authorName || 'Chưa rõ'}</p>
            </div>

            <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
              <p className="font-mono text-[10px] uppercase tracking-wider text-slate-400">Thể loại</p>
              <p className="mt-3 text-lg text-slate-100">{story.genreName || 'Chưa phân loại'}</p>
            </div>
          </div>

          <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
            <p className="font-mono text-xs uppercase tracking-wider text-slate-400">Mô tả</p>
            <div className="mt-3 whitespace-pre-wrap font-sans text-base text-slate-200 leading-relaxed">
              {story.description || 'Chưa có mô tả cho truyện này.'}
            </div>
          </div>

          <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
            <div className="flex items-center justify-between gap-3 mb-4">
              <p className="font-mono text-xs uppercase tracking-wider text-slate-400">Danh sách chương</p>
              <span className="font-mono text-[10px] uppercase tracking-wider text-slate-500">
                {chapters.length} mục
              </span>
            </div>

            {chapters.length === 0 ? (
              <div className="rounded-lg border border-dashed border-slate-700 bg-slate-900/60 p-4 text-sm text-slate-400">
                Truyện này chưa có chương nào.
              </div>
            ) : (
              <div className="space-y-2">
                {chapters.map((chapter) => (
                  <button
                    key={chapter.id}
                    type="button"
                    onClick={() => navigate(`/admin/stories/${storyId}/chapters`)}
                    className="w-full text-left rounded-lg border border-slate-700 bg-slate-900/60 p-3 hover:border-blue-400/60 hover:bg-slate-700/50 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-mono text-xs uppercase tracking-wider text-slate-400">
                        Chương {chapter.chapterNumber}
                      </span>
                      <span className="material-symbols-outlined text-[18px] text-slate-400">chevron_right</span>
                    </div>
                    <p className="mt-2 text-base text-slate-100 font-medium">{chapter.title}</p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </AdminLayout>
  )
}
