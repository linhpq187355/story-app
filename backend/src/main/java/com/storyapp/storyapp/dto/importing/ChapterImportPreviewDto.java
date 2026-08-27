package com.storyapp.storyapp.dto.importing;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChapterImportPreviewDto {
    private String externalStoryId;
    private Integer chapterNumber;
    private String title;
    private String accessLevel;
    private String status; // NEW, EXISTING
    private String contentSnippet;
}
