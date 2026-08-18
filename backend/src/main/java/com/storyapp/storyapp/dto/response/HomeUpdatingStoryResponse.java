package com.storyapp.storyapp.dto.response;

import com.storyapp.storyapp.enums.StoryStatus;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class HomeUpdatingStoryResponse {

    private Long id;

    private String title;

    private String coverImageUrl;

    private String description;

    private StoryStatus status;

    private String authorName;

    private String genreName;

    private Long latestChapterId;

    private Integer latestChapterNumber;

    private String latestChapterTitle;

    private LocalDateTime latestActivityAt;
}
