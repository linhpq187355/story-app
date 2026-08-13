package com.storyapp.storyapp.service.impl;

import com.storyapp.storyapp.dto.request.LoginRequest;
import com.storyapp.storyapp.dto.request.RegisterRequest;
import com.storyapp.storyapp.dto.response.AuthResponse;
import com.storyapp.storyapp.dto.response.UserResponse;
import com.storyapp.storyapp.entity.User;
import com.storyapp.storyapp.enums.Role;
import com.storyapp.storyapp.repository.UserRepository;
import com.storyapp.storyapp.security.JwtService;
import com.storyapp.storyapp.security.UserPrincipal;
import com.storyapp.storyapp.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
@Transactional
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    @Override
    public AuthResponse register(RegisterRequest request) {
        String username = request.getUsername().trim();
        String email = request.getEmail().trim().toLowerCase();

        if (!request.getPassword().equals(request.getPasswordConfirm())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Passwords do not match");
        }

        if (userRepository.existsByUsername(username)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Username already exists");
        }
        if (userRepository.existsByEmail(email)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already exists");
        }

        User user = new User();
        user.setUsername(username);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(Role.ROLE_MEMBER);
        user.setIsVip(false);

        User savedUser = userRepository.save(user);
        return buildAuthResponse(savedUser);
    }

    @Override
    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        User user = findByUsernameOrEmail(request.getUsernameOrEmail());
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(user.getUsername(), request.getPassword())
            );
        } catch (BadCredentialsException ex) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid username/email or password");
        }
        return buildAuthResponse(user);
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getCurrentUser(UserPrincipal principal) {
        User user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        return toResponse(user);
    }

    @Override
    @Transactional(readOnly = true)
    public AuthResponse refreshToken(UserPrincipal principal) {
        User user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        return buildAuthResponse(user);
    }

    private User findByUsernameOrEmail(String usernameOrEmail) {
        String value = usernameOrEmail.trim();
        return userRepository.findByUsername(value)
                .or(() -> userRepository.findByEmail(value.toLowerCase()))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid username/email or password"));
    }

    private AuthResponse buildAuthResponse(User user) {
        return AuthResponse.builder()
                .tokenType("Bearer")
                .accessToken(jwtService.generateToken(user))
                .expiresInMs(jwtService.getExpirationMs())
                .user(toResponse(user))
                .build();
    }

    private UserResponse toResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .role(user.getRole())
                .isVip(user.getIsVip())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
