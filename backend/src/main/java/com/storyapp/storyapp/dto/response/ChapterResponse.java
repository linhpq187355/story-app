package com.storyapp.storyapp.dto.response;

import com.storyapp.storyapp.enums.AccessLevel;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class ChapterResponse {

    private Long id;

    private Long storyId;

    private String storyTitle;

    private String title;

    private Integer chapterNumber;

    private String content;

    private AccessLevel accessLevel;

    private Long previousChapterId;

    private Long nextChapterId;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}