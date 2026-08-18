package com.storyapp.storyapp.service;

import com.storyapp.storyapp.dto.response.ReadingProgressResponse;
import com.storyapp.storyapp.dto.response.StoryResponse;
import com.storyapp.storyapp.dto.response.UserResponse;

import java.util.List;
import java.util.Optional;

public interface UserService {

    List<UserResponse> getAll();

    UserResponse updateVipStatus(Long userId, Boolean isVip);

    List<StoryResponse> getRecentlyReadStories();

    Optional<ReadingProgressResponse> getReadingProgressForStory(Long storyId);
}