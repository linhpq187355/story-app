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
public class ImportCommitResponse {
    private String importId;
    private boolean success;
    private int storiesCreated;
    private int storiesUpdated;
    private int storiesSkipped;
    private int chaptersCreated;
    private int chaptersUpdated;
    private int chaptersSkipped;
    private List<ImportValidationErrorDto> errors;
}
