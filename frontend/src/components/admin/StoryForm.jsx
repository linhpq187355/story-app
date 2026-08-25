import { useState, useEffect } from 'react'

const CATEGORIES = [
  'Tiên Hiệp',
  'Kiếm Hiệp',
  'Huyền Huyễn',
  'Đô Thị',
  'Khoa Học Viễn Tưởng',
  'Lịch Sử',
  'Kỳ Ảo',
]

const STATUSES = [
  { value: 'dang_ra', label: 'Đang ra' },
  { value: 'hoan_thanh', label: 'Hoàn thành' },
  { value: 'tam_dung', label: 'Tạm dừng' },
]

/**
 * Form component for adding/editing stories
 * Can be wrapped in a modal dialog
 */
export default function StoryForm({ initialData, onSubmit, onCancel, isLoading = false }) {
  const [formData, setFormData] = useState(
    initialData || {
      title: '',
      author: '',
      description: '',
      category: '',
      status: 'dang_ra',
      isVip: false,
      coverImage: '',
    }
  )

  const [imagePreview, setImagePreview] = useState(initialData?.coverImage || '')
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (initialData?.coverImage) {
      setImagePreview(initialData.coverImage)
    }
  }, [initialData])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  const handleImageChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setImagePreview(event.target?.result)
        setFormData((prev) => ({ ...prev, coverImage: event.target?.result }))
      }
      reader.readAsDataURL(file)
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Tên truyện là bắt buộc'
    }

    if (!formData.author.trim()) {
      newErrors.author = 'Tác giả là bắt buộc'
    }

    if (!formData.category) {
      newErrors.category = 'Thể loại là bắt buộc'
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Mô tả là bắt buộc'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    try {
      await onSubmit(formData)
    } catch (error) {
      console.error('Form submission error:', error)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Cover Image Preview & Upload */}
      <div>
        <label className="block font-label-md text-label-md text-on-surface font-semibold mb-2">
          Bìa Truyện
        </label>
        <div className="flex gap-4">
          {/* Preview */}
          <div className="w-24 h-32 rounded-lg border-2 border-dashed border-outline-variant flex items-center justify-center bg-surface-container-low overflow-hidden">
            {imagePreview ? (
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="material-symbols-outlined text-on-surface-variant text-[40px]">
                image
              </span>
            )}
          </div>

          {/* Upload Input */}
          <div className="flex-1">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="block w-full text-sm text-on-surface-variant file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-on-primary hover:file:bg-primary-container"
            />
            <p className="font-label-sm text-label-sm text-on-surface-variant mt-2">
              Hỗ trợ: JPG, PNG, GIF. Tối đa 5MB
            </p>
          </div>
        </div>
      </div>

      {/* Title */}
      <div>
        <label className="block font-label-md text-label-md text-on-surface font-semibold mb-2">
          Tên Truyện *
        </label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="Nhập tên truyện..."
          className={`w-full px-4 py-2.5 bg-surface-container-low border rounded-lg font-body-md text-body-md text-on-surface focus:outline-none focus:ring-2 transition-all ${
            errors.title
              ? 'border-error focus:ring-error/50'
              : 'border-outline-variant focus:border-primary focus:ring-primary/50'
          }`}
        />
        {errors.title && (
          <p className="font-label-sm text-label-sm text-error mt-1">{errors.title}</p>
        )}
      </div>

      {/* Author */}
      <div>
        <label className="block font-label-md text-label-md text-on-surface font-semibold mb-2">
          Tác Giả *
        </label>
        <input
          type="text"
          name="author"
          value={formData.author}
          onChange={handleChange}
          placeholder="Nhập tên tác giả..."
          className={`w-full px-4 py-2.5 bg-surface-container-low border rounded-lg font-body-md text-body-md text-on-surface focus:outline-none focus:ring-2 transition-all ${
            errors.author
              ? 'border-error focus:ring-error/50'
              : 'border-outline-variant focus:border-primary focus:ring-primary/50'
          }`}
        />
        {errors.author && (
          <p className="font-label-sm text-label-sm text-error mt-1">{errors.author}</p>
        )}
      </div>

      {/* Category */}
      <div>
        <label className="block font-label-md text-label-md text-on-surface font-semibold mb-2">
          Thể Loại *
        </label>
        <select
          name="category"
          value={formData.category}
          onChange={handleChange}
          className={`w-full px-4 py-2.5 bg-surface-container-low border rounded-lg font-body-md text-body-md text-on-surface focus:outline-none focus:ring-2 transition-all appearance-none ${
            errors.category
              ? 'border-error focus:ring-error/50'
              : 'border-outline-variant focus:border-primary focus:ring-primary/50'
          }`}
        >
          <option value="">-- Chọn Thể Loại --</option>
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        {errors.category && (
          <p className="font-label-sm text-label-sm text-error mt-1">{errors.category}</p>
        )}
      </div>

      {/* Status */}
      <div>
        <label className="block font-label-md text-label-md text-on-surface font-semibold mb-2">
          Trạng Thái
        </label>
        <select
          name="status"
          value={formData.status}
          onChange={handleChange}
          className="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant rounded-lg font-body-md text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all appearance-none"
        >
          {STATUSES.map((status) => (
            <option key={status.value} value={status.value}>
              {status.label}
            </option>
          ))}
        </select>
      </div>

      {/* Description */}
      <div>
        <label className="block font-label-md text-label-md text-on-surface font-semibold mb-2">
          Mô Tả *
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Nhập mô tả truyện..."
          rows="5"
          className={`w-full px-4 py-2.5 bg-surface-container-low border rounded-lg font-body-md text-body-md text-on-surface focus:outline-none focus:ring-2 transition-all resize-none ${
            errors.description
              ? 'border-error focus:ring-error/50'
              : 'border-outline-variant focus:border-primary focus:ring-primary/50'
          }`}
        />
        {errors.description && (
          <p className="font-label-sm text-label-sm text-error mt-1">
            {errors.description}
          </p>
        )}
      </div>

      {/* VIP Checkbox */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="isVip"
          name="isVip"
          checked={formData.isVip}
          onChange={handleChange}
          className="w-5 h-5 rounded bg-surface-container-low border border-outline-variant cursor-pointer"
        />
        <label
          htmlFor="isVip"
          className="font-label-md text-label-md text-on-surface cursor-pointer select-none"
        >
          Đây là truyện VIP
        </label>
      </div>

      {/* Form Actions */}
      <div className="flex gap-3 pt-4 border-t border-outline-variant">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="flex-1 px-4 py-2.5 bg-surface-variant text-on-surface rounded-lg font-label-md text-label-md hover:bg-surface-bright transition-colors disabled:opacity-50"
        >
          Hủy
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 px-4 py-2.5 bg-primary text-on-primary rounded-lg font-label-md text-label-md font-bold hover:bg-primary-container transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isLoading && (
            <span className="material-symbols-outlined animate-spin">hourglass_empty</span>
          )}
          {isLoading ? 'Đang xử lý...' : 'Lưu Truyện'}
        </button>
      </div>
    </form>
  )
}
