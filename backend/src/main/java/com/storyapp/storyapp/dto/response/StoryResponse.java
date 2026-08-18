package com.storyapp.storyapp.dto.response;

import com.storyapp.storyapp.enums.StoryStatus;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class StoryResponse {

    private Long id;

    private String title;

    private String coverImageUrl;

    private String description;

    private Long viewCount;

    private Long viewsLast7Days;

    private Long favoritesLast7Days;

    private StoryStatus status;

    private Long authorId;

    private String authorName;

    private Long genreId;

    private String genreName;

    private long chapterCount;

    private Long firstChapterId;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}