package com.storyapp.storyapp.dto.response;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class GenreResponse {

    private Long id;

    private String name;

}
