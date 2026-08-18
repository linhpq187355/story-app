package com.storyapp.storyapp.dto.response;

import com.storyapp.storyapp.enums.AccessLevel;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

/**
 * Chapter info without content, safe to expose on public endpoints.
 */
@Getter
@Builder
public class ChapterSummaryResponse {

    private Long id;

    private Integer chapterNumber;

    private String title;

    private AccessLevel accessLevel;

    private LocalDateTime createdAt;
}
