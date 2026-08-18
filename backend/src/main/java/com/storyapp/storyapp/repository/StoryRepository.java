package com.storyapp.storyapp.repository;

import com.storyapp.storyapp.entity.Story;
import com.storyapp.storyapp.enums.StoryStatus;

import com.storyapp.storyapp.repository.projection.LatestChapterProjection;
import com.storyapp.storyapp.repository.projection.StoryWithLatestChapterProjection;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface StoryRepository extends JpaRepository<Story, Long> {

    @EntityGraph(attributePaths = {"author", "genre"})
    @Query("""
    SELECT s
    FROM Story s
    WHERE
    (:keyword = '' OR LOWER(s.title) LIKE LOWER(CONCAT('%', :keyword, '%')))
    AND (:genreId IS NULL OR s.genre.id = :genreId)
    AND (:authorId IS NULL OR s.author.id = :authorId)
    AND (:status IS NULL OR s.status = :status)
    """)
    Page<Story> searchStories(
        @Param("keyword") String keyword,
        @Param("genreId") Long genreId,
        @Param("authorId") Long authorId,
        @Param("status") StoryStatus status,
        Pageable pageable
    );

    @EntityGraph(attributePaths = {"author", "genre"})
    @Query("""
    SELECT s
    FROM Story s
    ORDER BY (COALESCE(s.viewsLast7Days, 0) * 3 + COALESCE(s.favoritesLast7Days, 0) * 5) DESC,
             s.updatedAt DESC
    """)
    Page<Story> findHotStories(Pageable pageable);

    @EntityGraph(attributePaths = {"author", "genre"})
    @Query("""
    SELECT s
    FROM Story s
    LEFT JOIN s.chapters c
    GROUP BY s
    ORDER BY COALESCE(MAX(c.createdAt), s.createdAt) DESC
    """)
    Page<Story> findUpdatingStories(Pageable pageable);

    @Query(value = """
    SELECT
        s.id AS id,
        s.title AS title,
        s.cover_image AS coverImageUrl,
        s.description AS description,
        s.status AS status,
        a.name AS authorName,
        g.name AS genreName,

        c.id AS latestChapterId,
        c.chapter_number AS latestChapterNumber,
        c.title AS latestChapterTitle,
        c.created_at AS latestActivityAt

    FROM stories s

    INNER JOIN authors a
        ON a.id = s.author_id

    INNER JOIN genres g
        ON g.id = s.genre_id

    INNER JOIN chapters c
        ON c.id = (
            SELECT c2.id
            FROM chapters c2
            WHERE c2.story_id = s.id
            ORDER BY c2.created_at DESC, c2.id DESC
            LIMIT 1
        )

    ORDER BY
        COALESCE(c.created_at, s.created_at) DESC,
        s.id DESC

    LIMIT :limit
    """,
            nativeQuery = true)
    List<StoryWithLatestChapterProjection> findUpdatingStoriesWithLatestChapter(
            @Param("limit") int limit
    );
}
