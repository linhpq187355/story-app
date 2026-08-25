package com.storyapp.storyapp.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AuthorRequest {

    @NotBlank(message = "Author name is required")
    @Size(max = 100)
    private String name;

    @Size(max = 1000)
    private String bio;
}
