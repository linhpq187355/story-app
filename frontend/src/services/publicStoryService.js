import api from '../api/axiosConfig';

const BASE_PATH = '/api/stories';

// Helper to remove null or empty properties from an object
const cleanParams = (params) => {
    const cleaned = {};
    for (const key in params) {
        if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
            cleaned[key] = params[key];
        }
    }
    return cleaned;
};

export const publicStoryService = {
    getStories: (params) => {
        return api.get(BASE_PATH, { params: cleanParams(params) });
    },

    getStoryById: (storyId) => {
        return api.get(`${BASE_PATH}/${storyId}`);
    },

    getChaptersByStoryId: (storyId, params) => {
        return api.get(`${BASE_PATH}/${storyId}/chapters`, { params: cleanParams(params) });
    },

    getChapterById: (storyId, chapterId) => {
        return api.get(`${BASE_PATH}/${storyId}/chapters/${chapterId}`);
    },

    synthesizeChapter: (storyId, chapterId, voiceGender) => {
        return api.post(`${BASE_PATH}/${storyId}/chapters/${chapterId}/tts`, null, {
            params: voiceGender ? { voice: voiceGender } : {}
        });
    },

    getHomePageData: () => {
        return api.get('/api/homepage');
    },

    getReadingProgressForStory: (storyId) => {
        return api.get(`/api/users/me/reading-progress/${storyId}`);
    },

    recordChapterView: (chapterId) => {
        return api.post(`/api/chapters/${chapterId}/view`);
    },

    saveChapterProgress: (chapterId, lastPosition) => {
        return api.post(`/api/chapters/${chapterId}/progress`, { lastPosition });
    },

    getChapterProgress: (chapterId) => {
        return api.get(`/api/chapters/${chapterId}/progress`);
    },

    getStoryRating: (storyId) => {
        return api.get(`${BASE_PATH}/${storyId}/ratings`);
    },

    rateStory: (storyId, rating) => {
        return api.post(`${BASE_PATH}/${storyId}/ratings`, { rating });
    },

    getStoryComments: (storyId, params) => {
        return api.get(`${BASE_PATH}/${storyId}/comments`, { params: cleanParams(params) });
    },

    addComment: (storyId, data) => {
        return api.post(`${BASE_PATH}/${storyId}/comments`, data);
    },

    deleteComment: (storyId, commentId) => {
        return api.delete(`${BASE_PATH}/${storyId}/comments/${commentId}`);
    },

    toggleFavorite: (storyId) => {
        return api.post(`${BASE_PATH}/${storyId}/favorites`);
    },

    getFavoriteStatus: (storyId) => {
        return api.get(`${BASE_PATH}/${storyId}/favorites`);
    },

    getUserFavoriteStories: (params) => {
        return api.get('/api/users/me/favorites', { params: cleanParams(params) });
    },

    mapStatus: (status) => {
        const statusMap = {
            ONGOING: 'Đang ra',
            COMPLETED: 'Hoàn thành',
        };
        return statusMap[status] || 'Không xác định';
    },
};