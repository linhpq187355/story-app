package com.storyapp.storyapp.service.impl;

import com.storyapp.storyapp.dto.response.BookshelfItemResponse;
import com.storyapp.storyapp.dto.response.FavoriteStatusResponse;
import com.storyapp.storyapp.entity.FavoriteStory;
import com.storyapp.storyapp.entity.ReadingProgress;
import com.storyapp.storyapp.entity.Story;
import com.storyapp.storyapp.entity.User;
import com.storyapp.storyapp.exception.ResourceNotFoundException;
import com.storyapp.storyapp.repository.ChapterRepository;
import com.storyapp.storyapp.repository.FavoriteStoryRepository;
import com.storyapp.storyapp.repository.ReadingProgressRepository;
import com.storyapp.storyapp.repository.StoryRepository;
import com.storyapp.storyapp.repository.UserRepository;
import com.storyapp.storyapp.security.UserPrincipal;
import com.storyapp.storyapp.service.FavoriteStoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
public class FavoriteStoryServiceImpl implements FavoriteStoryService {

    private final FavoriteStoryRepository favoriteRepository;
    private final StoryRepository storyRepository;
    private final UserRepository userRepository;
    private final ChapterRepository chapterRepository;
    private final ReadingProgressRepository readingProgressRepository;

    @Override
    public FavoriteStatusResponse toggleFavorite(Long storyId) {
        User user = getCurrentUser();

        Story story = storyRepository.findById(storyId)
                .orElseThrow(() -> new ResourceNotFoundException("Story", "id", storyId));

        Optional<FavoriteStory> existing = favoriteRepository.findByUserIdAndStoryId(user.getId(), storyId);

        boolean isFavoriteNow;
        if (existing.isPresent()) {
            favoriteRepository.delete(existing.get());
            isFavoriteNow = false;

            // Decrement favoritesLast7Days (min 0)
            long currentFav = story.getFavoritesLast7Days() != null ? story.getFavoritesLast7Days() : 0L;
            story.setFavoritesLast7Days(Math.max(0L, currentFav - 1));
        } else {
            FavoriteStory fav = new FavoriteStory();
            fav.setUser(user);
            fav.setStory(story);
            favoriteRepository.save(fav);
            isFavoriteNow = true;

            // Increment favoritesLast7Days
            long currentFav = story.getFavoritesLast7Days() != null ? story.getFavoritesLast7Days() : 0L;
            story.setFavoritesLast7Days(currentFav + 1);
        }

        storyRepository.save(story);
        long totalFavorites = favoriteRepository.countByStoryId(storyId);

        return FavoriteStatusResponse.builder()
                .isFavorite(isFavoriteNow)
                .totalFavorites(totalFavorites)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public FavoriteStatusResponse getFavoriteStatus(Long storyId) {
        if (!storyRepository.existsById(storyId)) {
            throw new ResourceNotFoundException("Story", "id", storyId);
        }

        long totalFavorites = favoriteRepository.countByStoryId(storyId);

        boolean isFavorite = false;
        User user = getCurrentUserOrNull();
        if (user != null) {
            isFavorite = favoriteRepository.existsByUserIdAndStoryId(user.getId(), storyId);
        }

        return FavoriteStatusResponse.builder()
                .isFavorite(isFavorite)
                .totalFavorites(totalFavorites)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public Page<BookshelfItemResponse> getUserFavoriteStories(Pageable pageable) {
        User user = getCurrentUser();
        return favoriteRepository.findByUserIdOrderByCreatedAtDesc(user.getId(), pageable)
                .map(fav -> {
                    Story story = fav.getStory();
                    Long firstChapterId = chapterRepository.findFirstChapterId(story.getId()).orElse(null);

                    List<ReadingProgress> progressList = readingProgressRepository.findByUserIdAndStoryIdOrderByUpdatedAtDesc(user.getId(), story.getId());

                    Long lastReadChapterId = null;
                    Integer lastReadChapterNumber = null;
                    String lastReadChapterTitle = null;

                    if (!progressList.isEmpty()) {
                        var chapter = progressList.get(0).getChapter();
                        lastReadChapterId = chapter.getId();
                        lastReadChapterNumber = chapter.getChapterNumber();
                        lastReadChapterTitle = chapter.getTitle();
                    }

                    return BookshelfItemResponse.builder()
                            .storyId(story.getId())
                            .title(story.getTitle())
                            .coverImageUrl(story.getCoverImageUrl())
                            .authorName(story.getAuthor() != null ? story.getAuthor().getName() : null)
                            .genreName(story.getGenre() != null ? story.getGenre().getName() : null)
                            .status(story.getStatus() != null ? story.getStatus().name() : null)
                            .firstChapterId(firstChapterId)
                            .lastReadChapterId(lastReadChapterId)
                            .lastReadChapterNumber(lastReadChapterNumber)
                            .lastReadChapterTitle(lastReadChapterTitle)
                            .build();
                });
    }

    private User getCurrentUser() {
        User user = getCurrentUserOrNull();
        if (user == null) {
            throw new RuntimeException("User is not authenticated");
        }
        return user;
    }

    private User getCurrentUserOrNull() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            return null;
        }

        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        return userRepository.findById(principal.getId()).orElse(null);
    }
}
