package com.storyapp.storyapp.repository;

import com.storyapp.storyapp.entity.StoryComment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StoryCommentRepository extends JpaRepository<StoryComment, Long> {

    @EntityGraph(attributePaths = {"user", "replies", "replies.user"})
    Page<StoryComment> findByStoryIdAndParentCommentIsNullOrderByCreatedAtDesc(Long storyId, Pageable pageable);

    long countByStoryId(Long storyId);
}
