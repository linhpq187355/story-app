package com.storyapp.storyapp.dto.response;

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
public class AttentionItemResponse {
    private String type;
    private String message;
    private String targetUrl;
    private long count;
    private String severity;
}
