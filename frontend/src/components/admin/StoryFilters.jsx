import { useState, useEffect } from 'react'
import { authorService } from '../../services/authorService'
import { genreService } from '../../services/genreService'

const STATUSES = [
  { value: 'ONGOING', label: 'Đang ra' },
  { value: 'COMPLETED', label: 'Hoàn thành' },
]

export default function StoryFilters({
  onFilterChange,
  onViewModeChange,
  viewMode = 'list',
}) {
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    author: '',
    status: '',
  })
  const [genres, setGenres] = useState([])
  const [authors, setAuthors] = useState([])

  useEffect(() => {
    Promise.all([
      genreService.getGenres(),
      authorService.getAuthors(),
    ])
      .then(([genreRes, authorRes]) => {
        setGenres(genreRes.data || [])
        setAuthors(authorRes.data || [])
      })
      .catch(() => {})
  }, [])

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    const newFilters = { ...filters, [name]: value }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const handleReset = () => {
    const resetFilters = { search: '', category: '', author: '', status: '' }
    setFilters(resetFilters)
    onFilterChange(resetFilters)
  }

  return (
    <section aria-label="Bộ lọc" className="mb-6">
      <form className="bg-slate-800 rounded-xl p-4 border border-slate-700 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap gap-3 flex-1">
          {/* Search Input */}
          <div className="relative w-full sm:w-72 focus-within:ring-2 focus-within:ring-blue-400/50 rounded-lg transition-all">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              search
            </span>
            <input
              type="search"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder="Tìm tên truyện, tác giả..."
              className="bg-slate-900 border border-slate-700 text-slate-200 font-mono text-xs rounded-lg py-2.5 pl-10 pr-4 focus:outline-none focus:border-blue-400 w-full transition-colors"
            />
          </div>

          {/* Category Filter */}
          <div className="relative">
            <select
              name="category"
              value={filters.category}
              onChange={handleFilterChange}
              className="bg-slate-900 border border-slate-700 text-slate-200 font-mono text-xs rounded-lg py-2.5 px-4 focus:outline-none focus:border-blue-400 focus:ring-2 focus-within:ring-blue-400/50 transition-all appearance-none pr-10 min-w-[160px]"
            >
              <option value="">Tất cả Thể loại</option>
              {genres.map((genre) => (
                <option key={genre.id} value={genre.id}>
                  {genre.name}
                </option>
              ))}
            </select>
            <span className="material-symbols-outlined pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
              expand_more
            </span>
          </div>

          {/* Author Filter */}
          <div className="relative">
            <select
              name="author"
              value={filters.author}
              onChange={handleFilterChange}
              className="bg-slate-900 border border-slate-700 text-slate-200 font-mono text-xs rounded-lg py-2.5 px-4 focus:outline-none focus:border-blue-400 focus:ring-2 focus-within:ring-blue-400/50 transition-all appearance-none pr-10 min-w-[160px]"
            >
              <option value="">Tất cả Tác giả</option>
              {authors.map((author) => (
                <option key={author.id} value={author.id}>
                  {author.name}
                </option>
              ))}
            </select>
            <span className="material-symbols-outlined pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
              expand_more
            </span>
          </div>

          {/* Status Filter */}
          <div className="relative">
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="bg-slate-900 border border-slate-700 text-slate-200 font-mono text-xs rounded-lg py-2.5 px-4 focus:outline-none focus:border-blue-400 focus:ring-2 focus-within:ring-blue-400/50 transition-all appearance-none pr-10 min-w-[170px]"
            >
              <option value="">Tất cả Trạng thái</option>
              {STATUSES.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
            <span className="material-symbols-outlined pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
              expand_more
            </span>
          </div>
        </div>

        {/* Reset Button */}
        <button
          type="button"
          onClick={handleReset}
          className="px-4 py-2 text-slate-400 hover:text-slate-200 hover:bg-slate-700 rounded-lg transition-colors border border-slate-700"
          title="Đặt lại bộ lọc"
        >
          <span className="font-mono text-xs uppercase tracking-wider">Đặt lại</span>
        </button>
      </form>
    </section>
  )
}
