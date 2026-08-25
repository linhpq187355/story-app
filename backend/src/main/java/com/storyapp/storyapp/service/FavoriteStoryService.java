package com.storyapp.storyapp.service;

import com.storyapp.storyapp.dto.response.BookshelfItemResponse;
import com.storyapp.storyapp.dto.response.FavoriteStatusResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface FavoriteStoryService {

    FavoriteStatusResponse toggleFavorite(Long storyId);

    FavoriteStatusResponse getFavoriteStatus(Long storyId);

    Page<BookshelfItemResponse> getUserFavoriteStories(Pageable pageable);
}
