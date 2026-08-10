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

    private StoryStatus status;

    private Long authorId;

    private String authorName;

    private Long genreId;

    private String genreName;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
