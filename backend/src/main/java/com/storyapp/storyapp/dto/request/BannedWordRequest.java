package com.storyapp.storyapp.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class BannedWordRequest {

    @NotBlank(message = "Banned word cannot be blank")
    @Size(max = 100, message = "Banned word length cannot exceed 100 characters")
    private String word;
}
