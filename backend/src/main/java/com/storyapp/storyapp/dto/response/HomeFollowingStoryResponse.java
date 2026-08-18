package com.storyapp.storyapp.dto.response;

import com.storyapp.storyapp.enums.StoryStatus;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class HomeFollowingStoryResponse {
    private Long id;

    private String title;

    private String coverImageUrl;

    private String description;

    private StoryStatus status;

    private String authorName;

    private String genreName;
}
