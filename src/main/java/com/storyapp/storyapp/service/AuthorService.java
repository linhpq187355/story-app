package com.storyapp.storyapp.service;

import com.storyapp.storyapp.dto.response.AuthorResponse;

import java.util.List;

public interface AuthorService {

    AuthorResponse create(String name, String bio);

    List<AuthorResponse> getAll();

    AuthorResponse update(Long id, String name, String bio);

    void delete(Long id);
}
