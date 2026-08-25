package com.storyapp.storyapp.controller;

import com.storyapp.storyapp.dto.request.RatingRequest;
import com.storyapp.storyapp.dto.response.RatingResponse;
import com.storyapp.storyapp.service.StoryRatingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/stories/{storyId}/ratings")
@RequiredArgsConstructor
public class StoryRatingController {

    private final StoryRatingService ratingService;

    @PostMapping
    public ResponseEntity<RatingResponse> rateStory(
            @PathVariable Long storyId,
            @Valid @RequestBody RatingRequest request
    ) {
        return ResponseEntity.ok(ratingService.rateStory(storyId, request));
    }

    @GetMapping
    public ResponseEntity<RatingResponse> getStoryRating(
            @PathVariable Long storyId
    ) {
        return ResponseEntity.ok(ratingService.getStoryRatingSummary(storyId));
    }
}
