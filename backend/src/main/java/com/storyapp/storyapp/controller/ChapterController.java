package com.storyapp.storyapp.controller;

import com.storyapp.storyapp.dto.request.UpdateProgressRequest;
import com.storyapp.storyapp.dto.response.ReadingProgressResponse;
import com.storyapp.storyapp.service.ChapterService;
import com.storyapp.storyapp.service.ReadingProgressService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/chapters")
@RequiredArgsConstructor
public class ChapterController {

    private final ChapterService chapterService;
    private final ReadingProgressService readingProgressService;

    @PostMapping("/{chapterId}/view")
    public ResponseEntity<Map<String, Boolean>> recordView(
            @PathVariable Long chapterId
    ) {
        return ResponseEntity.ok(
                chapterService.recordView(chapterId)
        );
    }

    @PostMapping("/{chapterId}/progress")
    public ResponseEntity<Map<String, Object>> updateProgress(
            @PathVariable Long chapterId,
            @Valid @RequestBody UpdateProgressRequest request
    ) {
        readingProgressService.updateProgress(chapterId, request.getLastPosition());
        return ResponseEntity.ok(Map.of("success", true, "lastPosition", request.getLastPosition()));
    }

    @GetMapping("/{chapterId}/progress")
    public ResponseEntity<ReadingProgressResponse> getProgress(
            @PathVariable Long chapterId
    ) {
        return readingProgressService.getProgressForChapter(chapterId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}