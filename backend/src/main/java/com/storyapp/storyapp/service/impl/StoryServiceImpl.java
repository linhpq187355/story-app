package com.storyapp.storyapp.service.impl;

import com.storyapp.storyapp.dto.request.StoryRequest;
import com.storyapp.storyapp.dto.response.StoryResponse;
import com.storyapp.storyapp.dto.response.StorySummaryResponse;
import com.storyapp.storyapp.entity.Chapter;
import com.storyapp.storyapp.entity.Story;
import com.storyapp.storyapp.enums.StoryStatus;
import com.storyapp.storyapp.exception.ResourceNotFoundException;
import com.storyapp.storyapp.mapper.StoryMapper;
import com.storyapp.storyapp.repository.AuthorRepository;
import com.storyapp.storyapp.repository.ChapterRepository;
import com.storyapp.storyapp.repository.GenreRepository;
import com.storyapp.storyapp.repository.StoryRepository;
import com.storyapp.storyapp.repository.StorySpecification;
import com.storyapp.storyapp.service.CloudinaryService;
import com.storyapp.storyapp.service.StoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class StoryServiceImpl implements StoryService {

    private final StoryRepository storyRepository;
    private final AuthorRepository authorRepository;
    private final GenreRepository genreRepository;
    private final ChapterRepository chapterRepository;
    private final StoryMapper storyMapper;
    private final CloudinaryService cloudinaryService;
    private final StorySpecification storySpecification;
    private final String UPLOAD_DIR = "uploads/covers/";

    @Override
    public StoryResponse create(StoryRequest request, MultipartFile coverImage) {
        if (coverImage != null && !coverImage.isEmpty()) {
            String imageUrl = uploadFile(coverImage);
            request.setCoverImageUrl(imageUrl);
        }

        Story story = new Story();
        applyRequest(story, request);
        Story savedStory = storyRepository.save(story);
        return storyMapper.toResponse(savedStory, 0, null, null);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<StorySummaryResponse> getStories(
        String keyword,
        Long genreId,
        Long authorId,
        StoryStatus status,
        Pageable pageable
    ) {
        Specification<Story> spec = Specification.where(storySpecification.withFetchJoin())
                .and(storySpecification.hasTitleOrAuthor(keyword))
                .and(storySpecification.hasGenre(genreId))
                .and(storySpecification.hasAuthor(authorId))
                .and(storySpecification.hasStatus(status));

        return storyRepository.findAll(spec, pageable)
                .map(storyMapper::toSummaryResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public StoryResponse getById(Long id) {
        Story story = findStory(id);
        long count = chapterRepository.countByStoryId(id);
        Long firstChapterId = chapterRepository.findFirstChapterId(id).orElse(null);
        Long latestChapterId = chapterRepository.findTopByStoryIdOrderByChapterNumberDesc(id).map(Chapter::getId).orElse(null);
        return storyMapper.toResponse(story, count, firstChapterId, latestChapterId);
    }

    @Override
    public StoryResponse update(Long id, StoryRequest request, MultipartFile coverImage) {
        Story story = findStory(id);

        if (request.getVersion() != null && story.getVersion() != null && story.getVersion() > 0 
                && !request.getVersion().equals(story.getVersion())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Truyện này đã được cập nhật bởi một Admin khác. Vui lòng tải lại trang và thử lại.");
        }

        if (coverImage != null && !coverImage.isEmpty()) {
            String imageUrl = uploadFile(coverImage);
            request.setCoverImageUrl(imageUrl);
        } else if (request.getCoverImageUrl() == null || request.getCoverImageUrl().isBlank()) {
            request.setCoverImageUrl(story.getCoverImageUrl());
        }

        applyRequest(story, request);
        Story updatedStory = storyRepository.save(story);
        long count = chapterRepository.countByStoryId(id);
        Long firstChapterId = chapterRepository.findFirstChapterId(id).orElse(null);
        return storyMapper.toResponse(updatedStory, count, firstChapterId, null);
    }

    @Override
    public void delete(Long id) {
        Story story = storyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Story", "id", id));
        story.setIsDeleted(true);
        storyRepository.save(story);
    }

    @Override
    @Transactional(readOnly = true)
    public StoryResponse getPublicStoryDetails(Long storyId) {
        Story story = findStory(storyId);
        long count = chapterRepository.countByStoryId(storyId);
        Long firstChapterId = chapterRepository.findFirstChapterId(storyId).orElse(null);
        return storyMapper.toResponse(story, count, firstChapterId, null);
    }

    private void applyRequest(Story story, StoryRequest request) {
        story.setTitle(request.getTitle().trim());
        story.setCoverImageUrl(trimToNull(request.getCoverImageUrl()));
        story.setDescription(trimToNull(request.getDescription()));
        story.setStatus(request.getStatus());
        story.setCoinPrice(request.getCoinPrice() != null ? request.getCoinPrice() : 0L);

        story.setAuthor(
                authorRepository.findById(request.getAuthorId())
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Author",
                                        "id",
                                        request.getAuthorId()))
        );

        story.setGenre(
                genreRepository.findById(request.getGenreId())
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Genre",
                                        "id",
                                        request.getGenreId()))
        );
    }

    private Story findStory(Long id) {
        return storyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Story", "id", id));
    }

    private String trimToNull(String value) {
        if (value == null || value.trim().isEmpty()) {
            return null;
        }
        return value.trim();
    }

    private String uploadFile(MultipartFile file) {
        if (cloudinaryService.isConfigured()) {
            String cloudinaryUrl = cloudinaryService.uploadImage(file, "covers");
            if (StringUtils.hasText(cloudinaryUrl)) {
                return cloudinaryUrl;
            }
        }

        try {
            Path uploadPath = Paths.get(UPLOAD_DIR);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            String originalFileName = file.getOriginalFilename();
            String fileExtension = originalFileName.substring(originalFileName.lastIndexOf("."));
            String newFileName = UUID.randomUUID().toString() + fileExtension;

            Path filePath = uploadPath.resolve(newFileName);
            Files.copy(file.getInputStream(), filePath);

            return "/uploads/covers/" + newFileName;

        } catch (IOException e) {
            throw new RuntimeException("Could not store file. Error: " + e.getMessage());
        }
    }
}