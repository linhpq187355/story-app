package com.storyapp.storyapp.controller;

import com.storyapp.storyapp.service.ChapterService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/chapters")
@RequiredArgsConstructor
public class ChapterController {

    private final ChapterService chapterService;

    @PostMapping("/{chapterId}/view")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Boolean>> recordView(
            @PathVariable Long chapterId
    ) {
        return ResponseEntity.ok(
                chapterService.recordView(chapterId)
        );
    }
}