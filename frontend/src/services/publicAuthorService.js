import api from '../api/axiosConfig';

const PUBLIC_AUTHOR_API_PATH = '/api/authors';

export const publicAuthorService = {
    getAllAuthors: () => api.get(PUBLIC_AUTHOR_API_PATH),
};