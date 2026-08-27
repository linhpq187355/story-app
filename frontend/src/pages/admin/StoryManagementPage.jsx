import { useState, useEffect } from 'react'
import AdminLayout from '../../layouts/AdminLayout'
import StoryFilters from '../../components/admin/StoryFilters'
import StoryTable from '../../components/admin/StoryTable'
import Pagination from '../../components/admin/Pagination'
import { storyService } from '../../services/storyService'
import { useConfirm } from '../../contexts/ConfirmDialog'
import { useNavigate } from 'react-router-dom'

const ITEMS_PER_PAGE = 10

export default function StoryManagementPage() {
  const navigate = useNavigate()
  const confirm = useConfirm()
  const [stories, setStories] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)

  const [viewMode, setViewMode] = useState('list')
  const [filters, setFilters] = useState({ search: '', category: '', author: '', status: '' })
  const [isLoading, setIsLoading] = useState(false)

  const loadStories = async () => {
    try {
      setIsLoading(true)

      const params = {
        page: currentPage - 1,
        size: ITEMS_PER_PAGE,
      }

      if (filters.search) params.keyword = filters.search
      if (filters.category) params.genreId = filters.category
      if (filters.author) params.authorId = filters.author
      if (filters.status) params.status = filters.status

      const response = await storyService.getStories(params)

      const data = response.data

      const mappedStories = data.content.map(item => ({
        id: item.id,
        title: item.title,
        author: item.authorName || 'Chưa rõ',
        category: item.genreName || 'Chưa phân loại',
        viewCount: item.viewCount ?? 0,
        coinPrice: item.coinPrice ?? 0,
        status: item.status || 'ONGOING',
        isVip: false,
        totalChapters: 0,
        coverImage: item.coverImageUrl,
      }))

      setStories(mappedStories)
      setTotalPages(data.totalPages)
      setTotalItems(data.totalElements)

    } catch (error) {
      console.error('Lỗi tải danh sách truyện:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadStories()
  }, [currentPage, filters])

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters)
    setCurrentPage(1)
  }

  const handleEdit = (storyId) => {
    navigate(`/admin/stories/${storyId}/edit`)
  }

  const handleDelete = async (storyId) => {
    const confirmed = await confirm({
      title: 'Xác nhận xóa truyện',
      message: 'Bạn có chắc chắn muốn xóa truyện này? Hành động này không thể hoàn tác.',
      confirmText: 'Xóa',
      cancelText: 'Hủy',
      type: 'error',
    })

    if (!confirmed) return

    try {
      await storyService.deleteStory(storyId)
      loadStories()
    } catch (error) {
      console.error('Lỗi xóa truyện:', error)
      alert(error?.response?.data?.message || 'Xóa truyện thất bại, vui lòng thử lại sau.')
    }
  }

  const handleViewDetail = (storyId) => {
    navigate(`/admin/stories/${storyId}`)
  }

  const handleManageChapters = (storyId) => {
    navigate(`/admin/stories/${storyId}/chapters`)
  }

  return (
    <AdminLayout>
      {/* Page Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h2 className="font-sans text-3xl font-bold text-slate-100">Quản lý Truyện</h2>
          <p className="font-sans text-base text-slate-400 mt-1">
            Quản lý danh sách, trạng thái và nội dung các tác phẩm.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/admin/import')}
            className="bg-slate-800 hover:bg-slate-700 text-blue-400 border border-blue-400/30 font-mono text-sm font-bold py-3 px-5 rounded-lg shadow-lg transition-all flex items-center gap-2 whitespace-nowrap"
          >
            <span className="material-symbols-outlined">file_upload</span>
            Import từ Excel
          </button>
          <button
            onClick={() => navigate('/admin/stories/new')}
            className="bg-blue-400 hover:bg-blue-500 text-slate-950 font-mono text-sm font-bold py-3 px-6 rounded-lg shadow-lg shadow-blue-400/20 transition-all flex items-center gap-2 whitespace-nowrap"
          >
            <span className="material-symbols-outlined">add</span>
            Thêm Truyện Mới
          </button>
        </div>
      </header>

      {/* Filters Section */}
      <StoryFilters
        onFilterChange={handleFilterChange}
        onViewModeChange={setViewMode}
        viewMode={viewMode}
      />

      {/* Stories Table/Grid */}
      {isLoading ? (
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-8 text-center">
          <span className="material-symbols-outlined text-[48px] text-blue-400 opacity-75 block mb-4 animate-spin">
            hourglass_empty
          </span>
          <p className="font-sans text-base text-slate-400">
            Đang tải dữ liệu...
          </p>
        </div>
      ) : (
        <>
          <StoryTable
            stories={stories}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onManageChapters={handleManageChapters}
            onViewDetail={handleViewDetail}
          />

          {/* Pagination */}
          {totalItems > 0 && (
            <div className="mt-4">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalItems}
                itemsPerPage={ITEMS_PER_PAGE}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </>
      )}
    </AdminLayout>
  )
}
