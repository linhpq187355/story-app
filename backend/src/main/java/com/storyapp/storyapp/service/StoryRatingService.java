package com.storyapp.storyapp.service;

import com.storyapp.storyapp.dto.request.RatingRequest;
import com.storyapp.storyapp.dto.response.RatingResponse;

public interface StoryRatingService {

    RatingResponse rateStory(Long storyId, RatingRequest request);

    RatingResponse getStoryRatingSummary(Long storyId);
}
