package com.storyapp.storyapp.repository;

import com.storyapp.storyapp.entity.Chapter;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ChapterRepository extends JpaRepository<Chapter, Long> {

    List<Chapter> findByStoryIdOrderByChapterNumberAsc(Long storyId);

    Optional<Chapter> findByStoryIdAndId(Long storyId, Long id);

    boolean existsByStoryIdAndChapterNumber(Long storyId, Integer chapterNumber);
}
