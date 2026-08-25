package com.storyapp.storyapp.service.impl;

import com.storyapp.storyapp.dto.response.AudioFileResponse;
import com.storyapp.storyapp.entity.AudioFile;
import com.storyapp.storyapp.entity.Chapter;
import com.storyapp.storyapp.repository.AudioFileRepository;
import com.storyapp.storyapp.repository.ChapterRepository;
import com.storyapp.storyapp.repository.StoryRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ChapterServiceImplTest {

    @Mock
    private StoryRepository storyRepository;

    @Mock
    private ChapterRepository chapterRepository;

    @Mock
    private AudioFileRepository audioFileRepository;

    @InjectMocks
    private ChapterServiceImpl chapterService;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(chapterService, "audioUploadDir", "target/test-uploads/audio");
    }

    @Test
    void uploadAudio_shouldSaveAudioFileAndReturnResponse() {
        Chapter chapter = new Chapter();
        chapter.setId(10L);

        AudioFile savedAudio = new AudioFile();
        savedAudio.setId(1L);
        savedAudio.setChapter(chapter);
        savedAudio.setOriginalFileName("sample.mp3");
        savedAudio.setContentType("audio/mpeg");
        savedAudio.setFileSize(123L);
        savedAudio.setFilePath("/uploads/audio/uuid-sample.mp3");

        when(chapterRepository.findById(10L)).thenReturn(Optional.of(chapter));
        when(audioFileRepository.save(any(AudioFile.class))).thenReturn(savedAudio);

        MockMultipartFile file = new MockMultipartFile(
                "file",
                "sample.mp3",
                "audio/mpeg",
                "hello-audio".getBytes()
        );

        AudioFileResponse response = chapterService.uploadAudio(10L, file);

        assertNotNull(response);
        assertEquals(1L, response.getId());
        assertEquals(10L, response.getChapterId());
        assertEquals("sample.mp3", response.getOriginalFileName());
        assertEquals("audio/mpeg", response.getContentType());
    }
}
