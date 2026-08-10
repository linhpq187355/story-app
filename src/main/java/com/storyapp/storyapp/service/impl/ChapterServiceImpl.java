package com.storyapp.storyapp.service.impl;

import com.storyapp.storyapp.dto.request.ChapterRequest;
import com.storyapp.storyapp.dto.response.AudioFileResponse;
import com.storyapp.storyapp.dto.response.ChapterResponse;
import com.storyapp.storyapp.entity.AudioFile;
import com.storyapp.storyapp.entity.Chapter;
import com.storyapp.storyapp.entity.Story;
import com.storyapp.storyapp.enums.AudioSource;
import com.storyapp.storyapp.repository.AudioFileRepository;
import com.storyapp.storyapp.repository.ChapterRepository;
import com.storyapp.storyapp.repository.StoryRepository;
import com.storyapp.storyapp.service.ChapterService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
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
        return toResponse(chapterRepository.save(chapter));
    }

    @Override
    @Transactional(readOnly = true)
    public List<ChapterResponse> getByStory(Long storyId) {
        ensureStoryExists(storyId);
        return chapterRepository.findByStoryIdOrderByChapterNumberAsc(storyId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public ChapterResponse getById(Long storyId, Long chapterId) {
        return toResponse(findChapter(storyId, chapterId));
    }

    @Override
    public ChapterResponse update(Long storyId, Long chapterId, ChapterRequest request) {
        Chapter chapter = findChapter(storyId, chapterId);
        if (!chapter.getChapterNumber().equals(request.getChapterNumber())
                && chapterRepository.existsByStoryIdAndChapterNumber(storyId, request.getChapterNumber())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Chapter number already exists in this story");
        }

        applyRequest(chapter, request);
        return toResponse(chapterRepository.save(chapter));
    }

    @Override
    public void delete(Long storyId, Long chapterId) {
        Chapter chapter = findChapter(storyId, chapterId);
        chapterRepository.delete(chapter);
    }

    @Override
    public AudioFileResponse uploadAudio(Long chapterId, MultipartFile file) {
        Chapter chapter = chapterRepository.findById(chapterId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Chapter not found"));
        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Audio file is required");
        }
        if (file.getContentType() == null || !file.getContentType().startsWith("audio/")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only audio files are allowed");
        }

        String originalFileName = StringUtils.cleanPath(file.getOriginalFilename() == null
                ? "audio"
                : file.getOriginalFilename());
        String extension = StringUtils.getFilenameExtension(originalFileName);
        String storedFileName = UUID.randomUUID() + (extension == null ? "" : "." + extension);

        try {
            Path uploadPath = Path.of(audioUploadDir).toAbsolutePath().normalize();
            Files.createDirectories(uploadPath);
            Path targetPath = uploadPath.resolve(storedFileName).normalize();
            if (!targetPath.startsWith(uploadPath)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid audio file name");
            }
            Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

            AudioFile audioFile = new AudioFile();
            audioFile.setChapter(chapter);
            audioFile.setFilePath(targetPath.toString());
            audioFile.setOriginalFileName(originalFileName);
            audioFile.setContentType(file.getContentType());
            audioFile.setFileSize(file.getSize());
            audioFile.setSource(AudioSource.UPLOAD);
            return toResponse(audioFileRepository.save(audioFile));
        } catch (IOException ex) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Could not store audio file", ex);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<AudioFileResponse> getAudioFiles(Long chapterId) {
        if (!chapterRepository.existsById(chapterId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Chapter not found");
        }
        return audioFileRepository.findByChapterIdOrderByCreatedAtDesc(chapterId).stream()
                .map(this::toResponse)
                .toList();
    }

    private void applyRequest(Chapter chapter, ChapterRequest request) {
        chapter.setTitle(request.getTitle().trim());
        chapter.setChapterNumber(request.getChapterNumber());
        chapter.setContent(request.getContent());
        chapter.setAccessLevel(request.getAccessLevel());
    }

    private Story findStory(Long storyId) {
        return storyRepository.findById(storyId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Story not found"));
    }

    private void ensureStoryExists(Long storyId) {
        if (!storyRepository.existsById(storyId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Story not found");
        }
    }

    private Chapter findChapter(Long storyId, Long chapterId) {
        return chapterRepository.findByStoryIdAndId(storyId, chapterId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Chapter not found"));
    }

    private ChapterResponse toResponse(Chapter chapter) {
        return ChapterResponse.builder()
                .id(chapter.getId())
                .storyId(chapter.getStory().getId())
                .storyTitle(chapter.getStory().getTitle())
                .title(chapter.getTitle())
                .chapterNumber(chapter.getChapterNumber())
                .content(chapter.getContent())
                .accessLevel(chapter.getAccessLevel())
                .createdAt(chapter.getCreatedAt())
                .updatedAt(chapter.getUpdatedAt())
                .build();
    }

    private AudioFileResponse toResponse(AudioFile audioFile) {
        return AudioFileResponse.builder()
                .id(audioFile.getId())
                .chapterId(audioFile.getChapter().getId())
                .filePath(audioFile.getFilePath())
                .originalFileName(audioFile.getOriginalFileName())
                .contentType(audioFile.getContentType())
                .fileSize(audioFile.getFileSize())
                .duration(audioFile.getDuration())
                .source(audioFile.getSource())
                .createdAt(audioFile.getCreatedAt())
                .build();
    }
}
