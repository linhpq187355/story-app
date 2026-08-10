package com.storyapp.storyapp.dto.request;

import com.storyapp.storyapp.enums.StoryStatus;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class StoryRequest {

    @NotBlank(message = "Story title is required")
    @Size(max = 255)
    private String title;

    private Long authorId;

    @Size(max = 100)
    private String authorName;

    private Long genreId;

    @Size(max = 100)
    private String genreName;

    private String coverImageUrl;

    private String description;

    private StoryStatus status = StoryStatus.ONGOING;

    @AssertTrue(message = "authorId or authorName is required")
    public boolean isAuthorProvided() {
        return authorId != null || hasText(authorName);
    }

    @AssertTrue(message = "genreId or genreName is required")
    public boolean isGenreProvided() {
        return genreId != null || hasText(genreName);
    }

    private boolean hasText(String value) {
        return value != null && !value.trim().isEmpty();
    }
}
