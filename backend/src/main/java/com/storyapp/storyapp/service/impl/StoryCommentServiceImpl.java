package com.storyapp.storyapp.service.impl;

import com.storyapp.storyapp.dto.request.CommentRequest;
import com.storyapp.storyapp.dto.response.CommentResponse;
import com.storyapp.storyapp.entity.Story;
import com.storyapp.storyapp.entity.StoryComment;
import com.storyapp.storyapp.entity.User;
import com.storyapp.storyapp.exception.ForbiddenException;
import com.storyapp.storyapp.exception.ResourceNotFoundException;
import com.storyapp.storyapp.repository.StoryCommentRepository;
import com.storyapp.storyapp.repository.StoryRepository;
import com.storyapp.storyapp.repository.UserRepository;
import com.storyapp.storyapp.security.UserPrincipal;
import com.storyapp.storyapp.service.StoryCommentService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;

import com.storyapp.storyapp.service.BannedWordService;

@Service
@RequiredArgsConstructor
@Transactional
public class StoryCommentServiceImpl implements StoryCommentService {

    private final StoryCommentRepository commentRepository;
    private final StoryRepository storyRepository;
    private final UserRepository userRepository;
    private final BannedWordService bannedWordService;

    @Override
    public CommentResponse createComment(Long storyId, CommentRequest request) {
        User user = getCurrentUser();

        Story story = storyRepository.findById(storyId)
                .orElseThrow(() -> new ResourceNotFoundException("Story", "id", storyId));

        String filteredContent = bannedWordService.filterText(request.getContent().trim());

        StoryComment comment = new StoryComment();
        comment.setUser(user);
        comment.setStory(story);
        comment.setContent(filteredContent);

        if (request.getParentCommentId() != null) {
            StoryComment parent = commentRepository.findById(request.getParentCommentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Parent Comment", "id", request.getParentCommentId()));
            
            // If parent is already a reply, link to top-level parent to maintain max 2 levels depth
            if (parent.getParentComment() != null) {
                parent = parent.getParentComment();
            }
            comment.setParentComment(parent);
        }

        StoryComment saved = commentRepository.save(comment);
        return mapToResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<CommentResponse> getCommentsByStory(Long storyId, Pageable pageable) {
        if (!storyRepository.existsById(storyId)) {
            throw new ResourceNotFoundException("Story", "id", storyId);
        }
        return commentRepository.findByStoryIdAndParentCommentIsNullOrderByCreatedAtDesc(storyId, pageable)
                .map(this::mapToResponse);
    }

    @Override
    public void deleteComment(Long commentId) {
        UserPrincipal principal = getCurrentUserPrincipal();

        StoryComment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment", "id", commentId));

        boolean isOwner = comment.getUser().getId().equals(principal.getId());
        boolean isAdmin = principal.isAdmin();

        if (!isOwner && !isAdmin) {
            throw new ForbiddenException("You are not authorized to delete this comment.");
        }

        commentRepository.delete(comment);
    }

    private CommentResponse mapToResponse(StoryComment comment) {
        List<CommentResponse> replyResponses = Collections.emptyList();
        if (comment.getReplies() != null && !comment.getReplies().isEmpty()) {
            replyResponses = comment.getReplies().stream()
                    .map(this::mapToResponse)
                    .toList();
        }

        User user = comment.getUser();
        String displayName = user != null ? (user.getDisplayName() != null ? user.getDisplayName() : user.getUsername()) : "Nặc danh";

        return CommentResponse.builder()
                .id(comment.getId())
                .storyId(comment.getStory() != null ? comment.getStory().getId() : null)
                .userId(user != null ? user.getId() : null)
                .userName(displayName)
                .userAvatar(user != null ? user.getAvatar() : null)
                .content(comment.getContent())
                .parentCommentId(comment.getParentComment() != null ? comment.getParentComment().getId() : null)
                .createdAt(comment.getCreatedAt())
                .updatedAt(comment.getUpdatedAt())
                .replies(replyResponses)
                .build();
    }

    private User getCurrentUser() {
        UserPrincipal principal = getCurrentUserPrincipal();
        return userRepository.findById(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", principal.getId()));
    }

    private UserPrincipal getCurrentUserPrincipal() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            throw new RuntimeException("User is not authenticated");
        }
        return (UserPrincipal) authentication.getPrincipal();
    }
}
