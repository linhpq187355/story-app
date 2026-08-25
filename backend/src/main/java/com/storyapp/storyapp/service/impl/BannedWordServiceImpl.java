package com.storyapp.storyapp.service.impl;

import com.storyapp.storyapp.dto.request.BannedWordRequest;
import com.storyapp.storyapp.dto.response.BannedWordResponse;
import com.storyapp.storyapp.entity.BannedWord;
import com.storyapp.storyapp.exception.BadRequestException;
import com.storyapp.storyapp.exception.ResourceNotFoundException;
import com.storyapp.storyapp.repository.BannedWordRepository;
import com.storyapp.storyapp.service.BannedWordService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
@Transactional
public class BannedWordServiceImpl implements BannedWordService {

    private final BannedWordRepository bannedWordRepository;

    @Override
    public BannedWordResponse addBannedWord(BannedWordRequest request) {
        String cleanWord = request.getWord().trim().toLowerCase();
        if (bannedWordRepository.existsByWordIgnoreCase(cleanWord)) {
            throw new BadRequestException("Banned word '" + cleanWord + "' already exists.");
        }

        BannedWord bannedWord = new BannedWord();
        bannedWord.setWord(cleanWord);
        BannedWord saved = bannedWordRepository.save(bannedWord);

        return toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<BannedWordResponse> getAllBannedWords() {
        return bannedWordRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public void deleteBannedWord(Long id) {
        if (!bannedWordRepository.existsById(id)) {
            throw new ResourceNotFoundException("BannedWord", "id", id);
        }
        bannedWordRepository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public String filterText(String input) {
        if (input == null || input.isBlank()) {
            return input;
        }

        List<BannedWord> bannedWords = bannedWordRepository.findAll();
        if (bannedWords.isEmpty()) {
            return input;
        }

        String filtered = input;
        for (BannedWord bw : bannedWords) {
            String word = bw.getWord().trim();
            if (word.isEmpty()) continue;

            String mask = "*".repeat(word.length());
            String regex = "(?i)" + Pattern.quote(word);
            filtered = filtered.replaceAll(regex, mask);
        }

        return filtered;
    }

    private BannedWordResponse toResponse(BannedWord bannedWord) {
        return BannedWordResponse.builder()
                .id(bannedWord.getId())
                .word(bannedWord.getWord())
                .createdAt(bannedWord.getCreatedAt())
                .build();
    }
}
