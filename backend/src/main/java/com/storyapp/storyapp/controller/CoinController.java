package com.storyapp.storyapp.controller;

import com.storyapp.storyapp.dto.response.UserResponse;
import com.storyapp.storyapp.security.UserPrincipal;
import com.storyapp.storyapp.service.CoinService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/coins")
@RequiredArgsConstructor
public class CoinController {

    private final CoinService coinService;

    @PostMapping("/purchase/chapter/{chapterId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UserResponse> purchaseChapter(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PathVariable Long chapterId
    ) {
        return ResponseEntity.ok(coinService.purchaseChapterWithCoins(currentUser.getId(), chapterId));
    }

    @PostMapping("/purchase/story/{storyId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UserResponse> purchaseStory(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PathVariable Long storyId
    ) {
        return ResponseEntity.ok(coinService.purchaseStoryWithCoins(currentUser.getId(), storyId));
    }
}
