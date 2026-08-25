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

    private Long genreId;

    private String coverImageUrl;

    private String description;

    private StoryStatus status = StoryStatus.ONGOING;

    private Long coinPrice = 0L;

    private Long version;
}
