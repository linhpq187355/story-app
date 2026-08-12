package com.storyapp.storyapp.service;

import com.storyapp.storyapp.dto.request.ChapterRequest;
import com.storyapp.storyapp.dto.response.AudioFileResponse;
import com.storyapp.storyapp.dto.response.ChapterResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface ChapterService {

    ChapterResponse create(Long storyId, ChapterRequest request);

    List<ChapterResponse> getByStory(Long storyId);

    ChapterResponse getById(Long storyId, Long chapterId);

    ChapterResponse update(Long storyId, Long chapterId, ChapterRequest request);

    void delete(Long storyId, Long chapterId);

    AudioFileResponse uploadAudio(Long chapterId, MultipartFile file);

    List<AudioFileResponse> getAudioFiles(Long chapterId);

    ChapterResponse getPublicChapter(Long storyId, Long chapterId);
}
