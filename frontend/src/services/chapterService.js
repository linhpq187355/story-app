import api from '../api/axiosConfig'

const chapterApiPath = (storyId) => `/api/admin/stories/${storyId}/chapters`
const MAX_AUDIO_FILE_SIZE = 50 * 1024 * 1024

export const chapterService = {
  validateChapterForm: (form) => {
    const errors = {}

    if (!form.title?.trim()) {
      errors.title = 'Tiêu đề chương không được để trống.'
    }

    if (!form.chapterNumber) {
      errors.chapterNumber = 'Số chương là bắt buộc.'
    } else if (Number(form.chapterNumber) < 1 || !Number.isInteger(Number(form.chapterNumber))) {
      errors.chapterNumber = 'Số chương phải là số nguyên lớn hơn 0.'
    }

    if (!form.content?.trim()) {
      errors.content = 'Nội dung chương không được để trống.'
    }

    if (!form.accessLevel) {
      errors.accessLevel = 'Vui lòng chọn quyền truy cập.'
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    }
  },

  validateAudioFile: (file) => {
    if (!file) {
      return { isValid: false, error: '' }
    }

    if (!file.type.startsWith('audio/')) {
      return {
        isValid: false,
        error: 'Vui lòng chọn đúng file audio (.mp3, .wav, .m4a, ...).',
      }
    }

    if (file.size > MAX_AUDIO_FILE_SIZE) {
      return {
        isValid: false,
        error: 'File audio quá lớn. Vui lòng chọn file dưới 50MB.',
      }
    }

    return { isValid: true, error: '' }
  },

  buildAudioUrl: (audio) => {
    if (!audio?.filePath) return ''
    if (audio.filePath.startsWith('http')) return audio.filePath

    const baseUrl = api.defaults?.baseURL || 'https://story-app-backend-czechbcvfdgec9ba.southeastasia-01.azurewebsites.net'
    return new URL(audio.filePath, baseUrl).toString()
  },

  /**
   * Lấy danh sách chương của truyện
   * @param {number} storyId
   */
  getChapters: (storyId) => {
    return api.get(chapterApiPath(storyId))
  },

  /**
   * Lấy chi tiết 1 chương
   * @param {number} storyId
   * @param {number} chapterId
   */
  getChapter: (storyId, chapterId) => {
    return api.get(`${chapterApiPath(storyId)}/${chapterId}`)
  },

  /**
   * Thêm chương mới
   * @param {number} storyId
   * @param {Object} payload - { title, chapterNumber, content, accessLevel }
   */
  createChapter: (storyId, payload) => {
    return api.post(chapterApiPath(storyId), payload)
  },

  /**
   * Cập nhật chương
   * @param {number} storyId
   * @param {number} chapterId
   * @param {Object} payload - { title, chapterNumber, content, accessLevel }
   */
  updateChapter: (storyId, chapterId, payload) => {
    return api.put(`${chapterApiPath(storyId)}/${chapterId}`, payload)
  },

  /**
   * Xóa chương
   * @param {number} storyId
   * @param {number} chapterId
   */
  deleteChapter: (storyId, chapterId) => {
    return api.delete(`${chapterApiPath(storyId)}/${chapterId}`)
  },

  /**
   * Upload audio cho chương
   * @param {number} chapterId
   * @param {File} file
   */
  uploadAudio: (chapterId, file) => {
    const formData = new FormData()
    formData.append('file', file)

    return api.post(`/api/admin/stories/chapters/${chapterId}/audio`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },

  /**
   * Lấy danh sách audio của chương
   * @param {number} chapterId
   */
  getAudioFiles: (chapterId) => {
    return api.get(`/api/admin/stories/chapters/${chapterId}/audio`)
  },
}
