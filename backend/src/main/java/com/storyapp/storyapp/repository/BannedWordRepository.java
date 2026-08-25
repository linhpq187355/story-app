package com.storyapp.storyapp.repository;

import com.storyapp.storyapp.entity.BannedWord;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface BannedWordRepository extends JpaRepository<BannedWord, Long> {

    boolean existsByWordIgnoreCase(String word);

    Optional<BannedWord> findByWordIgnoreCase(String word);

    List<BannedWord> findAllByOrderByCreatedAtDesc();
}
