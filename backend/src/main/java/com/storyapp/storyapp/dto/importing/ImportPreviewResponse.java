package com.storyapp.storyapp.dto.importing;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ImportPreviewResponse {
    private String importId;
    private boolean valid;
    private ImportSummaryDto summary;
    private List<StoryImportPreviewDto> stories;
    private List<ChapterImportPreviewDto> chapters;
    private List<ImportValidationErrorDto> errors;
}
