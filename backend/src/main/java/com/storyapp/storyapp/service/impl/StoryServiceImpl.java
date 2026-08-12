package com.storyapp.storyapp.service.impl;

import com.storyapp.storyapp.dto.request.StoryRequest;
import com.storyapp.storyapp.dto.response.StoryResponse;
import com.storyapp.storyapp.entity.Story;
import com.storyapp.storyapp.exception.ResourceNotFoundException;
import com.storyapp.storyapp.mapper.StoryMapper;
import com.storyapp.storyapp.repository.AuthorRepository;
import com.storyapp.storyapp.repository.GenreRepository;
import com.storyapp.storyapp.repository.StoryRepository;
import com.storyapp.storyapp.service.StoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class StoryServiceImpl implements StoryService {

    private final StoryRepository storyRepository;
    private final AuthorRepository authorRepository;
    private final GenreRepository genreRepository;
    private final StoryMapper storyMapper;

    @Override
    public StoryResponse create(StoryRequest request) {
        Story story = new Story();
        applyRequest(story, request);
        return storyMapper.toResponse(storyRepository.save(story));
    }

    @Override
    @Transactional(readOnly = true)
    public List<StoryResponse> getAll() {
        return storyRepository.findAll().stream()
                .map(storyMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public StoryResponse getById(Long id) {
        return storyMapper.toResponse(findStory(id));
    }

    @Override
    public StoryResponse update(Long id, StoryRequest request) {
        Story story = findStory(id);
        applyRequest(story, request);
        return storyMapper.toResponse(storyRepository.save(story));
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
    public Page<StoryResponse> findPublicStories(String keyword, Long genreId, Pageable pageable) {
        return storyRepository.findPublicStories(keyword, genreId, pageable)
                .map(storyMapper::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public StoryResponse getPublicStoryDetails(Long storyId) {
        Story story = findStory(storyId);
        return storyMapper.toResponse(story);
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
}
