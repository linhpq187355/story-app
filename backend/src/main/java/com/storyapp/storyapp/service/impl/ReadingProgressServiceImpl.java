package com.storyapp.storyapp.service.impl;

import com.storyapp.storyapp.dto.response.ReadingProgressResponse;
import com.storyapp.storyapp.dto.response.StoryResponse;
import com.storyapp.storyapp.entity.Chapter;
import com.storyapp.storyapp.entity.ReadingProgress;
import com.storyapp.storyapp.entity.User;
import com.storyapp.storyapp.exception.ResourceNotFoundException;
import com.storyapp.storyapp.mapper.StoryMapper;
import com.storyapp.storyapp.repository.ChapterRepository;
import com.storyapp.storyapp.repository.ReadingProgressRepository;
import com.storyapp.storyapp.repository.UserRepository;
import com.storyapp.storyapp.security.UserPrincipal;
import com.storyapp.storyapp.service.ReadingProgressService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
public class ReadingProgressServiceImpl implements ReadingProgressService {

    private final ReadingProgressRepository readingProgressRepository;
    private final ChapterRepository chapterRepository;
    private final UserRepository userRepository;
    private final StoryMapper storyMapper;

    @Override
    public void updateProgress(Long chapterId, Long lastPosition) {

        User user = getCurrentUser();

        Chapter chapter = chapterRepository.findById(chapterId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Chapter",
                                "id",
                                chapterId
                        )
                );

        if (lastPosition == null || lastPosition < 0) {
            lastPosition = 0L;
        }

        ReadingProgress progress =
                readingProgressRepository
                        .findByUserIdAndChapterId(
                                user.getId(),
                                chapterId
                        )
                        .orElseGet(() -> {
                            ReadingProgress newProgress =
                                    new ReadingProgress();

                            newProgress.setUser(user);
                            newProgress.setChapter(chapter);

                            return newProgress;
                        });

        progress.setLastPosition(lastPosition);
        progress.setUpdatedAt(LocalDateTime.now());

        readingProgressRepository.save(progress);
    }

    /*@Override
    @Transactional(readOnly = true)
    public Optional<ReadingProgressResponse> getProgressForStory(
            Long storyId
    ) {

        User user = getCurrentUser();

        return readingProgressRepository
                .findByUserIdAndStoryIdOrderByUpdatedAtDesc(
                        user.getId(),
                        storyId
                )
                .stream()
                .findFirst()
                .map(progress ->
                        ReadingProgressResponse.builder()
                                .chapterId(
                                        progress.getChapter().getId()
                                )
                                .chapterNumber(
                                        progress.getChapter()
                                                .getChapterNumber()
                                )
                                .lastPosition(
                                        progress.getLastPosition()
                                )
                                .build()
                );
    }*/

    /*@Override
    @Transactional(readOnly = true)
    public List<StoryResponse> getRecentlyReadStories() {

        User user = getCurrentUser();

        List<ReadingProgress> progressList =
                readingProgressRepository
                        .findByUserIdOrderByUpdatedAtDesc(
                                user.getId()
                        );


         * Một story có thể có nhiều ReadingProgress
         * vì user có thể đọc nhiều chapter.
         *
         * Chỉ lấy story đầu tiên xuất hiện
         * để mỗi story chỉ xuất hiện một lần.

        return progressList.stream()
                .map(progress -> progress.getChapter().getStory())
                .distinct()
                .map(story -> storyMapper.toResponse(story))
                .toList();
    }*/

    private User getCurrentUser() {

        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        if (authentication == null
                || !authentication.isAuthenticated()
                || "anonymousUser".equals(authentication.getPrincipal())) {

            throw new RuntimeException("User is not authenticated");
        }

        UserPrincipal principal =
                (UserPrincipal) authentication.getPrincipal();

        return userRepository.findById(principal.getId())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "User",
                                "id",
                                principal.getId()
                        )
                );
    }
}