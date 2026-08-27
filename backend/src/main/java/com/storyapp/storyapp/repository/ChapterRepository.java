package com.storyapp.storyapp.repository;

import com.storyapp.storyapp.entity.Chapter;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ChapterRepository extends JpaRepository<Chapter, Long> {

    List<Chapter> findByStoryIdOrderByChapterNumberAsc(Long storyId);
    
    Page<Chapter> findByStoryId(Long storyId, Pageable pageable);

    Optional<Chapter> findByStoryIdAndId(Long storyId, Long id);

    boolean existsByStoryIdAndChapterNumber(Long storyId, Integer chapterNumber);

    long countByStoryId(Long storyId);

    Optional<Chapter> findTopByStoryIdOrderByChapterNumberDesc(Long storyId);

    @Query("SELECT c.id FROM Chapter c WHERE c.story.id = :storyId AND c.chapterNumber < :chapterNumber ORDER BY c.chapterNumber DESC LIMIT 1")
    Optional<Long> findPreviousChapterId(@Param("storyId") Long storyId, @Param("chapterNumber") Integer chapterNumber);

    @Query("SELECT c.id FROM Chapter c WHERE c.story.id = :storyId AND c.chapterNumber > :chapterNumber ORDER BY c.chapterNumber ASC LIMIT 1")
    Optional<Long> findNextChapterId(@Param("storyId") Long storyId, @Param("chapterNumber") Integer chapterNumber);

    @Query("SELECT c.id FROM Chapter c WHERE c.story.id = :storyId ORDER BY c.chapterNumber ASC LIMIT 1")
    Optional<Long> findFirstChapterId(@Param("storyId") Long storyId);

    @Query("SELECT c FROM Chapter c WHERE c.audioFiles IS EMPTY")
    List<Chapter> findChaptersWithoutAudio();

    List<Chapter> findTop5ByOrderByCreatedAtDesc();
}