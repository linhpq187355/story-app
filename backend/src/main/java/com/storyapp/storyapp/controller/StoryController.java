package com.storyapp.storyapp.controller;

import com.storyapp.storyapp.dto.response.AudioFileResponse;
import com.storyapp.storyapp.dto.response.ChapterResponse;
import com.storyapp.storyapp.dto.response.ChapterSummaryResponse;
import com.storyapp.storyapp.dto.response.StoryResponse;
import com.storyapp.storyapp.dto.response.StorySummaryResponse;
import com.storyapp.storyapp.enums.StoryStatus;
import com.storyapp.storyapp.service.ChapterService;
import com.storyapp.storyapp.service.StoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.data.domain.Sort;

@RestController
@RequestMapping("/api/stories")
@RequiredArgsConstructor
public class StoryController {

    private final StoryService storyService;
    private final ChapterService chapterService;

    @GetMapping
    public Page<StorySummaryResponse> getStories(
            @RequestParam(defaultValue = "") String keyword,
            @RequestParam(required = false) Long genreId,
            @RequestParam(required = false) Long authorId,
            @RequestParam(required = false) StoryStatus status,
            @PageableDefault(
                    size = 10,
                    sort = "createdAt",
                    direction = Sort.Direction.DESC
            ) Pageable pageable
    ) {
        return storyService.getStories(keyword, genreId, authorId, status, pageable);
    }

    @GetMapping("/{storyId}")
    public ResponseEntity<StoryResponse> getPublicStoryDetails(@PathVariable Long storyId) {
        StoryResponse story = storyService.getPublicStoryDetails(storyId);
        return ResponseEntity.ok(story);
    }

    @GetMapping("/{storyId}/chapters")
    public Page<ChapterSummaryResponse> getPublicChapterSummaries(
            @PathVariable Long storyId,
            @PageableDefault(
                    size = 24,
                    sort = "chapterNumber",
                    direction = Sort.Direction.ASC
            ) Pageable pageable) {
        return chapterService.getChapterSummaries(storyId, pageable);
    }
    
    @GetMapping("/{storyId}/chapters/{chapterId}")
    public ResponseEntity<ChapterResponse> getPublicChapter(
            @PathVariable Long storyId,
            @PathVariable Long chapterId) {
        ChapterResponse chapter = chapterService.getPublicChapter(storyId, chapterId);
        return ResponseEntity.ok(chapter);
    }

    @PostMapping("/{storyId}/chapters/{chapterId}/tts")
    public ResponseEntity<?> synthesizeChapter(
            @PathVariable Long storyId,
            @PathVariable Long chapterId,
            @RequestParam(value = "voice", required = false) com.storyapp.storyapp.enums.VoiceGender voiceGender
    ) {
        com.storyapp.storyapp.dto.response.ChapterAudioResponse audioFile = chapterService.synthesizeAndSaveAudio(storyId, chapterId, voiceGender);
        return new ResponseEntity<>(audioFile, HttpStatus.CREATED);
    }
}