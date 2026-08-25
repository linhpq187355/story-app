package com.storyapp.storyapp.dto.response;

import com.storyapp.storyapp.enums.StoryStatus;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class StorySummaryResponse {

    private Long id;
    private String title;
    private String coverImageUrl;
    private String description;
    private StoryStatus status;

    private Long authorId;
    private String authorName;

    private Long genreId;
    private String genreName;

    private Long viewCount;
    private LocalDateTime createdAt;
}