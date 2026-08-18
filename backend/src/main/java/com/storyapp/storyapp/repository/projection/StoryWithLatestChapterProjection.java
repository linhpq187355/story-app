package com.storyapp.storyapp.repository.projection;

import com.storyapp.storyapp.enums.StoryStatus;

import java.time.LocalDateTime;

public interface StoryWithLatestChapterProjection {

    Long getId();

    String getTitle();

    String getCoverImageUrl();

    String getDescription();

    StoryStatus getStatus();

    String getAuthorName();

    String getGenreName();

    Long getLatestChapterId();

    Integer getLatestChapterNumber();

    String getLatestChapterTitle();

    LocalDateTime getLatestActivityAt();
}