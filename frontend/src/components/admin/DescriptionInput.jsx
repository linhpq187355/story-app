export default function DescriptionInput({ formData, onChange }) {
  return (
    <section
      aria-label="Nội dung tóm tắt"
      className="bg-slate-800 rounded-xl border border-slate-700 p-6 space-y-2"
    >
      <label
        htmlFor="description"
        className="font-mono text-sm text-slate-400 block"
      >
        Tóm tắt/Giới thiệu truyện
      </label>

      <div className="focus-within:ring-2 focus-within:ring-blue-400/50 rounded-lg transition-all h-64">
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={onChange}
          className="w-full h-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 font-sans text-base text-slate-200 focus:border-blue-400 focus:outline-none transition-colors resize-none placeholder:text-slate-500"
          placeholder="Nhập tóm tắt/giới thiệu truyện..."
        />
      </div>
    </section>
  )
}