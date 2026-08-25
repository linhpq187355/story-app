package com.storyapp.storyapp.service;

import com.storyapp.storyapp.dto.response.UserResponse;

public interface CoinService {

    UserResponse purchaseChapterWithCoins(Long userId, Long chapterId);

    UserResponse purchaseStoryWithCoins(Long userId, Long storyId);

    UserResponse updateUserCoins(Long userId, Long coins);
}
