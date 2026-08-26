package com.storyapp.storyapp.security;

import com.storyapp.storyapp.enums.Role;
import com.storyapp.storyapp.entity.User;
import com.storyapp.storyapp.repository.UserRepository;
import com.storyapp.storyapp.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class OAuth2AuthenticationSuccessHandler
        implements AuthenticationSuccessHandler {

    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final BCryptPasswordEncoder passwordEncoder =
            new BCryptPasswordEncoder();

    @Override
    public void onAuthenticationSuccess(
            HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication
    ) throws IOException, ServletException {

        OAuth2User oauth2User =
                (OAuth2User) authentication.getPrincipal();

        String email = oauth2User.getAttribute("email");
        String name = oauth2User.getAttribute("name");
        String picture = oauth2User.getAttribute("picture");

        if (email == null || email.isBlank()) {
            response.sendRedirect(
                    "http://story-app-navy.vercel.app/login?error=google_email_missing"
            );
            return;
        }

        User user = userRepository.findByEmail(email)
                .orElseGet(() -> createGoogleUser(
                        email,
                        name,
                        picture
                ));

        String token = jwtService.generateToken(user);

        String redirectUrl =
                "http://story-app-navy.vercel.app/oauth2/redirect?token=" + token;

        response.sendRedirect(redirectUrl);
    }

    private User createGoogleUser(
            String email,
            String name,
            String picture
    ) {
        User user = new User();

        user.setEmail(email);

        user.setUsername(generateUniqueUsername(email));

        user.setPassword(
                passwordEncoder.encode(UUID.randomUUID().toString())
        );

        user.setDisplayName(
                name != null && !name.isBlank()
                        ? name
                        : user.getUsername()
        );

        user.setAvatar(picture);

        user.setRole(Role.ROLE_MEMBER);
        user.setIsVip(false);

        return userRepository.save(user);
    }

    private String generateUniqueUsername(String email) {

        String baseUsername = email
                .split("@")[0]
                .replaceAll("[^a-zA-Z0-9_]", "");

        if (baseUsername.isBlank()) {
            baseUsername = "google_user";
        }

        baseUsername = baseUsername.substring(
                0,
                Math.min(baseUsername.length(), 40)
        );

        String username = baseUsername;

        while (userRepository.existsByUsername(username)) {
            username = baseUsername + "_" +
                    UUID.randomUUID()
                            .toString()
                            .substring(0, 8);
        }

        return username;
    }
}