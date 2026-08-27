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
public class ImportSummaryDto {
    private int newStories;
    private int existingStories;
    private int possibleDuplicateStories;
    private int newChapters;
    private int existingChapters;
    private int errors;
}
