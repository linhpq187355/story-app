export default function BasicInfoSection({
  formData,
  onChange,
  authors = [],
  genres = [],
  errors = {},
}) {
  return (
    <section
      aria-label="Thông tin cơ bản"
      className="bg-slate-800 rounded-xl border border-slate-700 p-6 space-y-6"
    >
      <h2 className="font-serif text-xl font-bold text-slate-100 border-b border-slate-700 pb-4">
        Thông tin cơ bản
      </h2>

      {/* Tên truyện */}
      <div className="space-y-2">
        <label
          htmlFor="title"
          className="font-mono text-sm text-slate-400 block"
        >
          Tên truyện <span className="text-red-500">*</span>
        </label>

        <input
          id="title"
          name="title"
          type="text"
          value={formData.title}
          onChange={onChange}
          placeholder="Nhập tên truyện..."
          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-slate-200 focus:border-blue-400 focus:outline-none"
        />
        {errors.title && <p className="text-red-400 text-sm">{errors.title}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Tác giả */}
        <div className="space-y-2">
          <label
            htmlFor="authorId"
            className="font-mono text-sm text-slate-400 block"
          >
            Tác giả <span className="text-red-500">*</span>
          </label>

          <div className="relative">
            <select
              id="authorId"
              name="authorId"
              value={formData.authorId}
              onChange={onChange}
              className="w-full appearance-none bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-slate-200 focus:border-blue-400 focus:outline-none"
            >
              <option value="">Chọn tác giả...</option>

              {authors.map((author) => (
                <option key={author.id} value={author.id}>
                  {author.name}
                </option>
              ))}
            </select>

            <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
              ▼
            </span>
          </div>
          {errors.authorId && <p className="text-red-400 text-sm">{errors.authorId}</p>}
        </div>

        {/* Thể loại */}
        <div className="space-y-2">
          <label
            htmlFor="genreId"
            className="font-mono text-sm text-slate-400 block"
          >
            Thể loại <span className="text-red-500">*</span>
          </label>

          <div className="relative">
            <select
              id="genreId"
              name="genreId"
              value={formData.genreId}
              onChange={onChange}
              className="w-full appearance-none bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-slate-200 focus:border-blue-400 focus:outline-none"
            >
              <option value="">Chọn thể loại...</option>

              {genres.map((genre) => (
                <option key={genre.id} value={genre.id}>
                  {genre.name}
                </option>
              ))}
            </select>

            <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
              ▼
            </span>
          </div>
          {errors.genreId && <p className="text-red-400 text-sm">{errors.genreId}</p>}
        </div>
      </div>

      {/* Trạng thái */}
      <fieldset className="space-y-2">
        <legend className="font-mono text-sm text-slate-400">
          Trạng thái <span className="text-red-500">*</span>
        </legend>

        <div className="flex gap-6 bg-slate-900 border border-slate-700 rounded-lg px-4 py-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="status"
              value="ONGOING"
              checked={formData.status === "ONGOING"}
              onChange={onChange}
            />
            <span className="text-slate-200">Đang ra</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="status"
              value="COMPLETED"
              checked={formData.status === "COMPLETED"}
              onChange={onChange}
            />
            <span className="text-slate-200">Hoàn thành</span>
          </label>
        </div>
      </fieldset>
    </section>
  );
}
