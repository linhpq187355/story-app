export default function FormActions({
  isSubmitting,
  onCancel,
}) {
  return (
    <section
      aria-label="Thao tác"
      className="bg-slate-800 rounded-xl border border-slate-700 p-6 flex flex-col gap-4"
    >
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-blue-400 text-slate-950 font-mono text-sm font-bold py-3 px-6 rounded-lg hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors shadow-lg shadow-blue-400/20 flex items-center justify-center gap-2"
      >
        <span className="material-symbols-outlined text-[20px]">
          save
        </span>

        {isSubmitting ? 'Đang lưu...' : 'Lưu truyện'}
      </button>

      <button
        type="button"
        onClick={onCancel}
        disabled={isSubmitting}
        className="w-full border border-slate-600 text-slate-300 font-mono text-sm py-3 px-6 rounded-lg hover:bg-slate-700 disabled:opacity-60 transition-colors"
      >
        Hủy bỏ
      </button>
    </section>
  )
}