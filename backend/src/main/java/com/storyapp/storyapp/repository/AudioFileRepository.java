package com.storyapp.storyapp.repository;

import com.storyapp.storyapp.entity.AudioFile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AudioFileRepository extends JpaRepository<AudioFile, Long> {

    List<AudioFile> findByChapterIdOrderByCreatedAtDesc(Long chapterId);
}
