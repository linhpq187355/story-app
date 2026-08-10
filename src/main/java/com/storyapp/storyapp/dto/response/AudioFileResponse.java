package com.storyapp.storyapp.dto.response;

import com.storyapp.storyapp.enums.AudioSource;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class AudioFileResponse {

    private Long id;

    private Long chapterId;

    private String filePath;

    private String originalFileName;

    private String contentType;

    private Long fileSize;

    private Integer duration;

    private AudioSource source;

    private LocalDateTime createdAt;
}
