package com.storyapp.storyapp.service;

import com.storyapp.storyapp.dto.request.StoryRequest;
import com.storyapp.storyapp.dto.response.StoryResponse;

import java.util.List;

public interface StoryService {

    StoryResponse create(StoryRequest request);

    List<StoryResponse> getAll();

    StoryResponse getById(Long id);

    StoryResponse update(Long id, StoryRequest request);

    void delete(Long id);
}
