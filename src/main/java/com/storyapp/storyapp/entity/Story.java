package com.storyapp.storyapp.entity;

import com.storyapp.storyapp.entity.base.BaseEntity;
import com.storyapp.storyapp.enums.StoryStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "stories")
public class Story extends BaseEntity {

    @Column(nullable = false, length = 255)
    private String title;

    @Column(name = "cover_image")
    private String coverImageUrl;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StoryStatus status = StoryStatus.ONGOING;

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
