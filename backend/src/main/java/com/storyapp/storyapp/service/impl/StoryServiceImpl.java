package com.storyapp.storyapp.service.impl;

import com.storyapp.storyapp.dto.request.StoryRequest;
import com.storyapp.storyapp.dto.response.StoryResponse;
import com.storyapp.storyapp.entity.Story;
import com.storyapp.storyapp.enums.StoryStatus;
import com.storyapp.storyapp.exception.ResourceNotFoundException;
import com.storyapp.storyapp.mapper.StoryMapper;
import com.storyapp.storyapp.repository.AuthorRepository;
import com.storyapp.storyapp.repository.ChapterRepository;
import com.storyapp.storyapp.repository.GenreRepository;
import com.storyapp.storyapp.repository.StoryRepository;
import com.storyapp.storyapp.repository.UserRepository;
import com.storyapp.storyapp.service.StoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
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
        return storyMapper.toResponse(savedStory, 0, null);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<StoryResponse> getStories(
        String keyword,
        Long genreId,
        Long authorId,
        StoryStatus status,
        Pageable pageable
    ) {
        return storyRepository.searchStories(
            keyword,
            genreId,
            authorId,
            status,
            pageable
        ).map(story -> {
            long chapterCount = chapterRepository.countByStoryId(story.getId());
            Long firstChapterId = chapterRepository.findFirstChapterId(story.getId()).orElse(null);
            return storyMapper.toResponse(story, chapterCount, firstChapterId);
        });
    }

    @Override
    @Transactional(readOnly = true)
    public StoryResponse getById(Long id) {
        Story story = findStory(id);
        long count = chapterRepository.countByStoryId(id);
        Long firstChapterId = chapterRepository.findFirstChapterId(id).orElse(null);
        return storyMapper.toResponse(story, count, firstChapterId);
    }

    @Override
    public StoryResponse update(Long id, StoryRequest request, MultipartFile coverImage) {
        Story story = findStory(id);

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
        return storyMapper.toResponse(updatedStory, count, firstChapterId);
    }

    @Override
    public void delete(Long id) {
        if (!storyRepository.existsById(id)) {
            throw new ResourceNotFoundException("Story", "id", id);
        }
        storyRepository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public StoryResponse getPublicStoryDetails(Long storyId) {
        Story story = findStory(storyId);
        long count = chapterRepository.countByStoryId(storyId);
        Long firstChapterId = chapterRepository.findFirstChapterId(storyId).orElse(null);
        return storyMapper.toResponse(story, count, firstChapterId);
    }

    private void applyRequest(Story story, StoryRequest request) {
        story.setTitle(request.getTitle().trim());
        story.setCoverImageUrl(trimToNull(request.getCoverImageUrl()));
        story.setDescription(trimToNull(request.getDescription()));
        story.setStatus(request.getStatus());

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