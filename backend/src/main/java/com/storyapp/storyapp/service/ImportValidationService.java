package com.storyapp.storyapp.service;

import com.storyapp.storyapp.dto.importing.ImportValidationErrorDto;
import com.storyapp.storyapp.enums.AccessLevel;
import com.storyapp.storyapp.enums.StoryStatus;
import com.storyapp.storyapp.service.ImportParserService.RawChapterRow;
import com.storyapp.storyapp.service.ImportParserService.RawStoryRow;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class ImportValidationService {

    public List<ImportValidationErrorDto> validateParsedData(List<RawStoryRow> stories, List<RawChapterRow> chapters, Set<String> existingDbExternalIds) {
        List<ImportValidationErrorDto> errors = new ArrayList<>();

        // 1. Validate STORIES
        Set<String> fileStoryExternalIds = new HashSet<>();
        for (RawStoryRow s : stories) {
            // external_id validation
            if (s.getExternalId() == null || s.getExternalId().isBlank()) {
                errors.add(new ImportValidationErrorDto("STORY", s.getRowNum(), "external_id", "Mã truyện (external_id) không được để trống."));
            } else if (s.getExternalId().length() > 100) {
                errors.add(new ImportValidationErrorDto("STORY", s.getRowNum(), "external_id", "Mã truyện không được vượt quá 100 ký tự."));
            } else {
                if (!fileStoryExternalIds.add(s.getExternalId())) {
                    errors.add(new ImportValidationErrorDto("STORY", s.getRowNum(), "external_id", "Mã truyện '" + s.getExternalId() + "' bị trùng lặp nhiều lần trong file Excel."));
                }
            }

            // title validation
            if (s.getTitle() == null || s.getTitle().isBlank()) {
                errors.add(new ImportValidationErrorDto("STORY", s.getRowNum(), "title", "Tên truyện (title) không được để trống."));
            } else if (s.getTitle().length() > 255) {
                errors.add(new ImportValidationErrorDto("STORY", s.getRowNum(), "title", "Tên truyện không được vượt quá 255 ký tự."));
            }

            // status validation
            if (s.getStatus() != null && !s.getStatus().isBlank()) {
                try {
                    StoryStatus.valueOf(s.getStatus().trim().toUpperCase());
                } catch (IllegalArgumentException e) {
                    errors.add(new ImportValidationErrorDto("STORY", s.getRowNum(), "status", "Trạng thái truyện '" + s.getStatus() + "' không hợp lệ. Giá trị hợp lệ: ONGOING, COMPLETED."));
                }
            }
        }

        // Combine file external IDs + existing DB external IDs for referential validation
        Set<String> validTargetStoryExternalIds = new HashSet<>(fileStoryExternalIds);
        if (existingDbExternalIds != null) {
            validTargetStoryExternalIds.addAll(existingDbExternalIds);
        }

        // 2. Validate CHAPTERS
        Map<String, Set<Integer>> storyChapterNumbersMap = new HashMap<>();

        for (RawChapterRow c : chapters) {
            // external_story_id validation
            if (c.getExternalStoryId() == null || c.getExternalStoryId().isBlank()) {
                errors.add(new ImportValidationErrorDto("CHAPTERS", c.getRowNum(), "external_story_id", "Mã truyện tham chiếu (external_story_id) không được để trống."));
            } else if (!validTargetStoryExternalIds.contains(c.getExternalStoryId())) {
                errors.add(new ImportValidationErrorDto("CHAPTERS", c.getRowNum(), "external_story_id", "Mã truyện '" + c.getExternalStoryId() + "' không tìm thấy trong file Excel hoặc CSDL."));
            }

            // chapter_number validation
            if (c.getChapterNumber() == null) {
                errors.add(new ImportValidationErrorDto("CHAPTERS", c.getRowNum(), "chapter_number", "Số chương (chapter_number) không hợp lệ hoặc phải là số nguyên > 0. Giá trị đọc được: '" + (c.getChapterNumberRaw() != null ? c.getChapterNumberRaw() : "") + "'."));
            } else if (c.getChapterNumber() <= 0) {
                errors.add(new ImportValidationErrorDto("CHAPTERS", c.getRowNum(), "chapter_number", "Số chương (chapter_number) phải lớn hơn 0."));
            } else if (c.getExternalStoryId() != null && !c.getExternalStoryId().isBlank()) {
                Set<Integer> chaptersOfStory = storyChapterNumbersMap.computeIfAbsent(c.getExternalStoryId(), k -> new HashSet<>());
                if (!chaptersOfStory.add(c.getChapterNumber())) {
                    errors.add(new ImportValidationErrorDto("CHAPTERS", c.getRowNum(), "chapter_number", "Số chương " + c.getChapterNumber() + " cho truyện '" + c.getExternalStoryId() + "' bị trùng lặp nhiều lần trong file Excel."));
                }
            }

            // title validation
            if (c.getTitle() == null || c.getTitle().isBlank()) {
                errors.add(new ImportValidationErrorDto("CHAPTERS", c.getRowNum(), "title", "Tên chương (title) không được để trống."));
            } else if (c.getTitle().length() > 255) {
                errors.add(new ImportValidationErrorDto("CHAPTERS", c.getRowNum(), "title", "Tên chương không được vượt quá 255 ký tự."));
            }

            // content validation
            if (c.getContent() == null || c.getContent().isBlank()) {
                errors.add(new ImportValidationErrorDto("CHAPTERS", c.getRowNum(), "content", "Nội dung chương (content) không được để trống."));
            }

            // access_level validation
            if (c.getAccessLevel() != null && !c.getAccessLevel().isBlank()) {
                String levelStr = c.getAccessLevel().trim().toUpperCase();
                if ("FREE".equals(levelStr)) {
                    // Allow FREE as alias for PUBLIC
                } else {
                    try {
                        AccessLevel.valueOf(levelStr);
                    } catch (IllegalArgumentException e) {
                        errors.add(new ImportValidationErrorDto("CHAPTERS", c.getRowNum(), "access_level", "Mức truy cập '" + c.getAccessLevel() + "' không hợp lệ. Giá trị hợp lệ: FREE, PUBLIC, VIP."));
                    }
                }
            }
        }

        return errors;
    }

    public String normalizeTitle(String title) {
        if (title == null) return "";
        return title.trim().toLowerCase().replaceAll("\\s+", " ");
    }
}
