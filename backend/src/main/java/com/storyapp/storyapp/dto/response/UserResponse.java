package com.storyapp.storyapp.dto.response;

import com.storyapp.storyapp.enums.Role;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class UserResponse {

    private Long id;

    private String username;

    private String email;

    private Role role;

    private Boolean isVip;

    private LocalDateTime createdAt;
}
