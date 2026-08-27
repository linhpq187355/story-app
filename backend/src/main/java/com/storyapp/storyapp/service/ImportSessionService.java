package com.storyapp.storyapp.service;

import com.storyapp.storyapp.dto.importing.ImportPreviewResponse;
import com.storyapp.storyapp.dto.importing.StoryImportPreviewDto;
import com.storyapp.storyapp.dto.importing.ChapterImportPreviewDto;
import com.storyapp.storyapp.service.ImportParserService.RawChapterRow;
import com.storyapp.storyapp.service.ImportParserService.RawStoryRow;
import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class ImportSessionService {

    @Getter
    @AllArgsConstructor
    public static class ImportSession {
        private String importId;
        private ImportPreviewResponse previewResponse;
        private List<RawStoryRow> rawStories;
        private List<RawChapterRow> rawChapters;
        private LocalDateTime createdAt;

        public boolean isExpired() {
            return LocalDateTime.now().isAfter(createdAt.plusMinutes(30));
        }
    }

    private final Map<String, ImportSession> sessions = new ConcurrentHashMap<>();

    public void saveSession(String importId, ImportPreviewResponse previewResponse,
                            List<RawStoryRow> rawStories, List<RawChapterRow> rawChapters) {
        evictExpiredSessions();
        sessions.put(importId, new ImportSession(importId, previewResponse, rawStories, rawChapters, LocalDateTime.now()));
    }

    public ImportSession getSession(String importId) {
        evictExpiredSessions();
        ImportSession session = sessions.get(importId);
        if (session != null && session.isExpired()) {
            sessions.remove(importId);
            return null;
        }
        return session;
    }

    public void removeSession(String importId) {
        sessions.remove(importId);
    }

    private void evictExpiredSessions() {
        sessions.entrySet().removeIf(entry -> entry.getValue().isExpired());
    }
}
