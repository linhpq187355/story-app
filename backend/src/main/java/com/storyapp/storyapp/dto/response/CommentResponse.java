package com.storyapp.storyapp.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CommentResponse {

    private Long id;

    private Long storyId;

    private Long userId;

    private String userName;

    private String userAvatar;

    private String content;

    private Long parentCommentId;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    private List<CommentResponse> replies;
}
