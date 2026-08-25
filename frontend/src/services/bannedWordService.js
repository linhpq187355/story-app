import api from '../api/axiosConfig';

const BANNED_WORD_API_PATH = '/api/admin/banned-words';

export const bannedWordService = {
    getAllBannedWords: () => {
        return api.get(BANNED_WORD_API_PATH);
    },

    addBannedWord: (word) => {
        return api.post(BANNED_WORD_API_PATH, { word });
    },

    deleteBannedWord: (id) => {
        return api.delete(`${BANNED_WORD_API_PATH}/${id}`);
    },
};
