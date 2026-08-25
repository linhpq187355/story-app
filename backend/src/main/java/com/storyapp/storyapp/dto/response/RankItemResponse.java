package com.storyapp.storyapp.dto.response;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class RankItemResponse {

    private Long id;

    private Integer rank;

    private String title;

    private String authorName;

    private String coverImageUrl;

    private String formattedValue;
}
