package com.storyapp.storyapp.controller;

import com.storyapp.storyapp.dto.request.ChangePasswordRequest;
import com.storyapp.storyapp.dto.request.ProfileUpdateRequest;
import com.storyapp.storyapp.dto.response.BookshelfItemResponse;
import com.storyapp.storyapp.dto.response.ReadingProgressResponse;
import com.storyapp.storyapp.dto.response.StoryResponse;
import com.storyapp.storyapp.dto.response.UserResponse;
import com.storyapp.storyapp.dto.response.StorySummaryResponse;
import com.storyapp.storyapp.service.FavoriteStoryService;
import com.storyapp.storyapp.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final FavoriteStoryService favoriteStoryService;

    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UserResponse> getMe() {
        return ResponseEntity.ok(userService.getMe());
    }

    @GetMapping("/me/favorites")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Page<BookshelfItemResponse>> getUserFavoriteStories(
            @PageableDefault(size = 12, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        return ResponseEntity.ok(favoriteStoryService.getUserFavoriteStories(pageable));
    }

    @GetMapping("/me/recently-read")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Page<BookshelfItemResponse>> getRecentlyReadStories(
            @PageableDefault(size = 12) Pageable pageable
    ) {
        return ResponseEntity.ok(userService.getRecentlyReadStories(pageable));
    }

    @GetMapping("/me/reading-progress/{storyId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ReadingProgressResponse> getReadingProgressForStory(@PathVariable Long storyId) {
        return userService.getReadingProgressForStory(storyId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.noContent().build());
    }

    @PutMapping("/me/profile")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UserResponse> updateProfile(@Valid @RequestBody ProfileUpdateRequest request) {
        return ResponseEntity.ok(userService.updateProfile(request));
    }

    @PutMapping("/me/avatar")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UserResponse> updateAvatar(@RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(userService.updateAvatar(file));
    }

    @PutMapping("/me/password")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, String>> changePassword(@Valid @RequestBody ChangePasswordRequest request) {
        userService.changePassword(request);
        return ResponseEntity.ok(Map.of("message", "Password changed successfully"));
    }
}