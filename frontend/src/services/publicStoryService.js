import api from '../api/axiosConfig'

const PUBLIC_STORY_API_PATH = '/api/stories'
const CHAPTER_API_PATH = '/api/chapters'
const USER_API_PATH = '/api/users'
const HOMEPAGE_API_PATH = '/api/homepage'

const STATUS_LABELS = {
  ONGOING: 'Đang ra',
  COMPLETED: 'Hoàn thành',
}

export const publicStoryService = {
  getHomePageData: () => api.get(HOMEPAGE_API_PATH),

  getStories: (params) => api.get(PUBLIC_STORY_API_PATH, { params }),

  getStoryById: (storyId) => api.get(`${PUBLIC_STORY_API_PATH}/${storyId}`),

  getChaptersByStoryId: (storyId, params) => api.get(`${PUBLIC_STORY_API_PATH}/${storyId}/chapters`, { params }),

  getChapterById: (storyId, chapterId) => api.get(`${PUBLIC_STORY_API_PATH}/${storyId}/chapters/${chapterId}`),

  recordChapterView: (chapterId) => api.post(`${CHAPTER_API_PATH}/${chapterId}/view`),

  getRecentlyReadStories: () => api.get(`${USER_API_PATH}/me/recently-read`),

  getReadingProgressForStory: (storyId) => api.get(`${USER_API_PATH}/me/reading-progress/${storyId}`),

  buildCoverUrl: (coverImageUrl) => {
    if (!coverImageUrl) return ''
    if (coverImageUrl.startsWith('http')) return coverImageUrl

    const baseUrl = api.defaults?.baseURL || 'http://localhost:8080'
    return new URL(coverImageUrl, baseUrl).toString()
  },

  mapStatus: (status) => STATUS_LABELS[status] || status || 'Đang ra',
}