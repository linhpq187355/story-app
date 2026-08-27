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
public class StoryImportPreviewDto {
    private String externalId;
    private String title;
    private String author;
    private String description;
    private String coverUrl;
    private String status; // NEW, EXISTING, POSSIBLE_DUPLICATE
    private Long existingStoryId;
    private String warningMessage;
}
