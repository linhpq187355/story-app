package com.storyapp.storyapp.service;

import com.storyapp.storyapp.dto.importing.ImportValidationErrorDto;

import com.storyapp.storyapp.exception.BadRequestException;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.util.*;

@Service
public class ImportParserService {

    @Getter
    @Setter
    @AllArgsConstructor
    public static class RawStoryRow {
        private int rowNum;
        private String externalId;
        private String title;
        private String author;
        private String description;
        private String coverUrl;
        private String status;
    }

    @Getter
    @Setter
    @AllArgsConstructor
    public static class RawChapterRow {
        private int rowNum;
        private String externalStoryId;
        private Integer chapterNumber;
        private String chapterNumberRaw;
        private String title;
        private String content;
        private String accessLevel;
    }

    @Getter
    @AllArgsConstructor
    public static class ParseResult {
        private List<RawStoryRow> stories;
        private List<RawChapterRow> chapters;
        private List<ImportValidationErrorDto> errors;
    }

    public ParseResult parseWorkbook(MultipartFile file) {
        List<ImportValidationErrorDto> errors = new ArrayList<>();
        List<RawStoryRow> stories = new ArrayList<>();
        List<RawChapterRow> chapters = new ArrayList<>();

        if (file == null || file.isEmpty()) {
            throw new BadRequestException("File import không được để trống.");
        }

        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || !originalFilename.toLowerCase().endsWith(".xlsx")) {
            throw new BadRequestException("Chỉ chấp nhận file Excel định dạng .xlsx.");
        }

        if (file.getSize() > 10 * 1024 * 1024) { // 10MB limit
            throw new BadRequestException("Kích thước file vượt quá giới hạn cho phép (tối đa 10MB).");
        }

        try (InputStream is = file.getInputStream(); Workbook workbook = new XSSFWorkbook(is)) {
            Sheet storySheet = workbook.getSheet("STORY");
            Sheet chapterSheet = workbook.getSheet("CHAPTERS");

            if (storySheet == null) {
                errors.add(new ImportValidationErrorDto("FILE", 0, "Sheet", "Thiếu Sheet bắt buộc tên 'STORY' trong file Excel."));
            }
            if (chapterSheet == null) {
                errors.add(new ImportValidationErrorDto("FILE", 0, "Sheet", "Thiếu Sheet bắt buộc tên 'CHAPTERS' trong file Excel."));
            }

            if (!errors.isEmpty()) {
                return new ParseResult(stories, chapters, errors);
            }

            // Parse STORY sheet
            parseStorySheet(storySheet, stories, errors);

            // Parse CHAPTERS sheet
            parseChapterSheet(chapterSheet, chapters, errors);

        } catch (BadRequestException e) {
            throw e;
        } catch (Exception e) {
            throw new BadRequestException("Không thể đọc file Excel. File có thể bị hỏng hoặc sai định dạng: " + e.getMessage());
        }

        return new ParseResult(stories, chapters, errors);
    }

    private void parseStorySheet(Sheet sheet, List<RawStoryRow> stories, List<ImportValidationErrorDto> errors) {
        Row headerRow = sheet.getRow(0);
        if (headerRow == null) {
            errors.add(new ImportValidationErrorDto("STORY", 1, "Header", "Sheet STORY không có dòng tiêu đề."));
            return;
        }

        Map<String, Integer> colMap = getHeaderMap(headerRow);
        String[] requiredCols = {"external_id", "title"};
        for (String col : requiredCols) {
            if (!colMap.containsKey(col)) {
                errors.add(new ImportValidationErrorDto("STORY", 1, col, "Sheet STORY thiếu cột bắt buộc: '" + col + "'."));
            }
        }
        if (!errors.isEmpty()) return;

        int lastRowNum = sheet.getLastRowNum();
        for (int r = 1; r <= lastRowNum; r++) {
            Row row = sheet.getRow(r);
            if (isRowEmpty(row)) continue;

            int rowNum = r + 1; // 1-based index
            String externalId = getCellValueAsString(row.getCell(colMap.get("external_id")));
            String title = getCellValueAsString(row.getCell(colMap.get("title")));
            String author = getCellValueAsString(colMap.containsKey("author") ? row.getCell(colMap.get("author")) : null);
            String description = getCellValueAsString(colMap.containsKey("description") ? row.getCell(colMap.get("description")) : null);
            String coverUrl = getCellValueAsString(colMap.containsKey("cover_url") ? row.getCell(colMap.get("cover_url")) : null);
            String status = getCellValueAsString(colMap.containsKey("status") ? row.getCell(colMap.get("status")) : null);

            stories.add(new RawStoryRow(rowNum, externalId, title, author, description, coverUrl, status));
        }
    }

    private void parseChapterSheet(Sheet sheet, List<RawChapterRow> chapters, List<ImportValidationErrorDto> errors) {
        Row headerRow = sheet.getRow(0);
        if (headerRow == null) {
            errors.add(new ImportValidationErrorDto("CHAPTERS", 1, "Header", "Sheet CHAPTERS không có dòng tiêu đề."));
            return;
        }

        Map<String, Integer> colMap = getHeaderMap(headerRow);
        String[] requiredCols = {"external_story_id", "chapter_number", "title", "content"};
        for (String col : requiredCols) {
            if (!colMap.containsKey(col)) {
                errors.add(new ImportValidationErrorDto("CHAPTERS", 1, col, "Sheet CHAPTERS thiếu cột bắt buộc: '" + col + "'."));
            }
        }
        if (!errors.isEmpty()) return;

        int lastRowNum = sheet.getLastRowNum();
        for (int r = 1; r <= lastRowNum; r++) {
            Row row = sheet.getRow(r);
            if (isRowEmpty(row)) continue;

            int rowNum = r + 1; // 1-based index
            String externalStoryId = getCellValueAsString(row.getCell(colMap.get("external_story_id")));
            Cell chapterNumCell = row.getCell(colMap.get("chapter_number"));
            String chapterNumberRaw = getCellValueAsString(chapterNumCell);
            Integer chapterNumber = getCellValueAsInteger(chapterNumCell);

            String title = getCellValueAsString(row.getCell(colMap.get("title")));
            String content = getCellValueAsString(row.getCell(colMap.get("content")));
            String accessLevel = getCellValueAsString(colMap.containsKey("access_level") ? row.getCell(colMap.get("access_level")) : null);

            chapters.add(new RawChapterRow(rowNum, externalStoryId, chapterNumber, chapterNumberRaw, title, content, accessLevel));
        }
    }

    private Map<String, Integer> getHeaderMap(Row headerRow) {
        Map<String, Integer> map = new HashMap<>();
        for (Cell cell : headerRow) {
            String val = getCellValueAsString(cell).trim().toLowerCase();
            if (!val.isEmpty()) {
                map.put(val, cell.getColumnIndex());
            }
        }
        return map;
    }

    private String getCellValueAsString(Cell cell) {
        if (cell == null) return "";
        CellType type = cell.getCellType();
        if (type == CellType.FORMULA) {
            type = cell.getCachedFormulaResultType();
        }
        return switch (type) {
            case STRING -> cell.getStringCellValue() != null ? cell.getStringCellValue().trim() : "";
            case NUMERIC -> {
                double val = cell.getNumericCellValue();
                if (val == Math.floor(val)) {
                    yield String.valueOf((long) val);
                }
                yield String.valueOf(val);
            }
            case BOOLEAN -> String.valueOf(cell.getBooleanCellValue());
            default -> "";
        };
    }

    private Integer getCellValueAsInteger(Cell cell) {
        if (cell == null) return null;
        CellType type = cell.getCellType();
        if (type == CellType.FORMULA) {
            type = cell.getCachedFormulaResultType();
        }
        if (type == CellType.NUMERIC) {
            return (int) cell.getNumericCellValue();
        } else if (type == CellType.STRING) {
            try {
                return Integer.parseInt(cell.getStringCellValue().trim());
            } catch (NumberFormatException e) {
                return null;
            }
        }
        return null;
    }

    private boolean isRowEmpty(Row row) {
        if (row == null) return true;
        for (int c = row.getFirstCellNum(); c < row.getLastCellNum(); c++) {
            Cell cell = row.getCell(c);
            if (cell != null && cell.getCellType() != CellType.BLANK && !getCellValueAsString(cell).trim().isEmpty()) {
                return false;
            }
        }
        return true;
    }
}
