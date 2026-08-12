package com.storyapp.storyapp.service;

import com.storyapp.storyapp.dto.request.LoginRequest;
import com.storyapp.storyapp.dto.request.RegisterRequest;
import com.storyapp.storyapp.dto.response.AuthResponse;
import com.storyapp.storyapp.dto.response.UserResponse;
import com.storyapp.storyapp.security.UserPrincipal;

public interface AuthService {

    AuthResponse register(RegisterRequest request);

    AuthResponse login(LoginRequest request);

    UserResponse getCurrentUser(UserPrincipal principal);
}
