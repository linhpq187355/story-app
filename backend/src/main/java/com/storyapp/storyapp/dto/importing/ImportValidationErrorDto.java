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
public class ImportValidationErrorDto {
    private String sheet;
    private int row;
    private String column;
    private String message;
}
