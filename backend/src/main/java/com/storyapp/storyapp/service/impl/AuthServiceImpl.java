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
import com.storyapp.storyapp.mapper.UserMapper;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.storyapp.storyapp.dto.request.ForgotPasswordRequest;
import com.storyapp.storyapp.dto.request.VerifyOtpRequest;
import com.storyapp.storyapp.dto.request.ResetPasswordRequest;
import com.storyapp.storyapp.entity.PasswordResetOtp;
import com.storyapp.storyapp.repository.PasswordResetOtpRepository;
import com.storyapp.storyapp.service.EmailService;
import java.time.LocalDateTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UserMapper userMapper;
    private final PasswordResetOtpRepository passwordResetOtpRepository;
    private final EmailService emailService;

    @Override
    public AuthResponse register(RegisterRequest request) {
        String username = request.getUsername().trim();
        String email = request.getEmail().trim().toLowerCase();

        if (!request.getPassword().equals(request.getPasswordConfirm())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Mật khẩu và xác nhận mật khẩu không trùng khớp");
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
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Tên đăng nhập/email hoặc mật khẩu không chính xác");
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

    @Override
    @Transactional
    public void forgotPassword(ForgotPasswordRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy tài khoản với email này."));

        Optional<PasswordResetOtp> latestOtp = passwordResetOtpRepository.findTopByEmailAndUsedFalseOrderByCreatedAtDesc(email);
        if (latestOtp.isPresent() && latestOtp.get().getCreatedAt() != null 
                && latestOtp.get().getCreatedAt().isAfter(LocalDateTime.now().minusMinutes(1))) {
            throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS, "Vui lòng đợi 1 phút trước khi yêu cầu gửi lại mã OTP.");
        }

        String otpCode = String.format("%06d", new java.util.Random().nextInt(1000000));

        PasswordResetOtp resetOtp = new PasswordResetOtp();
        resetOtp.setEmail(email);
        resetOtp.setOtpCode(otpCode);
        resetOtp.setExpiryDate(LocalDateTime.now().plusMinutes(10));
        resetOtp.setUsed(false);

        passwordResetOtpRepository.save(resetOtp);

        emailService.sendOtpEmail(email, otpCode);
    }

    @Override
    @Transactional(readOnly = true)
    public void verifyOtp(VerifyOtpRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        String otp = request.getOtpCode().trim();

        PasswordResetOtp resetOtp = passwordResetOtpRepository.findByEmailAndOtpCodeAndUsedFalse(email, otp)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Mã OTP không chính xác."));

        if (resetOtp.getExpiryDate().isBefore(LocalDateTime.now())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Mã OTP đã hết hạn. Vui lòng yêu cầu mã mới.");
        }
    }

    @Override
    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        String otp = request.getOtpCode().trim();

        PasswordResetOtp resetOtp = passwordResetOtpRepository.findByEmailAndOtpCodeAndUsedFalse(email, otp)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Mã OTP không chính xác."));

        if (resetOtp.getExpiryDate().isBefore(LocalDateTime.now())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Mã OTP đã hết hạn. Vui lòng yêu cầu mã mới.");
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy tài khoản."));

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        resetOtp.setUsed(true);
        passwordResetOtpRepository.save(resetOtp);
    }

    private User findByUsernameOrEmail(String usernameOrEmail) {
        String value = usernameOrEmail.trim();
        return userRepository.findByUsername(value)
                .or(() -> userRepository.findByEmail(value.toLowerCase()))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Tên đăng nhập/email hoặc mật khẩu không chính xác"));
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
        return userMapper.toResponse(user);
    }
}
