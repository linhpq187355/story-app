import api from '../api/axiosConfig';

export const coinService = {
  // Buy single VIP chapter with coins
  purchaseChapter: (chapterId) => api.post(`/api/coins/purchase/chapter/${chapterId}`),

  // Buy entire story with coins
  purchaseStory: (storyId) => api.post(`/api/coins/purchase/story/${storyId}`),

  // Admin: update user coins
  adminUpdateUserCoins: (userId, coins) => api.patch(`/api/admin/users/${userId}/coins`, { coins }),
};
