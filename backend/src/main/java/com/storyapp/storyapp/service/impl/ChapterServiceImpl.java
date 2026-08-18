package com.storyapp.storyapp.service.impl;

import com.storyapp.storyapp.dto.request.ChapterRequest;
import com.storyapp.storyapp.dto.response.AudioFileResponse;
import com.storyapp.storyapp.dto.response.ChapterResponse;
import com.storyapp.storyapp.dto.response.ChapterSummaryResponse;
import com.storyapp.storyapp.entity.AudioFile;
import com.storyapp.storyapp.entity.Chapter;
import com.storyapp.storyapp.entity.ReadingProgress;
import com.storyapp.storyapp.entity.Story;
import com.storyapp.storyapp.entity.User;
import com.storyapp.storyapp.enums.AccessLevel;
import com.storyapp.storyapp.enums.AudioSource;
import com.storyapp.storyapp.exception.ForbiddenException;
import com.storyapp.storyapp.exception.ResourceNotFoundException;
import com.storyapp.storyapp.mapper.ChapterMapper;
import com.storyapp.storyapp.repository.AudioFileRepository;
import com.storyapp.storyapp.repository.ChapterRepository;
import com.storyapp.storyapp.repository.ReadingProgressRepository;
import com.storyapp.storyapp.repository.StoryRepository;
import com.storyapp.storyapp.repository.UserRepository;
import com.storyapp.storyapp.security.UserPrincipal;
import com.storyapp.storyapp.service.ChapterService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
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
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class ChapterServiceImpl implements ChapterService {

    private final StoryRepository storyRepository;
    private final ChapterRepository chapterRepository;
    private final AudioFileRepository audioFileRepository;
    private final ChapterMapper chapterMapper;
    private final UserRepository userRepository;
    private final ReadingProgressRepository readingProgressRepository;

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
    public List<ChapterSummaryResponse> getChapterSummaries(Long storyId) {
        ensureStoryExists(storyId);
        return chapterRepository.findByStoryIdOrderByChapterNumberAsc(storyId).stream()
                .map(this::toSummaryResponse)
                .toList();
    }
    
    @Override
    @Transactional(readOnly = true)
    public Page<ChapterSummaryResponse> getChapterSummaries(Long storyId, Pageable pageable) {
        ensureStoryExists(storyId);
        return chapterRepository.findByStoryId(storyId, pageable).map(this::toSummaryResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public ChapterResponse getById(Long storyId, Long chapterId) {
        Chapter chapter = findChapter(storyId, chapterId);
        Long prevId = chapterRepository.findPreviousChapterId(storyId, chapter.getChapterNumber()).orElse(null);
        Long nextId = chapterRepository.findNextChapterId(storyId, chapter.getChapterNumber()).orElse(null);
        return chapterMapper.toResponse(chapter, prevId, nextId);
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
        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Audio file is required");
        }

        Chapter chapter = chapterRepository.findById(chapterId)
                .orElseThrow(() -> new ResourceNotFoundException("Chapter", "id", chapterId));

        if (!StringUtils.hasText(file.getOriginalFilename())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Audio file name is required");
        }

        String originalFileName = file.getOriginalFilename();
        String extension = originalFileName.contains(".")
                ? originalFileName.substring(originalFileName.lastIndexOf('.'))
                : "";
        String newFileName = UUID.randomUUID() + extension;

        try {
            Path uploadPath = Paths.get(audioUploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            Path targetPath = uploadPath.resolve(newFileName);
            Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

            AudioFile audioFile = new AudioFile();
            audioFile.setChapter(chapter);
            audioFile.setFilePath("/uploads/audio/" + newFileName);
            audioFile.setOriginalFileName(originalFileName);
            audioFile.setContentType(file.getContentType() != null ? file.getContentType() : "application/octet-stream");
            audioFile.setFileSize(file.getSize());
            audioFile.setSource(AudioSource.UPLOAD);

            AudioFile savedAudio = audioFileRepository.save(audioFile);
            return toResponse(savedAudio);
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Could not upload audio file", e);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<AudioFileResponse> getAudioFiles(Long chapterId) {
        Chapter chapter = chapterRepository.findById(chapterId)
                .orElseThrow(() -> new ResourceNotFoundException("Chapter", "id", chapterId));

        return audioFileRepository.findByChapterIdOrderByCreatedAtDesc(chapter.getId()).stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public ChapterResponse getPublicChapter(Long storyId, Long chapterId) {
        Chapter chapter = findChapter(storyId, chapterId);
        boolean hasAccess = checkAccess(chapter);

        String content = hasAccess ? chapter.getContent() : null;

        Long prevId = chapterRepository.findPreviousChapterId(storyId, chapter.getChapterNumber()).orElse(null);
        Long nextId = chapterRepository.findNextChapterId(storyId, chapter.getChapterNumber()).orElse(null);

        return ChapterResponse.builder()
                .id(chapter.getId())
                .storyId(chapter.getStory().getId())
                .storyTitle(chapter.getStory().getTitle())
                .title(chapter.getTitle())
                .chapterNumber(chapter.getChapterNumber())
                .content(content)
                .accessLevel(chapter.getAccessLevel())
                .previousChapterId(prevId)
                .nextChapterId(nextId)
                .createdAt(chapter.getCreatedAt())
                .updatedAt(chapter.getUpdatedAt())
                .build();
    }

    @Override
    @Transactional
    public Map<String, Boolean> recordView(Long chapterId) {

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null
                || !authentication.isAuthenticated()
                || "anonymousUser".equals(authentication.getPrincipal())) {

            return Map.of("viewed", false);
        }

        UserPrincipal principal =
                (UserPrincipal) authentication.getPrincipal();

        User user = userRepository.findById(principal.getId())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "User",
                                "id",
                                principal.getId()
                        )
                );

        Chapter chapter = chapterRepository.findById(chapterId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Chapter",
                                "id",
                                chapterId
                        )
                );

        Story story = chapter.getStory();

        LocalDateTime now = LocalDateTime.now();

        /*
         * 1. Kiểm tra lần đọc gần nhất của Story
         */
        List<ReadingProgress> recentProgress =
                readingProgressRepository
                        .findByUserIdAndStoryIdOrderByUpdatedAtDesc(
                                user.getId(),
                                story.getId()
                        );

        boolean viewedRecently =
                !recentProgress.isEmpty()
                        && recentProgress.get(0)
                        .getUpdatedAt()
                        .isAfter(now.minusMinutes(30));


        /*
         * 2. Cập nhật ReadingProgress của chapter hiện tại
         */
        ReadingProgress progress =
                readingProgressRepository
                        .findByUserIdAndChapterId(
                                user.getId(),
                                chapterId
                        )
                        .orElseGet(() -> {

                            ReadingProgress newProgress =
                                    new ReadingProgress();

                            newProgress.setUser(user);
                            newProgress.setChapter(chapter);
                            newProgress.setLastPosition(0L);

                            return newProgress;
                        });

        progress.setUpdatedAt(now);

        readingProgressRepository.save(progress);


        /*
         * 3. Chỉ tăng view nếu Story chưa được user xem
         *    trong 30 phút gần nhất.
         */
        if (!viewedRecently) {

            story.setViewCount(
                    story.getViewCount() + 1
            );

            story.setViewsLast7Days(
                    story.getViewsLast7Days() + 1
            );

            storyRepository.save(story);

            return Map.of("viewed", true);
        }

        return Map.of("viewed", false);
    }

    private ChapterSummaryResponse toSummaryResponse(Chapter chapter) {
        return ChapterSummaryResponse.builder()
                .id(chapter.getId())
                .title(chapter.getTitle())
                .chapterNumber(chapter.getChapterNumber())
                .accessLevel(chapter.getAccessLevel())
                .createdAt(chapter.getCreatedAt())
                .build();
    }

    private AudioFileResponse toResponse(AudioFile audioFile) {
        return AudioFileResponse.builder()
                .id(audioFile.getId())
                .chapterId(audioFile.getChapter() != null ? audioFile.getChapter().getId() : null)
                .filePath(audioFile.getFilePath())
                .originalFileName(audioFile.getOriginalFileName())
                .contentType(audioFile.getContentType() != null ? audioFile.getContentType() : "application/octet-stream")
                .build();
    }

    private boolean checkAccess(Chapter chapter) {
        AccessLevel level = chapter.getAccessLevel();
        if (level == AccessLevel.PUBLIC) {
            return true;
        }

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            return false;
        }

        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        if (principal.isAdmin()) {
            return true;
        }
        if (level == AccessLevel.MEMBER) {
            return true;
        }
        if (level == AccessLevel.VIP && principal.isVip()) {
            return true;
        }

        return false;
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