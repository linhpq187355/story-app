package com.storyapp.storyapp.controller;

import com.storyapp.storyapp.dto.response.ReadingProgressResponse;
import com.storyapp.storyapp.dto.response.StoryResponse;
import com.storyapp.storyapp.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/me/recently-read")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<StoryResponse>> getRecentlyReadStories() {
        return ResponseEntity.ok(userService.getRecentlyReadStories());
    }

    @GetMapping("/me/reading-progress/{storyId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ReadingProgressResponse> getReadingProgressForStory(@PathVariable Long storyId) {
        return userService.getReadingProgressForStory(storyId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.noContent().build());
    }
}