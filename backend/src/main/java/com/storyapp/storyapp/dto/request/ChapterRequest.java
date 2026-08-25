package com.storyapp.storyapp.dto.request;

import com.storyapp.storyapp.enums.AccessLevel;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ChapterRequest {

    @NotBlank(message = "Chapter title is required")
    @Size(max = 255)
    private String title;

    @NotNull(message = "Chapter number is required")
    @Min(value = 1, message = "Chapter number must be greater than 0")
    private Integer chapterNumber;

    @NotBlank(message = "Chapter content is required")
    private String content;

    @NotNull(message = "Access level is required")
    private AccessLevel accessLevel = AccessLevel.PUBLIC;

    private Long coinPrice = 0L;

    private Long version;
}
