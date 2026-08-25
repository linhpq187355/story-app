package com.storyapp.storyapp.service;

import com.storyapp.storyapp.dto.request.ChangePasswordRequest;
import com.storyapp.storyapp.dto.request.ProfileUpdateRequest;
import com.storyapp.storyapp.dto.response.ReadingProgressResponse;
import com.storyapp.storyapp.dto.response.StoryResponse;
import com.storyapp.storyapp.dto.response.UserResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Optional;

import com.storyapp.storyapp.dto.response.BookshelfItemResponse;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface UserService {

    List<UserResponse> getAll(String search, Boolean isVip);

    UserResponse getMe();

    UserResponse updateVipStatus(Long userId, Boolean isVip);

    UserResponse updateVipStatus(Long userId, Boolean isVip, Integer durationDays);

    UserResponse updateVipStatus(Long userId, Boolean isVip, Long packageId, Integer durationDays);

    Page<BookshelfItemResponse> getRecentlyReadStories(Pageable pageable);

    Optional<ReadingProgressResponse> getReadingProgressForStory(Long storyId);

    UserResponse updateProfile(ProfileUpdateRequest request);

    UserResponse updateAvatar(MultipartFile file);

    void changePassword(ChangePasswordRequest request);
}