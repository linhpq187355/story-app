package com.storyapp.storyapp.service;

import com.storyapp.storyapp.dto.request.CreateGenreRequest;
import com.storyapp.storyapp.dto.response.GenreResponse;

import java.util.List;

public interface GenreService {

    GenreResponse create(CreateGenreRequest request);

    List<GenreResponse> getAll();

    GenreResponse update(Long id, CreateGenreRequest request);

    void delete(Long id);

}
