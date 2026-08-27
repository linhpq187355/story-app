package com.storyapp.storyapp.service;

import com.storyapp.storyapp.dto.importing.*;
import com.storyapp.storyapp.entity.Chapter;
import com.storyapp.storyapp.entity.Story;
import com.storyapp.storyapp.repository.ChapterRepository;
import com.storyapp.storyapp.repository.StoryRepository;
import com.storyapp.storyapp.service.ImportParserService.RawChapterRow;
import com.storyapp.storyapp.service.ImportParserService.RawStoryRow;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ImportConflictService {

    private final StoryRepository storyRepository;
    private final ChapterRepository chapterRepository;
    private final ImportValidationService validationService;

    public ImportPreviewResponse generatePreview(String importId, List<RawStoryRow> rawStories, List<RawChapterRow> rawChapters, List<ImportValidationErrorDto> validationErrors) {
        // Collect external IDs to batch query database
        Set<String> externalIds = new HashSet<>();
        for (RawStoryRow s : rawStories) {
            if (s.getExternalId() != null && !s.getExternalId().isBlank()) {
                externalIds.add(s.getExternalId());
            }
        }
        for (RawChapterRow c : rawChapters) {
            if (c.getExternalStoryId() != null && !c.getExternalStoryId().isBlank()) {
                externalIds.add(c.getExternalStoryId());
            }
        }

        // Query existing stories by external_id in batch
        List<Story> dbStoriesByExtId = storyRepository.findByExternalIdIn(externalIds);
        Map<String, Story> storyMapByExtId = new HashMap<>();
        for (Story s : dbStoriesByExtId) {
            if (s.getExternalId() != null) {
                storyMapByExtId.put(s.getExternalId(), s);
            }
        }

        // Query all active stories in DB to build normalized title map for duplicate title warning detection
        List<Story> allActiveDbStories = storyRepository.findByIsDeletedFalse();
        Map<String, Story> storyMapByNormalizedTitle = new HashMap<>();
        for (Story s : allActiveDbStories) {
            String normTitle = validationService.normalizeTitle(s.getTitle());
            if (!normTitle.isEmpty() && !storyMapByNormalizedTitle.containsKey(normTitle)) {
                storyMapByNormalizedTitle.put(normTitle, s);
            }
        }

        // 1. Process Story Previews & Conflict Detection
        List<StoryImportPreviewDto> storyPreviews = new ArrayList<>();
        Map<String, Long> resolvedStoryIdMap = new HashMap<>();

        int newStoriesCount = 0;
        int existingStoriesCount = 0;
        int possibleDuplicateStoriesCount = 0;

        for (RawStoryRow s : rawStories) {
            String status = "NEW";
            Long existingId = null;
            String warning = null;

            if (storyMapByExtId.containsKey(s.getExternalId())) {
                // Priority 1: Match by external_id -> EXISTING
                status = "EXISTING";
                Story existing = storyMapByExtId.get(s.getExternalId());
                existingId = existing.getId();
                resolvedStoryIdMap.put(s.getExternalId(), existingId);
                existingStoriesCount++;
            } else {
                // Priority 2: Check normalized title -> POSSIBLE_DUPLICATE
                String normTitle = validationService.normalizeTitle(s.getTitle());
                if (storyMapByNormalizedTitle.containsKey(normTitle)) {
                    Story matchedByTitle = storyMapByNormalizedTitle.get(normTitle);
                    status = "POSSIBLE_DUPLICATE";
                    existingId = matchedByTitle.getId();
                    warning = "Phát hiện truyện '" + matchedByTitle.getTitle() + "' (ID " + matchedByTitle.getId() + ") có cùng tên trong CSDL. Cần Admin kiểm tra.";
                    possibleDuplicateStoriesCount++;
                } else {
                    newStoriesCount++;
                }
            }

            storyPreviews.add(StoryImportPreviewDto.builder()
                    .externalId(s.getExternalId())
                    .title(s.getTitle())
                    .author(s.getAuthor())
                    .genre(s.getGenre())
                    .description(s.getDescription())
                    .coverUrl(s.getCoverUrl())
                    .status(status)
                    .existingStoryId(existingId)
                    .warningMessage(warning)
                    .build());
        }

        // Add any stories that are referenced in CHAPTERS sheet but were already in DB (not in STORY sheet)
        for (String extId : externalIds) {
            if (!resolvedStoryIdMap.containsKey(extId) && storyMapByExtId.containsKey(extId)) {
                Story existing = storyMapByExtId.get(extId);
                resolvedStoryIdMap.put(extId, existing.getId());
            }
        }

        // 2. Query Existing Chapters for matched stories in batch
        Set<Long> targetStoryIds = new HashSet<>(resolvedStoryIdMap.values());
        Map<String, Set<Integer>> existingDbChapterNumbersMap = new HashMap<>(); // key: storyId or externalId -> set of chapter numbers

        if (!targetStoryIds.isEmpty()) {
            List<Chapter> existingDbChapters = chapterRepository.findByStoryIdIn(targetStoryIds);
            for (Chapter c : existingDbChapters) {
                if (c.getStory() != null) {
                    Long sId = c.getStory().getId();
                    String extId = c.getStory().getExternalId();
                    
                    if (sId != null) {
                        existingDbChapterNumbersMap.computeIfAbsent(String.valueOf(sId), k -> new HashSet<>()).add(c.getChapterNumber());
                    }
                    if (extId != null) {
                        existingDbChapterNumbersMap.computeIfAbsent(extId, k -> new HashSet<>()).add(c.getChapterNumber());
                    }
                }
            }
        }

        // 3. Process Chapter Previews & Conflict Detection
        List<ChapterImportPreviewDto> chapterPreviews = new ArrayList<>();
        int newChaptersCount = 0;
        int existingChaptersCount = 0;

        for (RawChapterRow c : rawChapters) {
            String status = "NEW";
            String extStoryId = c.getExternalStoryId();
            Integer chNum = c.getChapterNumber();

            if (extStoryId != null && chNum != null) {
                Set<Integer> existingNums = existingDbChapterNumbersMap.get(extStoryId);
                if (existingNums == null && resolvedStoryIdMap.containsKey(extStoryId)) {
                    Long sId = resolvedStoryIdMap.get(extStoryId);
                    existingNums = existingDbChapterNumbersMap.get(String.valueOf(sId));
                }

                if (existingNums != null && existingNums.contains(chNum)) {
                    status = "EXISTING";
                    existingChaptersCount++;
                } else {
                    newChaptersCount++;
                }
            } else {
                newChaptersCount++;
            }

            String contentSnippet = c.getContent();
            if (contentSnippet != null && contentSnippet.length() > 100) {
                contentSnippet = contentSnippet.substring(0, 100) + "...";
            }

            String accessLevel = c.getAccessLevel();
            if (accessLevel != null && "FREE".equalsIgnoreCase(accessLevel.trim())) {
                accessLevel = "PUBLIC";
            } else if (accessLevel == null || accessLevel.isBlank()) {
                accessLevel = "PUBLIC";
            }

            chapterPreviews.add(ChapterImportPreviewDto.builder()
                    .externalStoryId(c.getExternalStoryId())
                    .chapterNumber(c.getChapterNumber())
                    .title(c.getTitle())
                    .accessLevel(accessLevel != null ? accessLevel.toUpperCase() : "PUBLIC")
                    .status(status)
                    .contentSnippet(contentSnippet)
                    .build());
        }

        boolean isValid = validationErrors.isEmpty();
        ImportSummaryDto summary = ImportSummaryDto.builder()
                .newStories(newStoriesCount)
                .existingStories(existingStoriesCount)
                .possibleDuplicateStories(possibleDuplicateStoriesCount)
                .newChapters(newChaptersCount)
                .existingChapters(existingChaptersCount)
                .errors(validationErrors.size())
                .build();

        return ImportPreviewResponse.builder()
                .importId(importId)
                .valid(isValid)
                .summary(summary)
                .stories(storyPreviews)
                .chapters(chapterPreviews)
                .errors(validationErrors)
                .build();
    }
}
