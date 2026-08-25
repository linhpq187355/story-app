package com.storyapp.storyapp.service;

import com.storyapp.storyapp.dto.request.CommentRequest;
import com.storyapp.storyapp.dto.response.CommentResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface StoryCommentService {

    CommentResponse createComment(Long storyId, CommentRequest request);

    Page<CommentResponse> getCommentsByStory(Long storyId, Pageable pageable);

    void deleteComment(Long commentId);
}
