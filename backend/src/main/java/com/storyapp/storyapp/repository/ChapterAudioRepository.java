package com.storyapp.storyapp.repository;

import com.storyapp.storyapp.entity.ChapterAudio;
import com.storyapp.storyapp.enums.VoiceGender;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChapterAudioRepository extends JpaRepository<ChapterAudio, Long> {

    Optional<ChapterAudio> findByChapterIdAndVoiceGender(Long chapterId, VoiceGender voiceGender);

    List<ChapterAudio> findByChapterId(Long chapterId);
}
