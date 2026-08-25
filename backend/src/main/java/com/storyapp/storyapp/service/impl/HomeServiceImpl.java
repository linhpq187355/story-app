package com.storyapp.storyapp.service.impl;

import com.storyapp.storyapp.dto.response.HomeHotStoryResponse;
import com.storyapp.storyapp.dto.response.HomePageResponse;
import com.storyapp.storyapp.dto.response.HomeRecentlyReadResponse;
import com.storyapp.storyapp.dto.response.HomeUpdatingStoryResponse;
import com.storyapp.storyapp.dto.response.RankItemResponse;
import com.storyapp.storyapp.dto.response.RankingsResponse;
import com.storyapp.storyapp.entity.Chapter;
import com.storyapp.storyapp.entity.Story;
import com.storyapp.storyapp.enums.StoryStatus;
import com.storyapp.storyapp.repository.ChapterRepository;
import com.storyapp.storyapp.repository.ReadingProgressRepository;
import com.storyapp.storyapp.repository.StoryRepository;
import com.storyapp.storyapp.repository.projection.RecentlyReadProjection;
import com.storyapp.storyapp.repository.projection.StoryWithLatestChapterProjection;
import com.storyapp.storyapp.service.HomeService;
import com.storyapp.storyapp.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.concurrent.atomic.AtomicInteger;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class HomeServiceImpl implements HomeService {

    private static final int HOT_STORY_LIMIT = 6;
    private static final int UPDATING_STORY_LIMIT = 12;

    private final StoryRepository storyRepository;
    private final ChapterRepository chapterRepository;
    private final ReadingProgressRepository readingProgressRepository;

    @Override
    public HomePageResponse getHomePageData() {

        List<Story> hotStories = storyRepository
                .findHotStories(PageRequest.of(0, HOT_STORY_LIMIT))
                .getContent();

        List<StoryWithLatestChapterProjection> updatingStories =
                storyRepository.findUpdatingStoriesWithLatestChapter(
                        UPDATING_STORY_LIMIT
                );

        List<HomeRecentlyReadResponse> recentlyRead =
                getRecentlyReadStories();

        AtomicInteger rankCounter = new AtomicInteger(1);

        List<HomeHotStoryResponse> hotStoryResponses =
                hotStories.stream()
                        .map(story ->
                                toHotStoryResponse(
                                        story,
                                        rankCounter.getAndIncrement()
                                )
                        )
                        .toList();

        List<HomeUpdatingStoryResponse> updatingStoryResponses =
                updatingStories.stream()
                        .map(this::toUpdatingStoryResponse)
                        .toList();

        RankingsResponse rankings = RankingsResponse.builder()
                .topRated(getTopRatedRankings())
                .topFollowed(getTopFollowedRankings())
                .topViewed(getTopViewedRankings())
                .build();

        return HomePageResponse.builder()
                .recentlyRead(recentlyRead)
                .hotStories(hotStoryResponses)
                .updatingStories(updatingStoryResponses)
                .rankings(rankings)
                .build();
    }

    private List<RankItemResponse> getTopRatedRankings() {
        List<Object[]> rows = storyRepository.findTopRatedStories(PageRequest.of(0, 10));
        AtomicInteger rank = new AtomicInteger(1);
        return rows.stream().map(row -> {
            Story s = (Story) row[0];
            Double avg = (Double) row[1];
            String val = String.format("%.1f ★", avg != null ? avg : 0.0);
            return RankItemResponse.builder()
                    .id(s.getId())
                    .rank(rank.getAndIncrement())
                    .title(s.getTitle())
                    .authorName(s.getAuthor() != null ? s.getAuthor().getName() : "Đang cập nhật")
                    .coverImageUrl(s.getCoverImageUrl())
                    .formattedValue(val)
                    .build();
        }).toList();
    }

    private List<RankItemResponse> getTopFollowedRankings() {
        List<Object[]> rows = storyRepository.findTopFollowedStories(PageRequest.of(0, 10));
        AtomicInteger rank = new AtomicInteger(1);
        return rows.stream().map(row -> {
            Story s = (Story) row[0];
            Long count = (Long) row[1];
            String val = String.format("%,d lượt", count != null ? count : 0);
            return RankItemResponse.builder()
                    .id(s.getId())
                    .rank(rank.getAndIncrement())
                    .title(s.getTitle())
                    .authorName(s.getAuthor() != null ? s.getAuthor().getName() : "Đang cập nhật")
                    .coverImageUrl(s.getCoverImageUrl())
                    .formattedValue(val)
                    .build();
        }).toList();
    }

    private List<RankItemResponse> getTopViewedRankings() {
        List<Story> stories = storyRepository.findTopViewedStories(PageRequest.of(0, 10));
        AtomicInteger rank = new AtomicInteger(1);
        return stories.stream().map(s -> {
            Long count = s.getViewCount() != null ? s.getViewCount() : 0L;
            String val = String.format("%,d lượt", count);
            return RankItemResponse.builder()
                    .id(s.getId())
                    .rank(rank.getAndIncrement())
                    .title(s.getTitle())
                    .authorName(s.getAuthor() != null ? s.getAuthor().getName() : "Đang cập nhật")
                    .coverImageUrl(s.getCoverImageUrl())
                    .formattedValue(val)
                    .build();
        }).toList();
    }

    /**
     * Lấy tối đa 5 truyện user vừa đọc gần đây.
     *
     * ReadingProgress có thể có nhiều record
     * cho cùng một story vì user đọc nhiều chapter.
     *
     * Ví dụ:
     *
     * Story A - Chapter 10
     * Story A - Chapter 9
     * Story B - Chapter 5
     *
     * => chỉ lấy Story A một lần.
     */
    private List<HomeRecentlyReadResponse> getRecentlyReadStories() {

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null
                || !authentication.isAuthenticated()
                || "anonymousUser".equals(authentication.getPrincipal())) {

            return List.of();
        }

        UserPrincipal principal =
                (UserPrincipal) authentication.getPrincipal();

        List<RecentlyReadProjection> projections =
                readingProgressRepository.findRecentlyReadStories(
                        principal.getId()
                );

        return projections.stream()
                .map(this::toRecentlyReadResponse)
                .toList();
    }

    private HomeRecentlyReadResponse toRecentlyReadResponse(
            RecentlyReadProjection projection
    ) {

        return HomeRecentlyReadResponse.builder()
                .id(projection.getId())
                .title(projection.getTitle())
                .coverImageUrl(projection.getCoverImage())
                .description(projection.getDescription())
                .status(StoryStatus.valueOf(projection.getStatus()))
                .authorName(projection.getAuthorName())
                .genreName(projection.getGenreName())
                .build();
    }

    private HomeHotStoryResponse toHotStoryResponse(
            Story story,
            Integer rank
    ) {

        return HomeHotStoryResponse.builder()
                .id(story.getId())
                .rank(rank)
                .title(story.getTitle())
                .coverImageUrl(story.getCoverImageUrl())
                .description(story.getDescription())
                .status(story.getStatus())
                .authorName(
                        story.getAuthor() != null
                                ? story.getAuthor().getName()
                                : null
                )
                .genreName(
                        story.getGenre() != null
                                ? story.getGenre().getName()
                                : null
                )
                .build();
    }

    private HomeUpdatingStoryResponse toUpdatingStoryResponse(
            StoryWithLatestChapterProjection story
    ) {
        return HomeUpdatingStoryResponse.builder()
                .id(story.getId())
                .title(story.getTitle())
                .coverImageUrl(story.getCoverImageUrl())
                .description(story.getDescription())
                .status(story.getStatus())
                .authorName(story.getAuthorName())
                .genreName(story.getGenreName())
                .latestChapterId(story.getLatestChapterId())
                .latestChapterNumber(story.getLatestChapterNumber())
                .latestChapterTitle(story.getLatestChapterTitle())
                .latestActivityAt(story.getLatestActivityAt())
                .build();
    }
}