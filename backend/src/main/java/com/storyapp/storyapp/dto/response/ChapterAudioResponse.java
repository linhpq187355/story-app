package com.storyapp.storyapp.dto.response;

import com.storyapp.storyapp.enums.VoiceGender;
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
public class ChapterAudioResponse {
    private Long id;
    private Long chapterId;
    private VoiceGender voiceGender;
    private String voiceName;
    private String filePath;
}
