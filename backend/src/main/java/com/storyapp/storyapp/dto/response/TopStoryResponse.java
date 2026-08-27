package com.storyapp.storyapp.dto.response;

import com.storyapp.storyapp.enums.StoryStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TopStoryResponse {
    private Long id;
    private String title;
    private String coverImageUrl;
    private String authorName;
    private String genreName;
    private Long viewCount;
    private Long viewsLast7Days;
    private Long favoritesCount;
    private StoryStatus status;
    private LocalDateTime updatedAt;
}
