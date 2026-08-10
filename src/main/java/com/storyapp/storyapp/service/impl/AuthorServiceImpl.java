package com.storyapp.storyapp.service.impl;

import com.storyapp.storyapp.dto.response.AuthorResponse;
import com.storyapp.storyapp.entity.Author;
import com.storyapp.storyapp.repository.AuthorRepository;
import com.storyapp.storyapp.service.AuthorService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class AuthorServiceImpl implements AuthorService {

    private final AuthorRepository authorRepository;

    @Override
    public AuthorResponse create(String name, String bio) {
        Author author = new Author();
        author.setName(name.trim());
        author.setBio(trimToNull(bio));
        return toResponse(authorRepository.save(author));
    }

    @Override
    @Transactional(readOnly = true)
    public List<AuthorResponse> getAll() {
        return authorRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public AuthorResponse update(Long id, String name, String bio) {
        Author author = authorRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Author not found"));
        author.setName(name.trim());
        author.setBio(trimToNull(bio));
        return toResponse(authorRepository.save(author));
    }

    @Override
    public void delete(Long id) {
        if (!authorRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Author not found");
        }
        authorRepository.deleteById(id);
    }

    private AuthorResponse toResponse(Author author) {
        return AuthorResponse.builder()
                .id(author.getId())
                .name(author.getName())
                .bio(author.getBio())
                .build();
    }

    private String trimToNull(String value) {
        if (value == null || value.trim().isEmpty()) {
            return null;
        }
        return value.trim();
    }
}
