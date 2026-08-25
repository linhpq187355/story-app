package com.storyapp.storyapp.service.impl;

import com.storyapp.storyapp.dto.request.RatingRequest;
import com.storyapp.storyapp.dto.response.RatingResponse;
import com.storyapp.storyapp.entity.Story;
import com.storyapp.storyapp.entity.StoryRating;
import com.storyapp.storyapp.entity.User;
import com.storyapp.storyapp.exception.ResourceNotFoundException;
import com.storyapp.storyapp.repository.StoryRatingRepository;
import com.storyapp.storyapp.repository.StoryRepository;
import com.storyapp.storyapp.repository.UserRepository;
import com.storyapp.storyapp.security.UserPrincipal;
import com.storyapp.storyapp.service.StoryRatingService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class StoryRatingServiceImpl implements StoryRatingService {

    private final StoryRatingRepository ratingRepository;
    private final StoryRepository storyRepository;
    private final UserRepository userRepository;

    @Override
    public RatingResponse rateStory(Long storyId, RatingRequest request) {
        User user = getCurrentUser();

        Story story = storyRepository.findById(storyId)
                .orElseThrow(() -> new ResourceNotFoundException("Story", "id", storyId));

        StoryRating rating = ratingRepository.findByStoryIdAndUserId(storyId, user.getId())
                .orElseGet(() -> {
                    StoryRating newRating = new StoryRating();
                    newRating.setUser(user);
                    newRating.setStory(story);
                    return newRating;
                });

        rating.setRating(request.getRating());
        ratingRepository.save(rating);

        return getStoryRatingSummary(storyId);
    }

    @Override
    @Transactional(readOnly = true)
    public RatingResponse getStoryRatingSummary(Long storyId) {
        if (!storyRepository.existsById(storyId)) {
            throw new ResourceNotFoundException("Story", "id", storyId);
        }

        Double avg = ratingRepository.findAverageRatingByStoryId(storyId);
        long count = ratingRepository.countByStoryId(storyId);

        double roundedAvg = avg != null ? Math.round(avg * 10.0) / 10.0 : 0.0;

        Integer userRating = null;
        User user = getCurrentUserOrNull();
        if (user != null) {
            userRating = ratingRepository.findByStoryIdAndUserId(storyId, user.getId())
                    .map(StoryRating::getRating)
                    .orElse(null);
        }

        return RatingResponse.builder()
                .averageRating(roundedAvg)
                .totalRatings(count)
                .userRating(userRating)
                .build();
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
