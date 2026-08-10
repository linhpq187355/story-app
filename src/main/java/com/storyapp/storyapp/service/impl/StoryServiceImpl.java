package com.storyapp.storyapp.service.impl;

import com.storyapp.storyapp.dto.request.StoryRequest;
import com.storyapp.storyapp.dto.response.StoryResponse;
import com.storyapp.storyapp.entity.Author;
import com.storyapp.storyapp.entity.Genre;
import com.storyapp.storyapp.entity.Story;
import com.storyapp.storyapp.repository.AuthorRepository;
import com.storyapp.storyapp.repository.GenreRepository;
import com.storyapp.storyapp.repository.StoryRepository;
import com.storyapp.storyapp.service.StoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class StoryServiceImpl implements StoryService {

    private final StoryRepository storyRepository;
    private final AuthorRepository authorRepository;
    private final GenreRepository genreRepository;

    @Override
    public StoryResponse create(StoryRequest request) {
        Story story = new Story();
        applyRequest(story, request);
        return toResponse(storyRepository.save(story));
    }

    @Override
    @Transactional(readOnly = true)
    public List<StoryResponse> getAll() {
        return storyRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public StoryResponse getById(Long id) {
        return toResponse(findStory(id));
    }

    @Override
    public StoryResponse update(Long id, StoryRequest request) {
        Story story = findStory(id);
        applyRequest(story, request);
        return toResponse(storyRepository.save(story));
    }

    @Override
    public void delete(Long id) {
        if (!storyRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Story not found");
        }
        storyRepository.deleteById(id);
    }

    private void applyRequest(Story story, StoryRequest request) {
        story.setTitle(request.getTitle().trim());
        story.setCoverImageUrl(trimToNull(request.getCoverImageUrl()));
        story.setDescription(trimToNull(request.getDescription()));
        story.setStatus(request.getStatus());
        story.setAuthor(resolveAuthor(request));
        story.setGenre(resolveGenre(request));
    }

    private Author resolveAuthor(StoryRequest request) {
        if (request.getAuthorId() != null) {
            return authorRepository.findById(request.getAuthorId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Author not found"));
        }
        String name = request.getAuthorName().trim();
        return authorRepository.findByName(name).orElseGet(() -> {
            Author author = new Author();
            author.setName(name);
            return authorRepository.save(author);
        });
    }

    private Genre resolveGenre(StoryRequest request) {
        if (request.getGenreId() != null) {
            return genreRepository.findById(request.getGenreId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Genre not found"));
        }
        String name = request.getGenreName().trim();
        return genreRepository.findByName(name).orElseGet(() -> {
            Genre genre = new Genre();
            genre.setName(name);
            return genreRepository.save(genre);
        });
    }

    private Story findStory(Long id) {
        return storyRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Story not found"));
    }

    private StoryResponse toResponse(Story story) {
        return StoryResponse.builder()
                .id(story.getId())
                .title(story.getTitle())
                .coverImageUrl(story.getCoverImageUrl())
                .description(story.getDescription())
                .status(story.getStatus())
                .authorId(story.getAuthor().getId())
                .authorName(story.getAuthor().getName())
                .genreId(story.getGenre().getId())
                .genreName(story.getGenre().getName())
                .createdAt(story.getCreatedAt())
                .updatedAt(story.getUpdatedAt())
                .build();
    }

    private String trimToNull(String value) {
        if (value == null || value.trim().isEmpty()) {
            return null;
        }
        return value.trim();
    }
}
