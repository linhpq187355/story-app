package com.storyapp.storyapp.mapper;

import com.storyapp.storyapp.dto.response.UserResponse;
import com.storyapp.storyapp.entity.User;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {

    public UserResponse toResponse(User user) {
        if (user == null) {
            return null;
        }

        return UserResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .displayName(user.getDisplayName())
                .avatar(user.getAvatar())
                .role(user.getRole())
                .isVip(user.isVipActive())
                .vipExpirationDate(user.getVipExpirationDate())
                .coins(user.getCoins() != null ? user.getCoins() : 0L)
                .createdAt(user.getCreatedAt())
                .build();
    }
}