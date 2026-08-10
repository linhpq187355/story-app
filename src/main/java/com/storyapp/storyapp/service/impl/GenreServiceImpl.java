package com.storyapp.storyapp.service.impl;

import com.storyapp.storyapp.dto.request.CreateGenreRequest;
import com.storyapp.storyapp.dto.response.GenreResponse;
import com.storyapp.storyapp.entity.Genre;
import com.storyapp.storyapp.repository.GenreRepository;
import com.storyapp.storyapp.service.GenreService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class GenreServiceImpl implements GenreService {

    private final GenreRepository genreRepository;

    @Override
    public GenreResponse create(CreateGenreRequest request) {
        String name = request.getName().trim();
        if (genreRepository.existsByName(name)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Genre already exists");
        }
        Genre genre = new Genre();
        genre.setName(name);
        return toResponse(genreRepository.save(genre));
    }

    @Override
    @Transactional(readOnly = true)
    public List<GenreResponse> getAll() {
        return genreRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public GenreResponse update(Long id, CreateGenreRequest request) {
        Genre genre = genreRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Genre not found"));
        String name = request.getName().trim();
        genreRepository.findByName(name)
                .filter(existing -> !existing.getId().equals(id))
                .ifPresent(existing -> {
                    throw new ResponseStatusException(HttpStatus.CONFLICT, "Genre already exists");
                });
        genre.setName(name);
        return toResponse(genreRepository.save(genre));
    }

    @Override
    public void delete(Long id) {
        if (!genreRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Genre not found");
        }
        genreRepository.deleteById(id);
    }

    private GenreResponse toResponse(Genre genre) {
        return GenreResponse.builder()
                .id(genre.getId())
                .name(genre.getName())
                .build();
    }
}
