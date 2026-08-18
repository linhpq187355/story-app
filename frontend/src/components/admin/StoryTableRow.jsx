const STATUS_CONFIG = {
  ONGOING: {
    label: 'Đang ra',
    dotColor: 'bg-amber-400',
    textColor: 'text-amber-400',
    bgColor: 'bg-amber-500/15',
    borderColor: 'border-amber-500/20',
  },
  COMPLETED: {
    label: 'Hoàn thành',
    dotColor: 'bg-green-400',
    textColor: 'text-green-400',
    bgColor: 'bg-green-500/15',
    borderColor: 'border-green-500/20',
  },
}

export default function StoryTableRow({ story, onEdit, onDelete, onManageChapters, onViewDetail }) {
  const statusConfig = STATUS_CONFIG[story.status] || STATUS_CONFIG.ONGOING
  const isVip = story.isVip || false

  return (
    <tr
      className="hover:bg-slate-700/50 transition-colors group border-l-2 border-transparent cursor-pointer"
      onClick={() => onViewDetail?.(story.id)}
    >
      {/* ID */}
      <td className="p-4 font-mono text-xs text-slate-200 text-center">
        #{story.id}
      </td>

      {/* Cover Image */}
      <td className="p-4">
        {story.coverImage ? (
          <img
            src={`http://localhost:8080${story.coverImage}`}
            alt={`Bìa truyện ${story.title}`}
            className="w-12 h-16 object-cover rounded shadow-md border border-slate-600 group-hover:border-blue-400/50 transition-colors"
          />
        ) : (
          <div className="w-12 h-16 rounded shadow-md border border-slate-600 bg-slate-900 flex items-center justify-center">
            <span className="material-symbols-outlined text-slate-600 text-[20px]">
              image_not_supported
            </span>
          </div>
        )}
      </td>

      {/* Title & Info */}
      <td className="p-4">
        <div className="flex flex-col">
          <span className="text-lg text-slate-100 font-semibold group-hover:text-blue-400 transition-colors">
            {story.title}
          </span>
          <div className="flex items-center gap-2 mt-1">
            {isVip && (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-400 border border-purple-500/30">
                VIP
              </span>
            )}
            {story.totalChapters > 0 && (
              <span className="font-mono text-[10px] font-semibold text-slate-400">
                Chương: {story.totalChapters}
              </span>
            )}
          </div>
        </div>
      </td>

      {/* Author */}
      <td className="p-4 font-sans text-sm text-slate-200">
        {story.author || 'N/A'}
      </td>

      {/* Category */}
      <td className="p-4">
        <span className="inline-block px-2 py-1 bg-slate-700 rounded text-slate-200 font-mono text-[10px] font-semibold uppercase">
          {story.category || 'Không xác định'}
        </span>
      </td>

      {/* View Count */}
      <td className="p-4 text-right">
        <span className="font-mono text-sm text-slate-200 font-semibold">
          {(story.viewCount ?? 0).toLocaleString('vi-VN')}
        </span>
      </td>

      {/* Status */}
      <td className="p-4">
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-mono text-[10px] font-semibold uppercase border ${statusConfig.bgColor} ${statusConfig.textColor} ${statusConfig.borderColor}`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dotColor}`}></span>
          {statusConfig.label}
        </span>
      </td>

      {/* Actions */}
      <td className="p-4 text-right">
        <div className="flex items-center justify-end gap-2 opacity-70 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(event) => {
              event.stopPropagation()
              onManageChapters(story.id)
            }}
            className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-blue-400/10 rounded transition-colors"
            title="Quản lý Chương"
          >
            <span className="material-symbols-outlined text-[20px]">format_list_numbered</span>
          </button>
          <button
            onClick={(event) => {
              event.stopPropagation()
              onEdit(story.id)
            }}
            className="p-1.5 text-slate-400 hover:text-green-400 hover:bg-green-400/10 rounded transition-colors"
            title="Chỉnh sửa"
          >
            <span className="material-symbols-outlined text-[20px]">edit</span>
          </button>
          <button
            onClick={(event) => {
              event.stopPropagation()
              onDelete(story.id)
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
}
