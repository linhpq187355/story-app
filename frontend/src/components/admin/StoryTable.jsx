import StoryTableRow from './StoryTableRow'

export default function StoryTable({ stories, onEdit, onDelete, onManageChapters, onViewDetail }) {
  if (stories.length === 0) {
    return (
      <section aria-label="Danh sách truyện" className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden shadow-lg shadow-black/20">
        <div className="p-8 text-center">
          <span className="material-symbols-outlined text-[48px] text-slate-400 opacity-50 block mb-4">
            menu_book
          </span>
          <p className="font-sans text-base text-slate-400">
            Không có truyện nào. Hãy thêm truyện mới!
          </p>
        </div>
      </section>
    )
  }

  return (
    <section aria-label="Danh sách truyện" className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden shadow-lg shadow-black/20">
      {/* Table Wrapper */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-slate-700 border-b border-slate-700">
              <th className="p-4 font-mono text-xs uppercase tracking-wider text-slate-300 font-semibold w-16 text-center">
                ID
              </th>
              <th className="p-4 font-mono text-xs uppercase tracking-wider text-slate-300 font-semibold w-24">
                Bìa
              </th>
              <th className="p-4 font-mono text-xs uppercase tracking-wider text-slate-300 font-semibold">
                Tên Truyện
              </th>
              <th className="p-4 font-mono text-xs uppercase tracking-wider text-slate-300 font-semibold w-40">
                Tác Giả
              </th>
              <th className="p-4 font-mono text-xs uppercase tracking-wider text-slate-300 font-semibold w-40">
                Thể Loại
              </th>
              <th className="p-4 font-mono text-xs uppercase tracking-wider text-slate-300 font-semibold w-32 text-right">
                Lượt xem
              </th>
              <th className="p-4 font-mono text-xs uppercase tracking-wider text-slate-300 font-semibold w-32">
                Trạng Thái
              </th>
              <th className="p-4 font-mono text-xs uppercase tracking-wider text-slate-300 font-semibold w-48 text-right">
                Thao Tác
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/50">
            {stories.map((story) => (
              <StoryTableRow
                key={story.id}
                story={story}
                onEdit={onEdit}
                onDelete={onDelete}
                onManageChapters={onManageChapters}
                onViewDetail={onViewDetail}
              />
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}