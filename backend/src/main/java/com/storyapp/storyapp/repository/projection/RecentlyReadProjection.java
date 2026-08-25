package com.storyapp.storyapp.repository.projection;

public interface RecentlyReadProjection {

    Long getId();

    String getTitle();

    String getCoverImage();

    String getDescription();

    String getStatus();

    String getAuthorName();

    String getGenreName();
}
