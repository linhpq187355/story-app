import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../../api/axiosConfig'
import AdminLayout from '../../layouts/AdminLayout'
import { chapterService } from '../../services/chapterService'
import { storyService } from '../../services/storyService'
import { useConfirm } from '../../contexts/ConfirmDialog'

const ACCESS_LEVELS = {
  PUBLIC: {
    label: 'Công khai',
    textColor: 'text-green-400',
    bgColor: 'bg-green-500/15',
    borderColor: 'border-green-500/20',
  },
  MEMBER: {
    label: 'Yêu cầu đăng nhập',
    textColor: 'text-blue-400',
    bgColor: 'bg-blue-500/15',
    borderColor: 'border-blue-500/20',
  },
  VIP: {
    label: 'VIP',
    textColor: 'text-purple-400',
    bgColor: 'bg-purple-500/15',
    borderColor: 'border-purple-500/30',
  },
}

const EMPTY_FORM = {
  title: '',
  chapterNumber: '',
  content: '',
  accessLevel: 'PUBLIC',
  coinPrice: 0,
}

function formatDate(isoString) {
  if (!isoString) return '—'
  const date = new Date(isoString)
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export default function ChapterManagementPage() {
  const navigate = useNavigate()
  const confirm = useConfirm()
  const { storyId } = useParams()

  const [story, setStory] = useState(null)
  const [chapters, setChapters] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  const [formOpen, setFormOpen] = useState(false)
  const [editingChapterId, setEditingChapterId] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [fieldErrors, setFieldErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [audioFile, setAudioFile] = useState(null)
  const [notice, setNotice] = useState(null)

  const [viewingChapter, setViewingChapter] = useState(null)
  const [audioFiles, setAudioFiles] = useState([])
  const [audioUploading, setAudioUploading] = useState(false)
  const [audioError, setAudioError] = useState('')

  const loadData = async () => {
    try {
      const [storyRes, chapterRes] = await Promise.all([
        storyService.getStoryById(storyId),
        chapterService.getChapters(storyId),
      ])
      setStory(storyRes.data)
      setChapters(chapterRes.data || [])
      setLoadError('')
    } catch (error) {
      const message = error?.response?.data?.message || 'Không thể tải dữ liệu chương.'
      setLoadError(message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [storyId])

  useEffect(() => {
    if (!viewingChapter?.id) {
      setAudioFiles([])
      setAudioError('')
      return
    }

    const fetchAudioFiles = async () => {
      try {
        const response = await chapterService.getAudioFiles(viewingChapter.id)
        setAudioFiles(response.data || [])
        setAudioError('')
      } catch (error) {
        const message = error?.response?.data?.message || 'Không thể tải danh sách audio.'
        setAudioError(message)
      }
    }

    fetchAudioFiles()
  }, [viewingChapter?.id])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = () => {
    const { isValid, errors } = chapterService.validateChapterForm(form)
    setFieldErrors(errors)
    return isValid
  }

  const openCreateForm = () => {
    const nextNumber = chapters.length > 0
      ? Math.max(...chapters.map((c) => c.chapterNumber)) + 1
      : 1
    setForm({ ...EMPTY_FORM, chapterNumber: String(nextNumber) })
    setEditingChapterId(null)
    setAudioFile(null)
    setAudioError('')
    setFieldErrors({})
    setFormError('')
    setFormOpen(true)
  }

  const openEditForm = (chapter) => {
    setForm({
      title: chapter.title || '',
      chapterNumber: chapter.chapterNumber != null ? String(chapter.chapterNumber) : '',
      content: chapter.content || '',
      accessLevel: chapter.accessLevel || 'PUBLIC',
      coinPrice: chapter.coinPrice != null ? chapter.coinPrice : 0,
      version: chapter.version != null ? chapter.version : null,
    })
    setEditingChapterId(chapter.id)
    setAudioFile(null)
    setAudioError('')
    setFieldErrors({})
    setFormError('')
    setFormOpen(true)
  }

  const closeForm = () => {
    setFormOpen(false)
    setEditingChapterId(null)
    setForm(EMPTY_FORM)
    setAudioFile(null)
    setAudioError('')
    setFieldErrors({})
    setFormError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError('')

    if (!validateForm()) return

    setIsSubmitting(true)

    try {
      const payload = {
        title: form.title.trim(),
        chapterNumber: Number(form.chapterNumber),
        content: form.content,
        accessLevel: form.accessLevel,
        coinPrice: form.accessLevel === 'VIP' ? Number(form.coinPrice) || 0 : 0,
        version: form.version,
      }

      let chapterResponse

      if (editingChapterId) {
        chapterResponse = await chapterService.updateChapter(storyId, editingChapterId, payload)
      } else {
        chapterResponse = await chapterService.createChapter(storyId, payload)
      }

      const targetChapterId = chapterResponse?.data?.id ?? editingChapterId

      if (audioFile && targetChapterId) {
        await chapterService.uploadAudio(targetChapterId, audioFile)
      }

      closeForm()
      await loadData()
      setNotice({
        type: 'success',
        title: editingChapterId ? 'Cập nhật chương thành công' : 'Tạo chương thành công',
        message: editingChapterId
          ? 'Thông tin chương đã được cập nhật.'
          : 'Chương mới đã được tạo thành công.',
      })
    } catch (error) {
      let message = error?.response?.data?.message || 'Lưu chương thất bại. Vui lòng thử lại.'
      if (error?.response?.status === 409 || error?.response?.data?.code === 'CONCURRENCY_CONFLICT') {
        message = 'Chương này vừa được cập nhật bởi một Admin khác. Vui lòng tải lại trang để lấy dữ liệu mới nhất!'
      }
      setFormError(message)
      setNotice({
        type: 'error',
        title: 'Xung đột dữ liệu / Lưu thất bại',
        message,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (chapter) => {
    if (!storyId || !chapter?.id) return

    const confirmed = await confirm({
      title: 'Xác nhận xóa chương',
      message: `Bạn có chắc chắn muốn xóa "${chapter.title}"? Hành động này không thể hoàn tác.`,
      confirmText: 'Xóa',
      cancelText: 'Hủy',
      type: 'error',
    })

    if (!confirmed) return

    try {
      await chapterService.deleteChapter(storyId, chapter.id)

      setChapters((prev) => prev.filter((item) => item.id !== chapter.id))
      if (viewingChapter?.id === chapter.id) {
        setViewingChapter(null)
      }

      setNotice({
        type: 'success',
        title: 'Xóa chương thành công',
        message: `Chương "${chapter.title}" đã được xóa.`,
      })
    } catch (error) {
      const message = error?.response?.data?.message || 'Xóa chương thất bại.'
      setNotice({
        type: 'error',
        title: 'Xóa chương thất bại',
        message,
      })
    }
  }

  const handleAudioUpload = async (event) => {
    const file = event.target.files?.[0]
    if (!file || !viewingChapter?.id) return

    const { isValid, error } = chapterService.validateAudioFile(file)
    if (!isValid) {
      setAudioError(error)
      event.target.value = ''
      return
    }

    setAudioUploading(true)
    setAudioError('')

    try {
      await chapterService.uploadAudio(viewingChapter.id, file)
      const response = await chapterService.getAudioFiles(viewingChapter.id)
      setAudioFiles(response.data || [])
      event.target.value = ''
    } catch (error) {
      const message = error?.response?.data?.message || 'Tải audio lên thất bại.'
      setAudioError(message)
    } finally {
      setAudioUploading(false)
    }
  }

  const handleFormAudioPick = (event) => {
    const file = event.target.files?.[0]
    if (!file) {
      setAudioFile(null)
      return
    }

    const { isValid, error } = chapterService.validateAudioFile(file)
    if (!isValid) {
      setAudioError(error)
      setAudioFile(null)
      event.target.value = ''
      return
    }

    setAudioError('')
    setAudioFile(file)
  }

  return (
    <AdminLayout>
      {notice && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4"
          onClick={() => setNotice(null)}
        >
          <div
            className="bg-slate-800 border border-slate-700 rounded-xl shadow-lg shadow-black/40 p-6 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-center mb-4">
              <span
                className={`material-symbols-outlined text-[48px] ${
                  notice.type === 'success' ? 'text-green-400' : 'text-red-400'
                }`}
              >
                {notice.type === 'success' ? 'check_circle' : 'error'}
              </span>
            </div>
            <h3 className="font-serif text-2xl font-bold text-slate-100 text-center mb-2">
              {notice.title}
            </h3>
            <p className="text-slate-300 text-center mb-6">{notice.message}</p>
            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => setNotice(null)}
                className={`font-mono text-sm font-bold px-6 py-3 rounded-lg transition-colors ${
                  notice.type === 'success'
                    ? 'bg-green-400 hover:bg-green-500 text-slate-950'
                    : 'bg-red-400 hover:bg-red-500 text-slate-950'
                }`}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Page Header */}
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
          <h2 className="font-serif text-3xl font-bold text-slate-100">
            Chương truyện: {story ? story.title : '...'}
          </h2>
          <p className="font-sans text-base text-slate-400 mt-1">
            Quản lý danh sách chương, nội dung và quyền truy cập.
          </p>
        </div>
        {!formOpen && (
          <button
            onClick={openCreateForm}
            className="bg-blue-400 hover:bg-blue-500 text-slate-950 font-mono text-sm font-bold py-3 px-6 rounded-lg shadow-lg shadow-blue-400/20 transition-all flex items-center gap-2 whitespace-nowrap"
          >
            <span className="material-symbols-outlined">add</span>
            Thêm Chương
          </button>
        )}
      </header>

      {/* Create/Edit Form */}
      {formOpen && (
        <section aria-label="Form chương" className="bg-slate-800 rounded-xl border border-slate-700 p-6 mb-8 space-y-6">
          <h3 className="font-serif text-xl font-bold text-slate-100 border-b border-slate-700 pb-4">
            {editingChapterId ? `Sửa chương #${editingChapterId}` : 'Thêm chương mới'}
          </h3>

          {formError && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-300 rounded-lg px-4 py-3 font-sans text-sm">
              {formError}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label htmlFor="chapterNumber" className="font-mono text-sm text-slate-400 block">
                Số chương <span className="text-red-500">*</span>
              </label>
              <input
                id="chapterNumber"
                name="chapterNumber"
                type="number"
                min="1"
                step="1"
                value={form.chapterNumber}
                onChange={handleChange}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-slate-200 focus:border-blue-400 focus:outline-none"
              />
              {fieldErrors.chapterNumber && (
                <p className="text-red-400 text-sm">{fieldErrors.chapterNumber}</p>
              )}
            </div>

            <div className="space-y-2 md:col-span-2">
              <label htmlFor="title" className="font-mono text-sm text-slate-400 block">
                Tiêu đề <span className="text-red-500">*</span>
              </label>
              <input
                id="title"
                name="title"
                type="text"
                value={form.title}
                onChange={handleChange}
                placeholder="Nhập tiêu đề chương..."
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-slate-200 focus:border-blue-400 focus:outline-none"
              />
              {fieldErrors.title && <p className="text-red-400 text-sm">{fieldErrors.title}</p>}
            </div>
          </div>

          {/* Access Level */}
          <fieldset className="space-y-2">
            <legend className="font-mono text-sm text-slate-400">
              Quyền truy cập <span className="text-red-500">*</span>
            </legend>
            <div className="flex flex-wrap gap-6 bg-slate-900 border border-slate-700 rounded-lg px-4 py-3">
              {Object.entries(ACCESS_LEVELS).map(([value, config]) => (
                <label key={value} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="accessLevel"
                    value={value}
                    checked={form.accessLevel === value}
                    onChange={handleChange}
                  />
                  <span className="text-slate-200">{config.label}</span>
                </label>
              ))}
            </div>
            {fieldErrors.accessLevel && (
              <p className="text-red-400 text-sm">{fieldErrors.accessLevel}</p>
            )}
          </fieldset>

          {/* Giá Xu mua lẻ cho VIP */}
          {form.accessLevel === 'VIP' && (
            <div className="space-y-2 bg-purple-950/40 border border-purple-500/30 p-4 rounded-xl">
              <label htmlFor="coinPrice" className="font-mono text-sm text-purple-300 font-semibold block">
                🪙 Giá Xu đọc lẻ chương VIP này (Nhập 0 nếu chỉ cho phép gói VIP)
              </label>
              <input
                id="coinPrice"
                name="coinPrice"
                type="number"
                min={0}
                value={form.coinPrice ?? 0}
                onChange={handleChange}
                placeholder="Ví dụ: 5"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-purple-300 font-mono text-base font-bold focus:border-purple-400 focus:outline-none"
              />
              <p className="text-xs text-slate-400">
                Người dùng không có Gói VIP active có thể dùng số xu này để mua riêng chương này.
              </p>
            </div>
          )}

          {/* Content */}
          <div className="space-y-2">
            <label htmlFor="content" className="font-mono text-sm text-slate-400 block">
              Nội dung <span className="text-red-500">*</span>
            </label>
            <textarea
              id="content"
              name="content"
              rows={10}
              value={form.content}
              onChange={handleChange}
              placeholder="Nhập nội dung chương..."
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 font-sans text-base text-slate-200 focus:border-blue-400 focus:outline-none resize-y"
            />
            {fieldErrors.content && <p className="text-red-400 text-sm">{fieldErrors.content}</p>}
          </div>

          <div className="space-y-2">
            <label className="font-mono text-sm text-slate-400 block">
              Audio cho chương
            </label>
            <div className="flex items-center gap-3 rounded-lg border border-slate-700 bg-slate-900 px-4 py-3">
              <input
                type="file"
                accept="audio/*"
                onChange={handleFormAudioPick}
                className="block w-full text-sm text-slate-300 file:mr-4 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-blue-400 file:text-slate-950 file:font-mono file:text-xs file:font-bold file:cursor-pointer hover:file:bg-blue-500"
              />
            </div>
            {audioError && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-300 rounded-lg px-4 py-3 text-sm">
                {audioError}
              </div>
            )}
            {audioFile && (
              <p className="text-sm text-slate-300">
                File đã chọn: <span className="text-blue-300">{audioFile.name}</span>
              </p>
            )}
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-blue-400 hover:bg-blue-500 text-slate-950 font-mono text-sm font-bold px-6 py-3 rounded-lg disabled:opacity-60 disabled:cursor-not-allowed transition-colors shadow-lg shadow-blue-400/20"
            >
              {isSubmitting ? 'Đang lưu...' : editingChapterId ? 'Cập nhật chương' : 'Thêm chương'}
            </button>
            <button
              type="button"
              onClick={closeForm}
              disabled={isSubmitting}
              className="border border-slate-600 text-slate-300 font-mono text-sm px-6 py-3 rounded-lg hover:bg-slate-700 disabled:opacity-60 transition-colors"
            >
              Hủy bỏ
            </button>
          </div>
        </section>
      )}

      {/* Chapters Table */}
      {isLoading ? (
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-8 text-center">
          <span className="material-symbols-outlined text-[48px] text-blue-400 opacity-75 block mb-4 animate-spin">
            hourglass_empty
          </span>
          <p className="font-sans text-base text-slate-400">Đang tải dữ liệu...</p>
        </div>
      ) : loadError ? (
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-8 text-center">
          <span className="material-symbols-outlined text-[48px] text-red-400 opacity-75 block mb-4">
            error
          </span>
          <p className="font-sans text-base text-slate-400">{loadError}</p>
        </div>
      ) : chapters.length === 0 ? (
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-8 text-center">
          <span className="material-symbols-outlined text-[48px] text-slate-400 opacity-50 block mb-4">
            format_list_numbered
          </span>
          <p className="font-sans text-base text-slate-400">
            Truyện này chưa có chương nào. Hãy thêm chương mới!
          </p>
        </div>
      ) : (
        <section aria-label="Danh sách chương" className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden shadow-lg shadow-black/20">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-slate-700 border-b border-slate-700">
                  <th className="p-4 font-mono text-xs uppercase tracking-wider text-slate-300 font-semibold w-24 text-center">
                    Số chương
                  </th>
                  <th className="p-4 font-mono text-xs uppercase tracking-wider text-slate-300 font-semibold">
                    Tiêu đề
                  </th>
                  <th className="p-4 font-mono text-xs uppercase tracking-wider text-slate-300 font-semibold w-44">
                    Quyền truy cập
                  </th>
                  <th className="p-4 font-mono text-xs uppercase tracking-wider text-slate-300 font-semibold w-32">
                    Ngày tạo
                  </th>
                  <th className="p-4 font-mono text-xs uppercase tracking-wider text-slate-300 font-semibold w-40 text-right">
                    Thao Tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {chapters.map((chapter) => {
                  const accessConfig = ACCESS_LEVELS[chapter.accessLevel] || ACCESS_LEVELS.PUBLIC
                  return (
                    <tr
                      key={chapter.id}
                      className="hover:bg-slate-700/50 transition-colors group cursor-pointer"
                      onClick={() => setViewingChapter(chapter)}
                    >
                      <td className="p-4 font-mono text-xs text-slate-200 text-center">
                        Chương {chapter.chapterNumber}
                      </td>
                      <td className="p-4">
                        <span className="text-base text-slate-100 font-semibold group-hover:text-blue-400 transition-colors">
                          {chapter.title}
                        </span>
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-mono text-[10px] font-semibold uppercase border ${accessConfig.bgColor} ${accessConfig.textColor} ${accessConfig.borderColor}`}
                        >
                          {accessConfig.label}
                        </span>
                      </td>
                      <td className="p-4 font-sans text-sm text-slate-400">
                        {formatDate(chapter.createdAt)}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-70 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(event) => {
                              event.stopPropagation()
                              setViewingChapter(chapter)
                            }}
                            className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-blue-400/10 rounded transition-colors"
                            title="Xem nội dung"
                          >
                            <span className="material-symbols-outlined text-[20px]">visibility</span>
                          </button>
                          <button
                            onClick={(event) => {
                              event.stopPropagation()
                              openEditForm(chapter)
                            }}
                            className="p-1.5 text-slate-400 hover:text-green-400 hover:bg-green-400/10 rounded transition-colors"
                            title="Chỉnh sửa"
                          >
                            <span className="material-symbols-outlined text-[20px]">edit</span>
                          </button>
                          <button
                            onClick={(event) => {
                              event.stopPropagation()
                              handleDelete(chapter)
                            }}
                            className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded transition-colors"
                            title="Xóa"
                          >
                            <span className="material-symbols-outlined text-[20px]">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* View Content Modal */}
      {viewingChapter && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setViewingChapter(null)}
        >
          <div
            className="bg-slate-800 border border-slate-700 rounded-xl shadow-lg shadow-black/40 max-w-3xl w-full max-h-[80vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-4 p-6 border-b border-slate-700">
              <div>
                <p className="font-mono text-xs uppercase tracking-wider text-slate-400">
                  Chương {viewingChapter.chapterNumber}
                </p>
                <h3 className="font-serif text-xl font-bold text-slate-100 mt-1">
                  {viewingChapter.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setViewingChapter(null)}
                className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-700 rounded transition-colors"
                aria-label="Đóng"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-6 overflow-y-auto space-y-6">
              <div className="whitespace-pre-wrap font-sans text-base text-slate-200 leading-relaxed">
                {viewingChapter.content}
              </div>

              <div className="border-t border-slate-700 pt-6">
                <div className="flex items-center justify-between gap-3 mb-4">
                  <h4 className="font-mono text-sm uppercase tracking-wider text-slate-400">
                    Audio của chương
                  </h4>
                </div>

                {audioError && (
                  <div className="mb-4 bg-red-500/10 border border-red-500/30 text-red-300 rounded-lg px-4 py-3 text-sm">
                    {audioError}
                  </div>
                )}

                {audioFiles.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-slate-700 bg-slate-900/60 p-4 text-sm text-slate-400">
                    Chưa có audio nào cho chương này.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {audioFiles.map((audio) => {
                      const audioUrl = chapterService.buildAudioUrl(audio)

                      return (
                        <div key={audio.id} className="rounded-lg border border-slate-700 bg-slate-900/60 p-3">
                          <div className="flex items-center justify-between gap-3 mb-2">
                            <p className="text-sm font-medium text-slate-200 truncate">{audio.originalFileName}</p>
                            <span className="text-[10px] uppercase tracking-wider text-slate-400">{audio.contentType}</span>
                          </div>

                          <audio controls className="w-full h-10" src={audioUrl}>
                            Trình duyệt của bạn không hỗ trợ audio.
                          </audio>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
