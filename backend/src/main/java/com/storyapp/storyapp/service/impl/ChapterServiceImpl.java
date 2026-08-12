package com.storyapp.storyapp.service.impl;

import com.storyapp.storyapp.dto.request.ChapterRequest;
import com.storyapp.storyapp.dto.response.AudioFileResponse;
import com.storyapp.storyapp.dto.response.ChapterResponse;
import com.storyapp.storyapp.entity.AudioFile;
import com.storyapp.storyapp.entity.Chapter;
import com.storyapp.storyapp.entity.Story;
import com.storyapp.storyapp.enums.AccessLevel;
import com.storyapp.storyapp.enums.AudioSource;
import com.storyapp.storyapp.exception.ForbiddenException;
import com.storyapp.storyapp.exception.ResourceNotFoundException;
import com.storyapp.storyapp.mapper.ChapterMapper;
import com.storyapp.storyapp.repository.AudioFileRepository;
import com.storyapp.storyapp.repository.ChapterRepository;
import com.storyapp.storyapp.repository.StoryRepository;
import com.storyapp.storyapp.security.UserPrincipal;
import com.storyapp.storyapp.service.ChapterService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class ChapterServiceImpl implements ChapterService {

    private final StoryRepository storyRepository;
    private final ChapterRepository chapterRepository;
    private final AudioFileRepository audioFileRepository;
    private final ChapterMapper chapterMapper;

    @Value("${app.upload.audio-dir:uploads/audio}")
    private String audioUploadDir;

    @Override
    public ChapterResponse create(Long storyId, ChapterRequest request) {
        Story story = findStory(storyId);
        if (chapterRepository.existsByStoryIdAndChapterNumber(storyId, request.getChapterNumber())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Chapter number already exists in this story");
        }

        Chapter chapter = new Chapter();
        chapter.setStory(story);
        applyRequest(chapter, request);
        return chapterMapper.toResponse(chapterRepository.save(chapter));
    }

    @Override
    @Transactional(readOnly = true)
    public List<ChapterResponse> getByStory(Long storyId) {
        ensureStoryExists(storyId);
        return chapterRepository.findByStoryIdOrderByChapterNumberAsc(storyId).stream()
                .map(chapterMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public ChapterResponse getById(Long storyId, Long chapterId) {
        return chapterMapper.toResponse(findChapter(storyId, chapterId));
    }

    @Override
    public ChapterResponse update(Long storyId, Long chapterId, ChapterRequest request) {
        Chapter chapter = findChapter(storyId, chapterId);
        if (!chapter.getChapterNumber().equals(request.getChapterNumber())
                && chapterRepository.existsByStoryIdAndChapterNumber(storyId, request.getChapterNumber())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Chapter number already exists in this story");
        }

        applyRequest(chapter, request);
        return chapterMapper.toResponse(chapterRepository.save(chapter));
    }

    @Override
    public void delete(Long storyId, Long chapterId) {
        Chapter chapter = findChapter(storyId, chapterId);
        chapterRepository.delete(chapter);
    }

    @Override
    public AudioFileResponse uploadAudio(Long chapterId, MultipartFile file) {
        //logic
        return null;
    }

    @Override
    @Transactional(readOnly = true)
    public List<AudioFileResponse> getAudioFiles(Long chapterId) {
        //logic
        return null;
    }

    @Override
    @Transactional(readOnly = true)
    public ChapterResponse getPublicChapter(Long storyId, Long chapterId) {
        Chapter chapter = findChapter(storyId, chapterId);
        checkAccess(chapter);

        ChapterResponse response = chapterMapper.toResponse(chapter);
        return response;
    }

    private void checkAccess(Chapter chapter) {

        AccessLevel level = chapter.getAccessLevel();

        if (level == AccessLevel.PUBLIC) {
            return;
        }

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null
                || !authentication.isAuthenticated()
                || "anonymousUser".equals(authentication.getPrincipal())) {

            throw new ForbiddenException(
                    "Login required.",
                    level
            );
        }

        UserPrincipal principal =
                (UserPrincipal) authentication.getPrincipal();

        if (principal.isAdmin()) {
            return;
        }

        if (level == AccessLevel.MEMBER) {
            return;
        }

        if (level == AccessLevel.VIP && principal.isVip()) {
            return;
        }

        throw new ForbiddenException(
                "You do not have the required permission to access this chapter.",
                level
        );
    }


    private void applyRequest(Chapter chapter, ChapterRequest request) {
        chapter.setTitle(request.getTitle().trim());
        chapter.setChapterNumber(request.getChapterNumber());
        chapter.setContent(request.getContent());
        chapter.setAccessLevel(request.getAccessLevel());
    }

    private Story findStory(Long storyId) {
        return storyRepository.findById(storyId)
                .orElseThrow(() -> new ResourceNotFoundException("Story", "id", storyId));
    }

    private void ensureStoryExists(Long storyId) {
        if (!storyRepository.existsById(storyId)) {
            throw new ResourceNotFoundException("Story", "id", storyId);
        }
    }

    private Chapter findChapter(Long storyId, Long chapterId) {
        return chapterRepository.findByStoryIdAndId(storyId, chapterId)
                .orElseThrow(() -> new ResourceNotFoundException("Chapter", "id", chapterId));
    }
}
