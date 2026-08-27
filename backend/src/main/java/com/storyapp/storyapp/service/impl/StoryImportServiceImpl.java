package com.storyapp.storyapp.service.impl;

import com.storyapp.storyapp.dto.importing.*;
import com.storyapp.storyapp.entity.Story;
import com.storyapp.storyapp.exception.BadRequestException;
import com.storyapp.storyapp.repository.StoryRepository;
import com.storyapp.storyapp.service.*;
import com.storyapp.storyapp.service.ImportParserService.ParseResult;
import com.storyapp.storyapp.service.ImportParserService.RawChapterRow;
import com.storyapp.storyapp.service.ImportParserService.RawStoryRow;
import com.storyapp.storyapp.service.ImportSessionService.ImportSession;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class StoryImportServiceImpl implements StoryImportService {

    private final ExcelTemplateService templateService;
    private final ImportParserService parserService;
    private final ImportValidationService validationService;
    private final ImportConflictService conflictService;
    private final ImportSessionService sessionService;
    private final ImportCommitService commitService;
    private final StoryRepository storyRepository;

    @Override
    public byte[] downloadTemplate() throws IOException {
        return templateService.generateTemplate();
    }

    @Override
    public ImportPreviewResponse previewImport(MultipartFile file) {
        // 1. Parse Excel file
        ParseResult parseResult = parserService.parseWorkbook(file);
        List<ImportValidationErrorDto> parseErrors = parseResult.getErrors();

        if (!parseErrors.isEmpty()) {
            // Return early if file structure is invalid
            String importId = UUID.randomUUID().toString();
            return ImportPreviewResponse.builder()
                    .importId(importId)
                    .valid(false)
                    .summary(ImportSummaryDto.builder().errors(parseErrors.size()).build())
                    .stories(Collections.emptyList())
                    .chapters(Collections.emptyList())
                    .errors(parseErrors)
                    .build();
        }

        List<RawStoryRow> rawStories = parseResult.getStories();
        List<RawChapterRow> rawChapters = parseResult.getChapters();

        // Query existing DB external IDs for referential validation
        Set<String> referencedExtIds = rawChapters.stream()
                .map(RawChapterRow::getExternalStoryId)
                .filter(id -> id != null && !id.isBlank())
                .collect(Collectors.toSet());

        List<Story> dbStories = storyRepository.findByExternalIdIn(referencedExtIds);
        Set<String> existingDbExtIds = dbStories.stream()
                .map(Story::getExternalId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        // 2. Validate parsed data
        List<ImportValidationErrorDto> validationErrors = validationService.validateParsedData(rawStories, rawChapters, existingDbExtIds);

        // 3. Generate conflict preview
        String importId = UUID.randomUUID().toString();
        ImportPreviewResponse previewResponse = conflictService.generatePreview(importId, rawStories, rawChapters, validationErrors);

        // 4. Save session if preview contains zero blocking validation errors
        if (previewResponse.isValid()) {
            sessionService.saveSession(importId, previewResponse, rawStories, rawChapters);
        }

        return previewResponse;
    }

    @Override
    public ImportCommitResponse commitImport(ImportCommitRequest request) {
        String importId = request.getImportId();
        ImportSession session = sessionService.getSession(importId);

        if (session == null) {
            throw new BadRequestException("Phiên nhập dữ liệu (importId) không tồn tại hoặc đã hết hạn. Vui lòng thực hiện Xem trước (Preview) lại.");
        }

        if (!session.getPreviewResponse().isValid()) {
            throw new BadRequestException("Dữ liệu xem trước có chứa lỗi xác thực không hợp lệ. Vui lòng sửa file Excel và thử lại.");
        }

        return commitService.commitImport(request, session.getRawStories(), session.getRawChapters());
    }
}
