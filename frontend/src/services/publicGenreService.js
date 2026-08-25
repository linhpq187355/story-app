import api from '../api/axiosConfig';

const PUBLIC_GENRE_API_PATH = '/api/genres';

export const publicGenreService = {
    getAllGenres: () => api.get(PUBLIC_GENRE_API_PATH),
};