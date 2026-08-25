import api from '../api/axiosConfig'

const GENRE_API_PATH = '/api/admin/genres'

export const genreService = {
  getGenres: () => api.get(GENRE_API_PATH),
  createGenre: (payload) => api.post(GENRE_API_PATH, payload),
  updateGenre: (id, payload) => api.put(`${GENRE_API_PATH}/${id}`, payload),
  deleteGenre: (id) => api.delete(`${GENRE_API_PATH}/${id}`),
}
