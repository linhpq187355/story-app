package com.storyapp.storyapp.service;

import com.storyapp.storyapp.dto.response.ReadingProgressResponse;
import com.storyapp.storyapp.dto.response.StoryResponse;

import java.util.List;
import java.util.Optional;

public interface ReadingProgressService {

    void updateProgress(Long chapterId, Long lastPosition);

    Optional<ReadingProgressResponse> getProgressForChapter(Long chapterId);
}