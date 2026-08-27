package com.storyapp.storyapp.dto.importing;

import jakarta.validation.constraints.NotBlank;
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
public class ImportCommitRequest {

    @NotBlank(message = "Import ID is required")
    private String importId;

    @Builder.Default
    private String storyPolicy = "KEEP"; // KEEP or UPDATE

    @Builder.Default
    private String chapterPolicy = "SKIP"; // SKIP or UPDATE
}
