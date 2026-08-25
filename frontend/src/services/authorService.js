import api from '../api/axiosConfig'

const AUTHOR_API_PATH = '/api/admin/authors'

export const authorService = {
  getAuthors: () => api.get(AUTHOR_API_PATH),
  createAuthor: (payload) => api.post(AUTHOR_API_PATH, payload),
  updateAuthor: (id, payload) => api.put(`${AUTHOR_API_PATH}/${id}`, payload),
  deleteAuthor: (id) => api.delete(`${AUTHOR_API_PATH}/${id}`),
}
