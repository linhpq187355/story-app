package com.storyapp.storyapp.service.impl;

import com.storyapp.storyapp.dto.response.ReadingProgressResponse;
import com.storyapp.storyapp.dto.response.StoryResponse;
import com.storyapp.storyapp.dto.response.UserResponse;
import com.storyapp.storyapp.entity.ReadingProgress;
import com.storyapp.storyapp.entity.User;
import com.storyapp.storyapp.mapper.StoryMapper;
import com.storyapp.storyapp.repository.ChapterRepository;
import com.storyapp.storyapp.repository.ReadingProgressRepository;
import com.storyapp.storyapp.repository.UserRepository;
import com.storyapp.storyapp.security.UserPrincipal;
import com.storyapp.storyapp.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Optional;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final ReadingProgressRepository readingProgressRepository;
    private final StoryMapper storyMapper;
    private final ChapterRepository chapterRepository;

    @Override
    @Transactional(readOnly = true)
    public List<UserResponse> getAll() {
        return userRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public UserResponse updateVipStatus(Long userId, Boolean isVip) {

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "User not found"
                        )
                );

        user.setIsVip(isVip);

        return toResponse(userRepository.save(user));
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<ReadingProgressResponse> getReadingProgressForStory(
            Long storyId
    ) {

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null
                || !authentication.isAuthenticated()
                || "anonymousUser".equals(authentication.getPrincipal())) {

            return Optional.empty();
        }

        UserPrincipal principal =
                (UserPrincipal) authentication.getPrincipal();

        List<ReadingProgress> progressList =
                readingProgressRepository
                        .findByUserIdAndStoryIdOrderByUpdatedAtDesc(
                                principal.getId(),
                                storyId
                        );

        if (progressList.isEmpty()) {
            return Optional.empty();
        }

        ReadingProgress progress = progressList.get(0);

        return Optional.of(
                ReadingProgressResponse.builder()
                        .lastReadChapterId(
                                progress.getChapter().getId()
                        )
                        .lastReadChapterNumber(
                                progress.getChapter().getChapterNumber()
                        )
                        .lastPosition(
                                progress.getLastPosition()
                        )
                        .build()
        );
    }

    @Override
    @Transactional(readOnly = true)
    public List<StoryResponse> getRecentlyReadStories() {

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null
                || !authentication.isAuthenticated()
                || "anonymousUser".equals(authentication.getPrincipal())) {

            return Collections.emptyList();
        }

        UserPrincipal principal =
                (UserPrincipal) authentication.getPrincipal();

        List<ReadingProgress> progressList =
                readingProgressRepository
                        .findByUserIdOrderByUpdatedAtDesc(
                                principal.getId()
                        );

        /*
         * Một story có thể có rất nhiều ReadingProgress
         * vì user đọc nhiều chapter.
         *
         * Ví dụ:
         * chapter 1 -> story A
         * chapter 2 -> story A
         * chapter 3 -> story A
         *
         * Chỉ lấy story xuất hiện đầu tiên vì repository
         * đã ORDER BY updatedAt DESC.
         */
        Map<Long, ReadingProgress> latestProgressByStory =
                new LinkedHashMap<>();

        for (ReadingProgress progress : progressList) {

            Long storyId =
                    progress.getChapter()
                            .getStory()
                            .getId();

            latestProgressByStory.putIfAbsent(
                    storyId,
                    progress
            );
        }

        List<StoryResponse> result = new ArrayList<>();

        for (ReadingProgress progress :
                latestProgressByStory.values()) {

            var story =
                    progress.getChapter().getStory();

            long chapterCount =
                    chapterRepository.countByStoryId(
                            story.getId()
                    );

            Long firstChapterId =
                    chapterRepository
                            .findFirstChapterId(story.getId())
                            .orElse(null);

            result.add(
                    storyMapper.toResponse(
                            story,
                            chapterCount,
                            firstChapterId
                    )
            );
        }

        return result;
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