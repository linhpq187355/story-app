package com.storyapp.storyapp.repository.projection;

import java.time.LocalDateTime;

public interface LatestChapterProjection {

    Long getStoryId();

    Long getChapterId();

    Integer getChapterNumber();

    String getChapterTitle();

    LocalDateTime getCreatedAt();

    String getCoverImageUrl();
}