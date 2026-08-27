package com.storyapp.storyapp.service;

import com.storyapp.storyapp.dto.importing.ImportCommitRequest;
import com.storyapp.storyapp.dto.importing.ImportCommitResponse;
import com.storyapp.storyapp.dto.importing.ImportPreviewResponse;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

public interface StoryImportService {

    byte[] downloadTemplate() throws IOException;

    ImportPreviewResponse previewImport(MultipartFile file);

    ImportCommitResponse commitImport(ImportCommitRequest request);
}
