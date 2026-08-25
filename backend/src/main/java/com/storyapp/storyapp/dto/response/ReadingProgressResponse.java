package com.storyapp.storyapp.dto.response;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ReadingProgressResponse {

    private Long lastReadChapterId;

    private Integer lastReadChapterNumber;

    private Long lastPosition;
}