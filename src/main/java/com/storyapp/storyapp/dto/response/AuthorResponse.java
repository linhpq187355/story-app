package com.storyapp.storyapp.dto.response;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class AuthorResponse {

    private Long id;

    private String name;

    private String bio;
}
