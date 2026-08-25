package com.storyapp.storyapp.controller.admin;

import com.storyapp.storyapp.dto.request.BannedWordRequest;
import com.storyapp.storyapp.dto.response.BannedWordResponse;
import com.storyapp.storyapp.service.BannedWordService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/banned-words")
@RequiredArgsConstructor
public class AdminBannedWordController {

    private final BannedWordService bannedWordService;

    @GetMapping
    public ResponseEntity<List<BannedWordResponse>> getAllBannedWords() {
        return ResponseEntity.ok(bannedWordService.getAllBannedWords());
    }

    @PostMapping
    public ResponseEntity<BannedWordResponse> addBannedWord(@Valid @RequestBody BannedWordRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(bannedWordService.addBannedWord(request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBannedWord(@PathVariable Long id) {
        bannedWordService.deleteBannedWord(id);
        return ResponseEntity.noContent().build();
    }
}
