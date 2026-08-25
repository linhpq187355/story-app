package com.storyapp.storyapp.repository;

import com.storyapp.storyapp.entity.FavoriteStory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface FavoriteStoryRepository extends JpaRepository<FavoriteStory, Long> {

    boolean existsByUserIdAndStoryId(Long userId, Long storyId);

    Optional<FavoriteStory> findByUserIdAndStoryId(Long userId, Long storyId);

    long countByStoryId(Long storyId);

    @EntityGraph(attributePaths = {"story", "story.author", "story.genre"})
    Page<FavoriteStory> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);
}
