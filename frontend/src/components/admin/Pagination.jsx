export default function Pagination({
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  itemsPerPage = 10,
  onPageChange,
}) {
  const startItem = (currentPage - 1) * itemsPerPage + 1
  const endItem = Math.min(currentPage * itemsPerPage, totalItems)

  const getPageNumbers = () => {
    const pages = []
    const maxPagesToShow = 5

    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // Always show first page
      pages.push(1)

      // Calculate range around current page
      const start = Math.max(2, currentPage - 1)
      const end = Math.min(totalPages - 1, currentPage + 1)

      if (start > 2) {
        pages.push('...')
      }

      for (let i = start; i <= end; i++) {
        pages.push(i)
      }

      if (end < totalPages - 1) {
        pages.push('...')
      }

      // Always show last page
      pages.push(totalPages)
    }

    return pages
  }

  return (
    <nav aria-label="Phân trang" className="bg-slate-700 border-t border-slate-700 p-4 flex items-center justify-between">
      <span className="font-mono text-xs text-slate-400">
        Hiển thị {startItem}-{endItem} của {totalItems} truyện
      </span>

      <ul className="flex gap-1">
        {/* Previous Button */}
        <li>
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1.5 rounded bg-slate-800 text-slate-200 hover:bg-slate-600 hover:text-blue-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-mono text-xs"
          >
            Trước
          </button>
        </li>

        {/* Page Numbers */}
        {getPageNumbers().map((page, index) => {
          if (page === '...') {
            return (
              <li key={`dots-${index}`}>
                <span className="px-2 py-1.5 text-slate-400 font-mono text-xs">
                  ...
                </span>
              </li>
            )
          }

          const isCurrentPage = page === currentPage
          return (
            <li key={page}>
              <button
                onClick={() => onPageChange(page)}
                className={`px-3 py-1.5 rounded font-mono text-xs transition-colors ${
                  isCurrentPage
                    ? 'bg-blue-400 text-slate-900 font-bold'
                    : 'bg-slate-800 text-slate-200 hover:bg-slate-600 hover:text-blue-400'
                }`}
                aria-current={isCurrentPage ? 'page' : undefined}
              >
                {page}
              </button>
            </li>
          )
        })}

        {/* Next Button */}
        <li>
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-1.5 rounded bg-slate-800 text-slate-200 hover:bg-slate-600 hover:text-blue-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-mono text-xs"
          >
            Sau
          </button>
        </li>
      </ul>
    </nav>
  )
}