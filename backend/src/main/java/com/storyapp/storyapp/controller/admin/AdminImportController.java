package com.storyapp.storyapp.controller.admin;

import com.storyapp.storyapp.dto.importing.ImportCommitRequest;
import com.storyapp.storyapp.dto.importing.ImportCommitResponse;
import com.storyapp.storyapp.dto.importing.ImportPreviewResponse;
import com.storyapp.storyapp.service.StoryImportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/api/admin/import")
@RequiredArgsConstructor
@Tag(name = "Admin Import API", description = "APIs for bulk importing Stories and Chapters from Excel (.xlsx)")
@SecurityRequirement(name = "bearerAuth")
public class AdminImportController {

    private final StoryImportService storyImportService;

    @GetMapping("/template")
    @Operation(summary = "Download official Excel import template (.xlsx)")
    public ResponseEntity<byte[]> downloadTemplate() throws IOException {
        byte[] excelBytes = storyImportService.downloadTemplate();

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"story_import_template.xlsx\"")
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(excelBytes);
    }

    @PostMapping(value = "/stories/preview", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload Excel file and generate import preview & validation result")
    public ResponseEntity<ImportPreviewResponse> previewImport(
            @RequestPart("file") MultipartFile file
    ) {
        return ResponseEntity.ok(storyImportService.previewImport(file));
    }

    @PostMapping("/stories/commit")
    @Operation(summary = "Commit validated import session with selected conflict policies")
    public ResponseEntity<ImportCommitResponse> commitImport(
            @Valid @RequestBody ImportCommitRequest request
    ) {
        return ResponseEntity.ok(storyImportService.commitImport(request));
    }
}
