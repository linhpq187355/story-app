package com.storyapp.storyapp.controller;

import com.storyapp.storyapp.dto.response.AuthorResponse;
import com.storyapp.storyapp.service.AuthorService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/authors")
@RequiredArgsConstructor
public class AuthorController {

    private final AuthorService authorService;

    @GetMapping
    public List<AuthorResponse> getAll() {
        return authorService.getAll();
    }
}
