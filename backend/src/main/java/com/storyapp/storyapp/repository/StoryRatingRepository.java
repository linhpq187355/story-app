package com.storyapp.storyapp.repository;

import com.storyapp.storyapp.entity.StoryRating;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface StoryRatingRepository extends JpaRepository<StoryRating, Long> {

    Optional<StoryRating> findByStoryIdAndUserId(Long storyId, Long userId);

    @Query("SELECT AVG(r.rating) FROM StoryRating r WHERE r.story.id = :storyId")
    Double findAverageRatingByStoryId(@Param("storyId") Long storyId);

    long countByStoryId(Long storyId);
}
