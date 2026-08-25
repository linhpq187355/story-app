import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { storyService } from '../../services/storyService'
import { authorService } from '../../services/authorService'
import { genreService } from '../../services/genreService'
import AdminLayout from '../../layouts/AdminLayout'
import BasicInfoSection from '../../components/admin/BasicInfoSection'
import DescriptionInput from '../../components/admin/DescriptionInput'
import CoverUpload from '../../components/admin/CoverUpload'
import FormActions from '../../components/admin/FormAction'

const EMPTY_FORM = {
  title: '',
  authorId: '',
  genreId: '',
  description: '',
  status: 'ONGOING',
  coinPrice: 0,
  version: null,
}

export default function StoryFormPage() {
  const navigate = useNavigate()
  const { storyId } = useParams()
  const isEditMode = Boolean(storyId)

  const [formData, setFormData] = useState(EMPTY_FORM)

  // Quản lý riêng file vật lý và link ảnh xem trước
  const [coverFile, setCoverFile] = useState(null)
  const [coverPreviewUrl, setCoverPreviewUrl] = useState('')

  const [authors, setAuthors] = useState([])
  const [genres, setGenres] = useState([])

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(isEditMode)
  const [formError, setFormError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})

  // Tải danh sách tác giả và thể loại cho dropdown
  useEffect(() => {
    Promise.all([authorService.getAuthors(), genreService.getGenres()])
      .then(([authorRes, genreRes]) => {
        setAuthors(authorRes.data || [])
        setGenres(genreRes.data || [])
      })
      .catch(() => setFormError('Không thể tải danh sách tác giả/thể loại.'))
  }, [])

  // Nếu là chế độ sửa, lấy dữ liệu cũ đổ vào form
  useEffect(() => {
    if (isEditMode) {
      fetchStoryDetails()
    }
  }, [storyId])

  const fetchStoryDetails = async () => {
    try {
      const response = await storyService.getStoryById(storyId)
      const story = response.data

      setFormData({
        title: story.title || '',
        authorId: story.authorId != null ? String(story.authorId) : '',
        genreId: story.genreId != null ? String(story.genreId) : '',
        description: story.description || '',
        status: story.status || 'ONGOING',
        coinPrice: story.coinPrice != null ? story.coinPrice : 0,
        version: story.version != null ? story.version : null,
      })

      // Set link ảnh cũ (từ DB) để hiển thị preview
      setCoverPreviewUrl(story.coverImageUrl ? `http://localhost:8080${story.coverImageUrl}` : '')
    } catch (error) {
      setFormError('Không thể tải thông tin truyện!')
      navigate('/admin/stories')
    } finally {
      setIsLoading(false)
    }
  }

  // Hàm handle chung cho các input text/select/radio
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  // Hàm nhận file và link preview từ component CoverUpload
  const handleCoverChange = (file, previewUrl) => {
    setCoverFile(file)
    setCoverPreviewUrl(previewUrl)
  }

  const validateForm = () => {
    const errors = {}
    if (!formData.title.trim()) errors.title = 'Tên truyện không được để trống.'
    if (!formData.authorId) errors.authorId = 'Vui lòng chọn tác giả.'
    if (!formData.genreId) errors.genreId = 'Vui lòng chọn thể loại.'
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError('')

    if (!validateForm()) return

    setIsSubmitting(true)

    try {
      // 1. Tạo đối tượng FormData để chứa cả JSON và File
      const submitData = new FormData()

      // 2. Chuyển đổi dữ liệu Form sang object JSON
      const storyRequest = {
        title: formData.title.trim(),
        authorId: Number(formData.authorId),
        genreId: Number(formData.genreId),
        description: formData.description,
        status: formData.status,
        coinPrice: Number(formData.coinPrice) || 0,
        version: formData.version,
      }

      // 3. Nén JSON thành Blob và đưa vào field "data" (Khớp với @RequestPart("data") bên Spring Boot)
      submitData.append(
        'data',
        new Blob([JSON.stringify(storyRequest)], { type: 'application/json' })
      )

      // 4. Nếu có chọn file ảnh thật, đính kèm vào field "coverImage"
      if (coverFile) {
        submitData.append('coverImage', coverFile)
      }

      if (isEditMode) {
        await storyService.updateStory(storyId, submitData)
      } else {
        await storyService.createStory(submitData)
      }

      navigate('/admin/stories')
    } catch (error) {
      if (error.response?.status === 409 || error.response?.data?.code === 'CONCURRENCY_CONFLICT') {
        setFormError(error.response?.data?.message || 'Truyện này đã được cập nhật bởi một Admin khác. Vui lòng tải lại trang để lấy dữ liệu mới nhất!');
      } else {
        setFormError(error.response?.data?.message || 'Có lỗi xảy ra khi lưu thông tin truyện!');
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <p className="text-slate-400">Đang tải dữ liệu...</p>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h2 className="font-serif text-3xl font-bold text-slate-100">
            {isEditMode ? 'Chỉnh Sửa Truyện' : 'Thêm Mới Truyện'}
          </h2>
          <p className="font-sans text-base text-slate-400 mt-1">
            Nhập thông tin chi tiết cho tác phẩm.
          </p>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          {formError && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-300 rounded-lg px-4 py-3 font-sans text-sm">
              {formError}
            </div>
          )}

          <BasicInfoSection
            formData={formData}
            onChange={handleChange}
            authors={authors}
            genres={genres}
            errors={fieldErrors}
          />
          <DescriptionInput formData={formData} onChange={handleChange} />
        </div>

        <aside className="lg:col-span-4 space-y-6">
          <CoverUpload coverImageUrl={coverPreviewUrl} onCoverChange={handleCoverChange} />
          <FormActions isSubmitting={isSubmitting} onCancel={() => navigate('/admin/stories')} />
        </aside>
      </form>
    </AdminLayout>
  )
}
