package com.storyapp.storyapp.controller;

import com.storyapp.storyapp.dto.request.CreateGenreRequest;
import com.storyapp.storyapp.dto.response.GenreResponse;
import com.storyapp.storyapp.service.GenreService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/genres")
@RequiredArgsConstructor
public class GenreController {

    private final GenreService genreService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public GenreResponse create(@Valid @RequestBody CreateGenreRequest request) {
        return genreService.create(request);
    }

    @GetMapping
    public List<GenreResponse> getAll() {
        return genreService.getAll();
    }

    @PutMapping("/{id}")
    public GenreResponse update(@PathVariable Long id, @Valid @RequestBody CreateGenreRequest request) {
        return genreService.update(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        genreService.delete(id);
    }
}
