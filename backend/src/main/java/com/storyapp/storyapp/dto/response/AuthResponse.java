package com.storyapp.storyapp.dto.response;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class AuthResponse {

    private String tokenType;

    private String accessToken;

    private Long expiresInMs;

    private UserResponse user;
}
