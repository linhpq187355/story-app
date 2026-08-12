package com.storyapp.storyapp.service;

import com.storyapp.storyapp.dto.response.UserResponse;

import java.util.List;

public interface UserService {

    List<UserResponse> getAll();

    UserResponse updateVipStatus(Long userId, Boolean isVip);
}
