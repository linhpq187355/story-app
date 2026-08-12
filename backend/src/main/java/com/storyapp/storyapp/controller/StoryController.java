package com.storyapp.storyapp.controller;

import com.storyapp.storyapp.dto.response.ChapterResponse;
import com.storyapp.storyapp.dto.response.StoryResponse;
import com.storyapp.storyapp.service.ChapterService;
import com.storyapp.storyapp.service.StoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/stories")
@RequiredArgsConstructor
public class StoryController {

    private final StoryService storyService;
    private final ChapterService chapterService;

    @GetMapping
    public ResponseEntity<Page<StoryResponse>> getPublicStories(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Long genreId,
            @PageableDefault(size = 20, sort = "createdAt,desc") Pageable pageable) {
        Page<StoryResponse> stories = storyService.findPublicStories(keyword, genreId, pageable);
        return ResponseEntity.ok(stories);
    }

    @GetMapping("/{storyId}")
    public ResponseEntity<StoryResponse> getPublicStoryDetails(@PathVariable Long storyId) {
        StoryResponse story = storyService.getPublicStoryDetails(storyId);
        return ResponseEntity.ok(story);
    }
    
    @GetMapping("/{storyId}/chapters/{chapterId}")
    public ResponseEntity<ChapterResponse> getPublicChapter(
            @PathVariable Long storyId,
            @PathVariable Long chapterId) {
        ChapterResponse chapter = chapterService.getPublicChapter(storyId, chapterId);
        return ResponseEntity.ok(chapter);
    }
}
