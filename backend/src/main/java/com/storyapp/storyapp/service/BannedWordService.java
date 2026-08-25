package com.storyapp.storyapp.service;

import com.storyapp.storyapp.dto.request.BannedWordRequest;
import com.storyapp.storyapp.dto.response.BannedWordResponse;

import java.util.List;

public interface BannedWordService {

    BannedWordResponse addBannedWord(BannedWordRequest request);

    List<BannedWordResponse> getAllBannedWords();

    void deleteBannedWord(Long id);

    String filterText(String input);
}
