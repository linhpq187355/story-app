package com.storyapp.storyapp.service.impl;

import com.storyapp.storyapp.dto.request.ChangePasswordRequest;
import com.storyapp.storyapp.dto.request.ProfileUpdateRequest;
import com.storyapp.storyapp.dto.response.ReadingProgressResponse;
import com.storyapp.storyapp.dto.response.StoryResponse;
import com.storyapp.storyapp.dto.response.UserResponse;
import com.storyapp.storyapp.entity.ReadingProgress;
import com.storyapp.storyapp.entity.User;
import com.storyapp.storyapp.exception.BadRequestException;
import com.storyapp.storyapp.exception.ResourceNotFoundException;
import com.storyapp.storyapp.mapper.StoryMapper;
import com.storyapp.storyapp.mapper.UserMapper;
import com.storyapp.storyapp.repository.ChapterRepository;
import com.storyapp.storyapp.repository.ReadingProgressRepository;
import com.storyapp.storyapp.repository.UserRepository;
import com.storyapp.storyapp.security.UserPrincipal;
import com.storyapp.storyapp.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.*;

import com.storyapp.storyapp.dto.response.BookshelfItemResponse;
import com.storyapp.storyapp.repository.ChapterRepository;

import com.storyapp.storyapp.entity.VipPackage;
import com.storyapp.storyapp.repository.VipPackageRepository;

import com.storyapp.storyapp.service.CloudinaryService;

@Service
@RequiredArgsConstructor
@Transactional
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final ReadingProgressRepository readingProgressRepository;
    private final ChapterRepository chapterRepository;
    private final VipPackageRepository vipPackageRepository;
    private final StoryMapper storyMapper;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final CloudinaryService cloudinaryService;

    @Value("${app.upload.avatar-dir:uploads/avatars}")
    private String avatarUploadDir;

    @Override
    @Transactional(readOnly = true)
    public List<UserResponse> getAll(String search, Boolean isVip) {
        String keyword = StringUtils.hasText(search) ? search.trim() : null;
        return userRepository.filterUsers(keyword, isVip)
                .stream()
                .map(userMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getMe() {
        User user = getCurrentUser().orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not authenticated"));
        return userMapper.toResponse(user);
    }

    @Override
    @Transactional
    public UserResponse updateVipStatus(Long userId, Boolean isVip) {
        return updateVipStatus(userId, isVip, null, null);
    }

    @Override
    @Transactional
    public UserResponse updateVipStatus(Long userId, Boolean isVip, Integer durationDays) {
        return updateVipStatus(userId, isVip, null, durationDays);
    }

    @Override
    @Transactional
    public UserResponse updateVipStatus(Long userId, Boolean isVip, Long packageId, Integer durationDays) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        user.setIsVip(isVip);
        if (Boolean.TRUE.equals(isVip)) {
            int days = 30;
            if (packageId != null) {
                VipPackage pkg = vipPackageRepository.findById(packageId)
                        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "VipPackage not found"));
                days = pkg.getDurationDays();
            } else if (durationDays != null && durationDays > 0) {
                days = durationDays;
            }

            java.time.LocalDateTime currentExp = user.getVipExpirationDate();
            if (currentExp != null && currentExp.isAfter(java.time.LocalDateTime.now())) {
                user.setVipExpirationDate(currentExp.plusDays(days));
            } else {
                user.setVipExpirationDate(java.time.LocalDateTime.now().plusDays(days));
            }
        } else {
            user.setVipExpirationDate(null);
        }
        return userMapper.toResponse(userRepository.save(user));
    }

    @Override
    public UserResponse updateProfile(ProfileUpdateRequest request) {
        User user = getCurrentUser().orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not authenticated"));
        user.setDisplayName(request.getDisplayName());
        return userMapper.toResponse(userRepository.save(user));
    }

    @Override
    public UserResponse updateAvatar(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Avatar file is required");
        }

        User user = getCurrentUser().orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not authenticated"));

        if (cloudinaryService.isConfigured()) {
            String cloudinaryUrl = cloudinaryService.uploadImage(file, "avatars");
            if (StringUtils.hasText(cloudinaryUrl)) {
                user.setAvatar(cloudinaryUrl);
                return userMapper.toResponse(userRepository.save(user));
            }
        }

        String originalFileName = StringUtils.cleanPath(Objects.requireNonNull(file.getOriginalFilename()));
        String extension = originalFileName.contains(".")
                ? originalFileName.substring(originalFileName.lastIndexOf('.'))
                : "";
        String newFileName = "user-" + user.getId() + "-" + UUID.randomUUID() + extension;

        try {
            Path uploadPath = Paths.get(avatarUploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            Path targetPath = uploadPath.resolve(newFileName);
            Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

            if (StringUtils.hasText(user.getAvatar())) {
                try {
                    Path oldAvatarPath = Paths.get(avatarUploadDir).resolve(Paths.get(user.getAvatar()).getFileName());
                    Files.deleteIfExists(oldAvatarPath);
                } catch (IOException e) {
                    System.err.println("Failed to delete old avatar: " + e.getMessage());
                }
            }

            user.setAvatar("/uploads/avatars/" + newFileName);
            return userMapper.toResponse(userRepository.save(user));

        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Could not upload avatar file", e);
        }
    }

    @Override
    public void changePassword(ChangePasswordRequest request) {
        User user = getCurrentUser().orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not authenticated"));

        if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
            throw new BadRequestException("Incorrect old password");
        }

        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new BadRequestException("New password and confirmation password do not match");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<ReadingProgressResponse> getReadingProgressForStory(Long storyId) {
        return getCurrentUser().flatMap(user -> {
            List<ReadingProgress> progressList = readingProgressRepository.findByUserIdAndStoryIdOrderByUpdatedAtDesc(user.getId(), storyId);
            if (progressList.isEmpty()) {
                return Optional.empty();
            }
            ReadingProgress progress = progressList.get(0);
            return Optional.of(
                    ReadingProgressResponse.builder()
                            .lastReadChapterId(progress.getChapter().getId())
                            .lastReadChapterNumber(progress.getChapter().getChapterNumber())
                            .lastPosition(progress.getLastPosition())
                            .build()
            );
        });
    }

    @Override
    @Transactional(readOnly = true)
    public Page<BookshelfItemResponse> getRecentlyReadStories(Pageable pageable) {
        return getCurrentUser().map(user -> {
            List<ReadingProgress> progressList = readingProgressRepository.findByUserIdOrderByUpdatedAtDesc(user.getId());
            Map<Long, ReadingProgress> latestProgressByStory = new LinkedHashMap<>();
            for (ReadingProgress progress : progressList) {
                Long storyId = progress.getChapter().getStory().getId();
                latestProgressByStory.putIfAbsent(storyId, progress);
            }
            List<BookshelfItemResponse> allItems = new ArrayList<>();
            for (ReadingProgress progress : latestProgressByStory.values()) {
                var story = progress.getChapter().getStory();
                Long firstChapterId = chapterRepository.findFirstChapterId(story.getId()).orElse(null);
                var chapter = progress.getChapter();

                allItems.add(BookshelfItemResponse.builder()
                        .storyId(story.getId())
                        .title(story.getTitle())
                        .coverImageUrl(story.getCoverImageUrl())
                        .authorName(story.getAuthor() != null ? story.getAuthor().getName() : null)
                        .genreName(story.getGenre() != null ? story.getGenre().getName() : null)
                        .status(story.getStatus() != null ? story.getStatus().name() : null)
                        .firstChapterId(firstChapterId)
                        .lastReadChapterId(chapter.getId())
                        .lastReadChapterNumber(chapter.getChapterNumber())
                        .lastReadChapterTitle(chapter.getTitle())
                        .build());
            }

            int start = (int) pageable.getOffset();
            if (start >= allItems.size()) {
                return new PageImpl<BookshelfItemResponse>(Collections.emptyList(), pageable, allItems.size());
            }
            int end = Math.min(start + pageable.getPageSize(), allItems.size());
            List<BookshelfItemResponse> pageContent = allItems.subList(start, end);
            return new PageImpl<BookshelfItemResponse>(pageContent, pageable, allItems.size());
        }).orElse(new PageImpl<BookshelfItemResponse>(Collections.emptyList(), pageable, 0));
    }

    private Optional<User> getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            return Optional.empty();
        }
        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        return userRepository.findById(principal.getId());
    }
}