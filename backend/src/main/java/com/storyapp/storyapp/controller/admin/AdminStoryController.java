package com.storyapp.storyapp.controller.admin;

import com.storyapp.storyapp.dto.request.ChapterRequest;
import com.storyapp.storyapp.dto.request.StoryRequest;
import com.storyapp.storyapp.dto.response.AudioFileResponse;
import com.storyapp.storyapp.dto.response.ChapterResponse;
import com.storyapp.storyapp.dto.response.StoryResponse;
import com.storyapp.storyapp.dto.response.StorySummaryResponse;
import com.storyapp.storyapp.enums.StoryStatus;
import com.storyapp.storyapp.service.ChapterService;
import com.storyapp.storyapp.service.StoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.MediaType;


import java.util.List;

@RestController
@RequestMapping("/api/admin/stories")
@RequiredArgsConstructor
public class AdminStoryController {

    private final StoryService storyService;
    private final ChapterService chapterService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    public StoryResponse createStory(
            @RequestPart("data") @Valid StoryRequest request,
            @RequestPart(value = "coverImage", required = false) MultipartFile coverImage
    ) {
        return storyService.create(request, coverImage);
    }

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
    public StoryResponse getStory(@PathVariable Long storyId) {
        return storyService.getById(storyId);
    }

    @PutMapping(path = "/{storyId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public StoryResponse updateStory(
            @PathVariable Long storyId,
            @RequestPart("data") @Valid StoryRequest request,
            @RequestPart(value = "coverImage", required = false) MultipartFile coverImage
    ) {
        return storyService.update(storyId, request, coverImage);
    }

    @DeleteMapping("/{storyId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteStory(@PathVariable Long storyId) {
        storyService.delete(storyId);
    }

    @PostMapping("/{storyId}/chapters")
    @ResponseStatus(HttpStatus.CREATED)
    public ChapterResponse createChapter(@PathVariable Long storyId, @Valid @RequestBody ChapterRequest request) {
        return chapterService.create(storyId, request);
    }

    @GetMapping("/{storyId}/chapters")
    public List<ChapterResponse> getChapters(@PathVariable Long storyId) {
        return chapterService.getByStory(storyId);
    }

    @GetMapping("/{storyId}/chapters/{chapterId}")
    public ChapterResponse getChapter(@PathVariable Long storyId, @PathVariable Long chapterId) {
        return chapterService.getById(storyId, chapterId);
    }

    @PutMapping("/{storyId}/chapters/{chapterId}")
    public ChapterResponse updateChapter(
            @PathVariable Long storyId,
            @PathVariable Long chapterId,
            @Valid @RequestBody ChapterRequest request
    ) {
        return chapterService.update(storyId, chapterId, request);
    }

    @DeleteMapping("/{storyId}/chapters/{chapterId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteChapter(@PathVariable Long storyId, @PathVariable Long chapterId) {
        chapterService.delete(storyId, chapterId);
    }

    @PostMapping("/chapters/{chapterId}/audio")
    @ResponseStatus(HttpStatus.CREATED)
    public AudioFileResponse uploadChapterAudio(
            @PathVariable Long chapterId,
            @RequestParam("file") MultipartFile file
    ) {
        return chapterService.uploadAudio(chapterId, file);
    }

    @GetMapping("/chapters/{chapterId}/audio")
    public List<AudioFileResponse> getChapterAudioFiles(@PathVariable Long chapterId) {
        return chapterService.getAudioFiles(chapterId);
    }
}
