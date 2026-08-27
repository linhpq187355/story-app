package com.storyapp.storyapp.importing;

import com.storyapp.storyapp.dto.importing.ImportValidationErrorDto;
import com.storyapp.storyapp.service.ImportParserService.RawChapterRow;
import com.storyapp.storyapp.service.ImportParserService.RawStoryRow;
import com.storyapp.storyapp.service.ImportValidationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;

class ImportValidationTest {

    private ImportValidationService validationService;

    @BeforeEach
    void setUp() {
        validationService = new ImportValidationService();
    }

    @Test
    void validateParsedData_shouldDetectDuplicateExternalIdInFile() {
        List<RawStoryRow> stories = List.of(
                new RawStoryRow(2, "TR001", "Truyện A", "Tác giả A", "Mô tả", "cover.jpg", "ONGOING"),
                new RawStoryRow(3, "TR001", "Truyện B", "Tác giả B", "Mô tả", "cover.jpg", "ONGOING")
        );
        List<RawChapterRow> chapters = Collections.emptyList();

        List<ImportValidationErrorDto> errors = validationService.validateParsedData(stories, chapters, Collections.emptySet());

        assertFalse(errors.isEmpty());
        assertTrue(errors.stream().anyMatch(e -> e.getMessage().contains("bị trùng lặp nhiều lần trong file")));
    }

    @Test
    void validateParsedData_shouldDetectDuplicateChapterNumberInSameStory() {
        List<RawStoryRow> stories = List.of(
                new RawStoryRow(2, "TR001", "Truyện A", "Tác giả A", "Mô tả", "cover.jpg", "ONGOING")
        );
        List<RawChapterRow> chapters = List.of(
                new RawChapterRow(2, "TR001", 1, "1", "Chương 1", "Nội dung", "FREE"),
                new RawChapterRow(3, "TR001", 1, "1", "Chương 1 lặp", "Nội dung", "FREE")
        );

        List<ImportValidationErrorDto> errors = validationService.validateParsedData(stories, chapters, Collections.emptySet());

        assertFalse(errors.isEmpty());
        assertTrue(errors.stream().anyMatch(e -> e.getMessage().contains("bị trùng lặp nhiều lần")));
    }

    @Test
    void validateParsedData_shouldDetectMissingReferencedStoryInChapters() {
        List<RawStoryRow> stories = List.of(
                new RawStoryRow(2, "TR001", "Truyện A", "Tác giả A", "Mô tả", "cover.jpg", "ONGOING")
        );
        List<RawChapterRow> chapters = List.of(
                new RawChapterRow(2, "TR999", 1, "1", "Chương 1", "Nội dung", "FREE")
        );

        List<ImportValidationErrorDto> errors = validationService.validateParsedData(stories, chapters, Collections.emptySet());

        assertFalse(errors.isEmpty());
        assertTrue(errors.stream().anyMatch(e -> e.getMessage().contains("không tìm thấy trong file Excel hoặc CSDL")));
    }

    @Test
    void normalizeTitle_shouldTrimLowercaseAndCollapseWhitespace() {
        String input = "  Đấu   Phá Thương  Khung  ";
        String normalized = validationService.normalizeTitle(input);
        assertEquals("đấu phá thương khung", normalized);
    }
}
