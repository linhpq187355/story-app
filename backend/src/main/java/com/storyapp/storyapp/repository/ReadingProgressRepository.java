package com.storyapp.storyapp.repository;

import com.storyapp.storyapp.entity.ReadingProgress;
import com.storyapp.storyapp.repository.projection.RecentlyReadProjection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ReadingProgressRepository
        extends JpaRepository<ReadingProgress, Long> {

    Optional<ReadingProgress> findByUserIdAndChapterId(
            Long userId,
            Long chapterId
    );

    /**
     * Lấy các chapter mà user đã đọc trong một story,
     * chapter được đọc gần nhất nằm đầu tiên.
     */
    @Query("""
        SELECT rp
        FROM ReadingProgress rp
        JOIN FETCH rp.chapter c
        WHERE rp.user.id = :userId
          AND c.story.id = :storyId
        ORDER BY rp.updatedAt DESC
    """)
    List<ReadingProgress> findByUserIdAndStoryIdOrderByUpdatedAtDesc(
            @Param("userId") Long userId,
            @Param("storyId") Long storyId
    );

    /**
     * Lấy toàn bộ reading progress của user,
     * dùng cho Recently Read.
     */
    @Query("""
        SELECT rp
        FROM ReadingProgress rp
        JOIN FETCH rp.chapter c
        JOIN FETCH c.story s
        JOIN FETCH s.author a
        JOIN FETCH s.genre g
        WHERE rp.user.id = :userId
        ORDER BY rp.updatedAt DESC
    """)
    List<ReadingProgress> findByUserIdOrderByUpdatedAtDesc(
            @Param("userId") Long userId
    );

    @Query(value = """
    SELECT 
        s.id AS id,
        s.title AS title,
        s.cover_image AS coverImage,
        s.cover_image AS cover_image,
        s.description AS description,
        s.status AS status,
        a.name AS authorName,
        a.name AS author_name,
        g.name AS genreName,
        g.name AS genre_name
    FROM reading_progress rp
    JOIN chapters c ON c.id = rp.chapter_id
    JOIN stories s ON s.id = c.story_id
    JOIN authors a ON a.id = s.author_id
    JOIN genres g ON g.id = s.genre_id
    WHERE rp.user_id = :userId
      AND s.is_deleted = false
      AND rp.id = (
          SELECT rp2.id
          FROM reading_progress rp2
          JOIN chapters c2 ON c2.id = rp2.chapter_id
          WHERE rp2.user_id = :userId
            AND c2.story_id = c.story_id
          ORDER BY rp2.updated_at DESC
          LIMIT 1
      )
    ORDER BY rp.updated_at DESC
    LIMIT 5
    """, nativeQuery = true)
    List<RecentlyReadProjection> findRecentlyReadStories(
            @Param("userId") Long userId
    );
}