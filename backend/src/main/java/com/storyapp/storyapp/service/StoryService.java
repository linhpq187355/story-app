package com.storyapp.storyapp.service;

import com.storyapp.storyapp.dto.request.StoryRequest;
import com.storyapp.storyapp.dto.response.StoryResponse;
import com.storyapp.storyapp.enums.StoryStatus;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;


public interface StoryService {

    StoryResponse create(StoryRequest request, MultipartFile coverImage);

    Page<StoryResponse> getStories(
        String keyword,
        Long genreId,
        Long authorId,
        StoryStatus status,
        Pageable pageable
    );

    StoryResponse getById(Long id);

    StoryResponse update(Long id, StoryRequest request, MultipartFile coverImage);

    void delete(Long id);

    StoryResponse getPublicStoryDetails(Long storyId);
}