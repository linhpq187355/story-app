package com.storyapp.storyapp.controller;

import com.storyapp.storyapp.dto.response.FavoriteStatusResponse;
import com.storyapp.storyapp.service.FavoriteStoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/stories/{storyId}/favorites")
@RequiredArgsConstructor
public class FavoriteStoryController {

    private final FavoriteStoryService favoriteService;

    @PostMapping
    public ResponseEntity<FavoriteStatusResponse> toggleFavorite(@PathVariable Long storyId) {
        return ResponseEntity.ok(favoriteService.toggleFavorite(storyId));
    }

    @GetMapping
    public ResponseEntity<FavoriteStatusResponse> getFavoriteStatus(@PathVariable Long storyId) {
        return ResponseEntity.ok(favoriteService.getFavoriteStatus(storyId));
    }
}
