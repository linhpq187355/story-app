package com.storyapp.storyapp.repository;

import com.storyapp.storyapp.entity.Story;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StoryRepository extends JpaRepository<Story, Long> {
}
