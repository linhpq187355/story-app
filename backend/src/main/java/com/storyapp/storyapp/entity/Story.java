package com.storyapp.storyapp.entity;

import com.storyapp.storyapp.entity.base.BaseEntity;
import com.storyapp.storyapp.enums.StoryStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "stories")
@SQLDelete(sql = "UPDATE stories SET is_deleted = true WHERE id = ?")
@SQLRestriction("is_deleted = false")
public class Story extends BaseEntity {

    @Column(name = "external_id", unique = true, length = 100)
    private String externalId;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(name = "cover_image")
    private String coverImageUrl;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "view_count", nullable = false, columnDefinition = "BIGINT DEFAULT 0")
    private Long viewCount = 0L;

    @Column(name = "views_last_7_days", nullable = false, columnDefinition = "BIGINT DEFAULT 0")
    private Long viewsLast7Days = 0L;

    @Column(name = "favorites_last_7_days", nullable = false, columnDefinition = "BIGINT DEFAULT 0")
    private Long favoritesLast7Days = 0L;

    @Column(name = "is_deleted", nullable = false)
    private Boolean isDeleted = false;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StoryStatus status = StoryStatus.ONGOING;

    @Column(name = "coin_price", nullable = false, columnDefinition = "BIGINT DEFAULT 0")
    private Long coinPrice = 0L;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "genre_id", nullable = false)
    private Genre genre;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_id", nullable = false)
    private Author author;

    @OneToMany(mappedBy = "story", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("chapterNumber ASC")
    private List<Chapter> chapters = new ArrayList<>();
}
