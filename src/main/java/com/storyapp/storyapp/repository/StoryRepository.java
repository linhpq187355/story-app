package com.storyapp.storyapp.repository;

import com.storyapp.storyapp.entity.Story;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface StoryRepository extends JpaRepository<Story, Long> {

    @Query("SELECT s FROM Story s WHERE " +
            "(:keyword IS NULL OR s.title LIKE %:keyword% OR s.author.name LIKE %:keyword%) AND " +
            "(:genreId IS NULL OR s.genre.id = :genreId)")
    Page<Story> findPublicStories(@Param("keyword") String keyword, @Param("genreId") Long genreId, Pageable pageable);
}
