package com.storyapp.storyapp.service;

import com.storyapp.storyapp.dto.request.ChapterRequest;
import com.storyapp.storyapp.dto.response.AudioFileResponse;
import com.storyapp.storyapp.dto.response.ChapterResponse;
import com.storyapp.storyapp.dto.response.ChapterSummaryResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

public interface ChapterService {

    ChapterResponse create(Long storyId, ChapterRequest request);

    List<ChapterResponse> getByStory(Long storyId);

    List<ChapterSummaryResponse> getChapterSummaries(Long storyId);

    Page<ChapterSummaryResponse> getChapterSummaries(Long storyId, Pageable pageable);

    ChapterResponse getById(Long storyId, Long chapterId);

    ChapterResponse update(Long storyId, Long chapterId, ChapterRequest request);

    void delete(Long storyId, Long chapterId);

    AudioFileResponse uploadAudio(Long chapterId, MultipartFile file);

    List<AudioFileResponse> getAudioFiles(Long chapterId);

    ChapterResponse getPublicChapter(Long storyId, Long chapterId);

    Map<String, Boolean> recordView(Long chapterId);

    AudioFileResponse synthesizeAndSaveAudio(Long storyId, Long chapterId);

    com.storyapp.storyapp.dto.response.ChapterAudioResponse synthesizeAndSaveAudio(Long storyId, Long chapterId, com.storyapp.storyapp.enums.VoiceGender voiceGender);
}