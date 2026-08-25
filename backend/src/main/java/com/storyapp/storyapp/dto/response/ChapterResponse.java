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

    private String audio;

    private java.util.Map<String, String> audios;

    private AccessLevel accessLevel;

    private Long coinPrice;

    private Boolean isPurchased;

    private Boolean isLocked;

    private Long previousChapterId;

    private Long nextChapterId;

    private Long lastPosition;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    private Long version;
}
