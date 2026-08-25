import { useEffect, useMemo, useState } from 'react'
import AdminLayout from '../../layouts/AdminLayout'
import { authorService } from '../../services/authorService'
import { genreService } from '../../services/genreService'
import { useConfirm } from '../../contexts/ConfirmDialog'

const EMPTY_AUTHOR_FORM = { name: '', bio: '' }
const EMPTY_GENRE_FORM = { name: '' }

export default function CategoryManagementPage() {
  const confirm = useConfirm()

  const [authors, setAuthors] = useState([])
  const [genres, setGenres] = useState([])
  const [authorFilter, setAuthorFilter] = useState('')
  const [genreFilter, setGenreFilter] = useState('')
  const [authorForm, setAuthorForm] = useState(EMPTY_AUTHOR_FORM)
  const [genreForm, setGenreForm] = useState(EMPTY_GENRE_FORM)
  const [authorErrors, setAuthorErrors] = useState({})
  const [genreErrors, setGenreErrors] = useState({})
  const [editingAuthorId, setEditingAuthorId] = useState(null)
  const [editingGenreId, setEditingGenreId] = useState(null)
  const [isAuthorSubmitting, setIsAuthorSubmitting] = useState(false)
  const [isGenreSubmitting, setIsGenreSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const filteredAuthors = useMemo(() => {
    const keyword = authorFilter.trim().toLowerCase()
    if (!keyword) return authors
    return authors.filter((author) => {
      const haystack = `${author.name} ${author.bio || ''}`.toLowerCase()
      return haystack.includes(keyword)
    })
  }, [authors, authorFilter])

  const filteredGenres = useMemo(() => {
    const keyword = genreFilter.trim().toLowerCase()
    if (!keyword) return genres
    return genres.filter((genre) => genre.name.toLowerCase().includes(keyword))
  }, [genres, genreFilter])

  const loadData = async () => {
    try {
      setIsLoading(true)
      const [authorRes, genreRes] = await Promise.all([
        authorService.getAuthors(),
        genreService.getGenres(),
      ])
      setAuthors(authorRes.data || [])
      setGenres(genreRes.data || [])
    } catch (error) {
      console.error('Lỗi tải dữ liệu tác giả/thể loại:', error)
      alert('Không thể tải dữ liệu tác giả và thể loại.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const validateAuthor = () => {
    const errors = {}
    const name = authorForm.name?.trim()
    if (!name) errors.name = 'Tên tác giả không được để trống.'
    if (name && name.length > 100) errors.name = 'Tên tác giả tối đa 100 ký tự.'
    if (authorForm.bio && authorForm.bio.trim().length > 1000) {
      errors.bio = 'Tiểu sử tối đa 1000 ký tự.'
    }
    setAuthorErrors(errors)
    return Object.keys(errors).length === 0
  }

  const validateGenre = () => {
    const errors = {}
    const name = genreForm.name?.trim()
    if (!name) errors.name = 'Tên thể loại không được để trống.'
    if (name && name.length > 100) errors.name = 'Tên thể loại tối đa 100 ký tự.'
    setGenreErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleAuthorSubmit = async (e) => {
    e.preventDefault()
    if (!validateAuthor()) return

    try {
      setIsAuthorSubmitting(true)
      const payload = {
        name: authorForm.name.trim(),
        bio: authorForm.bio?.trim() || '',
      }

      if (editingAuthorId) {
        await authorService.updateAuthor(editingAuthorId, payload)
      } else {
        await authorService.createAuthor(payload)
      }

      setAuthorForm(EMPTY_AUTHOR_FORM)
      setEditingAuthorId(null)
      setAuthorErrors({})
      await loadData()
    } catch (error) {
      const message = error?.response?.data?.message || 'Lưu tác giả thất bại.'
      setAuthorErrors({ form: message })
    } finally {
      setIsAuthorSubmitting(false)
    }
  }

  const handleGenreSubmit = async (e) => {
    e.preventDefault()
    if (!validateGenre()) return

    try {
      setIsGenreSubmitting(true)
      const payload = { name: genreForm.name.trim() }

      if (editingGenreId) {
        await genreService.updateGenre(editingGenreId, payload)
      } else {
        await genreService.createGenre(payload)
      }

      setGenreForm(EMPTY_GENRE_FORM)
      setEditingGenreId(null)
      setGenreErrors({})
      await loadData()
    } catch (error) {
      const message = error?.response?.data?.message || 'Lưu thể loại thất bại.'
      setGenreErrors({ form: message })
    } finally {
      setIsGenreSubmitting(false)
    }
  }

  const handleEditAuthor = (author) => {
    setEditingAuthorId(author.id)
    setAuthorForm({ name: author.name, bio: author.bio || '' })
    setAuthorErrors({})
  }

  const handleEditGenre = (genre) => {
    setEditingGenreId(genre.id)
    setGenreForm({ name: genre.name })
    setGenreErrors({})
  }

  const handleDeleteAuthor = async (author) => {
    const confirmed = await confirm({
      title: 'Xác nhận xóa tác giả',
      message: `Bạn có chắc chắn muốn xóa tác giả "${author.name}"?`,
      confirmText: 'Xóa',
      cancelText: 'Hủy',
      type: 'error',
    })

    if (!confirmed) return

    try {
      await authorService.deleteAuthor(author.id)
      await loadData()
      if (editingAuthorId === author.id) {
        setEditingAuthorId(null)
        setAuthorForm(EMPTY_AUTHOR_FORM)
      }
    } catch (error) {
      alert(error?.response?.data?.message || 'Xóa tác giả thất bại.')
    }
  }

  const handleDeleteGenre = async (genre) => {
    const confirmed = await confirm({
      title: 'Xác nhận xóa thể loại',
      message: `Bạn có chắc chắn muốn xóa thể loại "${genre.name}"?`,
      confirmText: 'Xóa',
      cancelText: 'Hủy',
      type: 'error',
    })

    if (!confirmed) return

    try {
      await genreService.deleteGenre(genre.id)
      await loadData()
      if (editingGenreId === genre.id) {
        setEditingGenreId(null)
        setGenreForm(EMPTY_GENRE_FORM)
      }
    } catch (error) {
      alert(error?.response?.data?.message || 'Xóa thể loại thất bại.')
    }
  }

  return (
    <AdminLayout>
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h2 className="font-serif text-3xl font-bold text-slate-100">Quản lý Tác giả & Thể loại</h2>
          <p className="font-sans text-base text-slate-400 mt-1">
            Tạo, cập nhật, lọc và xóa tác giả, thể loại của hệ thống.
          </p>
        </div>
      </header>

      {isLoading ? (
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-8 text-center">
          <p className="text-slate-400">Đang tải danh sách...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          <section className="bg-slate-800 rounded-xl border border-slate-700 p-5">
            <div className="flex items-center justify-between gap-3 mb-5">
              <h3 className="font-serif text-2xl font-bold text-slate-100">Tác giả</h3>
            </div>

            <form onSubmit={handleAuthorSubmit} className="space-y-4 mb-6">
              <div>
                <label className="block text-xs uppercase tracking-wider text-slate-300 mb-2 font-mono">Tên tác giả</label>
                <input
                  value={authorForm.name}
                  onChange={(e) => setAuthorForm((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-400/50"
                  placeholder="Nhập tên tác giả"
                />
                {authorErrors.name && <p className="text-red-400 text-sm mt-1">{authorErrors.name}</p>}
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-slate-300 mb-2 font-mono">Tiểu sử</label>
                <textarea
                  rows={4}
                  value={authorForm.bio}
                  onChange={(e) => setAuthorForm((prev) => ({ ...prev, bio: e.target.value }))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-400/50"
                  placeholder="Mô tả ngắn về tác giả"
                />
                {authorErrors.bio && <p className="text-red-400 text-sm mt-1">{authorErrors.bio}</p>}
              </div>

              {authorErrors.form && <p className="text-red-400 text-sm">{authorErrors.form}</p>}

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={isAuthorSubmitting}
                  className="bg-blue-400 hover:bg-blue-500 text-slate-950 font-bold px-4 py-2 rounded-lg disabled:opacity-60"
                >
                  {isAuthorSubmitting ? 'Đang lưu...' : editingAuthorId ? 'Cập nhật' : 'Thêm tác giả'}
                </button>
                {editingAuthorId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingAuthorId(null)
                      setAuthorForm(EMPTY_AUTHOR_FORM)
                      setAuthorErrors({})
                    }}
                    className="border border-slate-600 text-slate-200 px-4 py-2 rounded-lg"
                  >
                    Hủy
                  </button>
                )}
              </div>
            </form>

            <div className="mb-4">
              <input
                value={authorFilter}
                onChange={(e) => setAuthorFilter(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-400/50"
                placeholder="Tìm kiếm tác giả..."
              />
            </div>

            <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
              {filteredAuthors.length === 0 ? (
                <div className="rounded-lg border border-dashed border-slate-600 p-4 text-center text-slate-400">
                  Không có tác giả nào.
                </div>
              ) : (
                filteredAuthors.map((author) => (
                  <div key={author.id} className="flex items-start justify-between gap-3 rounded-lg border border-slate-700 bg-slate-900 p-3">
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-100">{author.name}</p>
                      <p className="text-sm text-slate-400 line-clamp-2">{author.bio || 'Chưa có tiểu sử'}</p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleEditAuthor(author)}
                        className="px-2 py-1 rounded bg-slate-700 text-slate-200 text-sm"
                      >
                        Sửa
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteAuthor(author)}
                        className="px-2 py-1 rounded bg-red-500/20 text-red-300 text-sm"
                      >
                        Xóa
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="bg-slate-800 rounded-xl border border-slate-700 p-5">
            <div className="flex items-center justify-between gap-3 mb-5">
              <h3 className="font-serif text-2xl font-bold text-slate-100">Thể loại</h3>
            </div>

            <form onSubmit={handleGenreSubmit} className="space-y-4 mb-6">
              <div>
                <label className="block text-xs uppercase tracking-wider text-slate-300 mb-2 font-mono">Tên thể loại</label>
                <input
                  value={genreForm.name}
                  onChange={(e) => setGenreForm((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-400/50"
                  placeholder="Nhập tên thể loại"
                />
                {genreErrors.name && <p className="text-red-400 text-sm mt-1">{genreErrors.name}</p>}
              </div>

              {genreErrors.form && <p className="text-red-400 text-sm">{genreErrors.form}</p>}

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={isGenreSubmitting}
                  className="bg-blue-400 hover:bg-blue-500 text-slate-950 font-bold px-4 py-2 rounded-lg disabled:opacity-60"
                >
                  {isGenreSubmitting ? 'Đang lưu...' : editingGenreId ? 'Cập nhật' : 'Thêm thể loại'}
                </button>
                {editingGenreId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingGenreId(null)
                      setGenreForm(EMPTY_GENRE_FORM)
                      setGenreErrors({})
                    }}
                    className="border border-slate-600 text-slate-200 px-4 py-2 rounded-lg"
                  >
                    Hủy
                  </button>
                )}
              </div>
            </form>

            <div className="mb-4">
              <input
                value={genreFilter}
                onChange={(e) => setGenreFilter(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-400/50"
                placeholder="Tìm kiếm thể loại..."
              />
            </div>

            <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
              {filteredGenres.length === 0 ? (
                <div className="rounded-lg border border-dashed border-slate-600 p-4 text-center text-slate-400">
                  Không có thể loại nào.
                </div>
              ) : (
                filteredGenres.map((genre) => (
                  <div key={genre.id} className="flex items-center justify-between gap-3 rounded-lg border border-slate-700 bg-slate-900 p-3">
                    <div>
                      <p className="font-semibold text-slate-100">{genre.name}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleEditGenre(genre)}
                        className="px-2 py-1 rounded bg-slate-700 text-slate-200 text-sm"
                      >
                        Sửa
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteGenre(genre)}
                        className="px-2 py-1 rounded bg-red-500/20 text-red-300 text-sm"
                      >
                        Xóa
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      )}
    </AdminLayout>
  )
}
