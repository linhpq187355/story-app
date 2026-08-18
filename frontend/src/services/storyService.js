import api from '../api/axiosConfig'

const STORY_API_PATH = '/api/admin/stories'

export const storyService = {
  /**
   * Lấy danh sách truyện (có phân trang và filter)
   * @param {Object} params - { page, size, keyword, genreId, status }
   */
  getStories: (params) => {
    return api.get(STORY_API_PATH, { params })
  },

  /**
   * Lấy chi tiết 1 truyện
   * @param {number} storyId
   */
  getStoryById: (storyId) => {
    return api.get(`${STORY_API_PATH}/${storyId}`)
  },

  /**
   * Thêm truyện mới (Nhận FormData chứa File + JSON)
   * @param {FormData} formData
   */
  createStory: (formData) => {
    return api.post(STORY_API_PATH, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },

  /**
   * Cập nhật truyện (Nhận FormData chứa File + JSON)
   * @param {number} storyId 
   * @param {FormData} formData
   */
  updateStory: (storyId, formData) => {
    return api.put(`${STORY_API_PATH}/${storyId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },

  /**
   * Xóa truyện
   * @param {number} storyId 
   */
  deleteStory: (storyId) => {
    return api.delete(`${STORY_API_PATH}/${storyId}`)
  },
}