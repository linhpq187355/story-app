package com.storyapp.storyapp.service;

import com.storyapp.storyapp.dto.importing.*;
import com.storyapp.storyapp.entity.Author;
import com.storyapp.storyapp.entity.Chapter;
import com.storyapp.storyapp.entity.Genre;
import com.storyapp.storyapp.entity.Story;
import com.storyapp.storyapp.enums.AccessLevel;
import com.storyapp.storyapp.enums.StoryStatus;
import com.storyapp.storyapp.exception.BadRequestException;
import com.storyapp.storyapp.repository.AuthorRepository;
import com.storyapp.storyapp.repository.ChapterRepository;
import com.storyapp.storyapp.repository.GenreRepository;
import com.storyapp.storyapp.repository.StoryRepository;
import com.storyapp.storyapp.service.ImportParserService.RawChapterRow;
import com.storyapp.storyapp.service.ImportParserService.RawStoryRow;
import com.storyapp.storyapp.service.ImportSessionService.ImportSession;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class ImportCommitService {

    private final StoryRepository storyRepository;
    private final ChapterRepository chapterRepository;
    private final AuthorRepository authorRepository;
    private final GenreRepository genreRepository;
    private final ImportSessionService sessionService;

    @Transactional
    public ImportCommitResponse commitImport(ImportCommitRequest request, List<RawStoryRow> rawStories, List<RawChapterRow> rawChapters) {
        String importId = request.getImportId();
        String storyPolicy = request.getStoryPolicy() != null ? request.getStoryPolicy().toUpperCase() : "KEEP";
        String chapterPolicy = request.getChapterPolicy() != null ? request.getChapterPolicy().toUpperCase() : "SKIP";

        int storiesCreated = 0;
        int storiesUpdated = 0;
        int storiesSkipped = 0;

        int chaptersCreated = 0;
        int chaptersUpdated = 0;
        int chaptersSkipped = 0;

        List<ImportValidationErrorDto> commitErrors = new ArrayList<>();

        // Map to keep track of story entity references by external_id (or DB ID) for chapter attachment
        Map<String, Story> storyMapByExtId = new HashMap<>();

        // Ensure default Genre exists
        Genre defaultGenre = getDefaultGenre();

        // 1. Process STORIES
        for (RawStoryRow s : rawStories) {
            String extId = s.getExternalId();
            if (extId == null || extId.isBlank()) continue;

            // Re-check database state for concurrency safety
            Optional<Story> existingStoryOpt = storyRepository.findByExternalId(extId);

            if (existingStoryOpt.isPresent()) {
                Story existingStory = existingStoryOpt.get();
                storyMapByExtId.put(extId, existingStory);

                if ("UPDATE".equals(storyPolicy)) {
                    // Update Story metadata
                    if (s.getTitle() != null && !s.getTitle().isBlank()) {
                        existingStory.setTitle(s.getTitle().trim());
                    }
                    if (s.getAuthor() != null && !s.getAuthor().isBlank()) {
                        Author author = findOrCreateAuthor(s.getAuthor().trim());
                        existingStory.setAuthor(author);
                    }
                    if (s.getDescription() != null) {
                        existingStory.setDescription(s.getDescription());
                    }
                    if (s.getCoverUrl() != null && !s.getCoverUrl().isBlank()) {
                        existingStory.setCoverImageUrl(s.getCoverUrl().trim());
                    }
                    if (s.getStatus() != null && !s.getStatus().isBlank()) {
                        try {
                            existingStory.setStatus(StoryStatus.valueOf(s.getStatus().trim().toUpperCase()));
                        } catch (Exception ignored) {}
                    }

                    storyRepository.save(existingStory);
                    storiesUpdated++;
                    log.info("[Import Commit] Updated Story externalId={}", extId);
                } else {
                    // KEEP policy
                    storiesSkipped++;
                    log.info("[Import Commit] Kept existing Story externalId={}", extId);
                }
            } else {
                // NEW Story creation
                Story newStory = new Story();
                newStory.setExternalId(extId);
                newStory.setTitle(s.getTitle() != null ? s.getTitle().trim() : "Truyện chưa đặt tên");
                newStory.setDescription(s.getDescription());
                newStory.setCoverImageUrl(s.getCoverUrl() != null ? s.getCoverUrl().trim() : null);

                if (s.getStatus() != null && !s.getStatus().isBlank()) {
                    try {
                        newStory.setStatus(StoryStatus.valueOf(s.getStatus().trim().toUpperCase()));
                    } catch (Exception e) {
                        newStory.setStatus(StoryStatus.ONGOING);
                    }
                } else {
                    newStory.setStatus(StoryStatus.ONGOING);
                }

                // Handle Author
                if (s.getAuthor() != null && !s.getAuthor().isBlank()) {
                    Author author = findOrCreateAuthor(s.getAuthor().trim());
                    newStory.setAuthor(author);
                } else {
                    Author defaultAuthor = findOrCreateAuthor("Tác giả chưa rõ");
                    newStory.setAuthor(defaultAuthor);
                }

                // Handle Genre
                newStory.setGenre(defaultGenre);

                Story savedStory = storyRepository.save(newStory);
                storyMapByExtId.put(extId, savedStory);
                storiesCreated++;
                log.info("[Import Commit] Created new Story id={} externalId={}", savedStory.getId(), extId);
            }
        }

        // Add any stories that are target referenced in CHAPTERS sheet but already exist in DB
        Set<String> referencedExtIds = new HashSet<>();
        for (RawChapterRow c : rawChapters) {
            if (c.getExternalStoryId() != null) referencedExtIds.add(c.getExternalStoryId());
        }

        for (String refExtId : referencedExtIds) {
            if (!storyMapByExtId.containsKey(refExtId)) {
                storyRepository.findByExternalId(refExtId).ifPresent(story -> storyMapByExtId.put(refExtId, story));
            }
        }

        // 2. Process CHAPTERS
        for (RawChapterRow c : rawChapters) {
            String extStoryId = c.getExternalStoryId();
            Integer chNum = c.getChapterNumber();

            if (extStoryId == null || chNum == null) continue;

            Story parentStory = storyMapByExtId.get(extStoryId);
            if (parentStory == null) {
                commitErrors.add(new ImportValidationErrorDto("CHAPTERS", c.getRowNum(), "external_story_id", "Không tìm thấy truyện tương ứng với mã '" + extStoryId + "'."));
                continue;
            }

            // Re-check database state for existing chapter to prevent duplicate race conditions
            Optional<Chapter> existingChapterOpt = chapterRepository.findByStoryIdAndChapterNumber(parentStory.getId(), chNum);

            if (existingChapterOpt.isPresent()) {
                Chapter existingChapter = existingChapterOpt.get();
                if ("UPDATE".equals(chapterPolicy)) {
                    if (c.getTitle() != null && !c.getTitle().isBlank()) {
                        existingChapter.setTitle(c.getTitle().trim());
                    }
                    if (c.getContent() != null && !c.getContent().isBlank()) {
                        existingChapter.setContent(c.getContent());
                    }
                    if (c.getAccessLevel() != null && !c.getAccessLevel().isBlank()) {
                        existingChapter.setAccessLevel(parseAccessLevel(c.getAccessLevel()));
                    }
                    chapterRepository.save(existingChapter);
                    chaptersUpdated++;
                    log.info("[Import Commit] Updated Chapter storyId={} chapterNumber={}", parentStory.getId(), chNum);
                } else {
                    // SKIP policy
                    chaptersSkipped++;
                    log.info("[Import Commit] Skipped existing Chapter storyId={} chapterNumber={}", parentStory.getId(), chNum);
                }
            } else {
                // NEW Chapter creation
                Chapter newChapter = new Chapter();
                newChapter.setStory(parentStory);
                newChapter.setChapterNumber(chNum);
                newChapter.setTitle(c.getTitle() != null ? c.getTitle().trim() : "Chương " + chNum);
                newChapter.setContent(c.getContent() != null ? c.getContent() : "");
                newChapter.setAccessLevel(parseAccessLevel(c.getAccessLevel()));

                chapterRepository.save(newChapter);
                chaptersCreated++;
                log.info("[Import Commit] Created new Chapter storyId={} chapterNumber={}", parentStory.getId(), chNum);
            }
        }

        // Cleanup session
        sessionService.removeSession(importId);

        return ImportCommitResponse.builder()
                .importId(importId)
                .success(commitErrors.isEmpty())
                .storiesCreated(storiesCreated)
                .storiesUpdated(storiesUpdated)
                .storiesSkipped(storiesSkipped)
                .chaptersCreated(chaptersCreated)
                .chaptersUpdated(chaptersUpdated)
                .chaptersSkipped(chaptersSkipped)
                .errors(commitErrors)
                .build();
    }

    private Author findOrCreateAuthor(String name) {
        return authorRepository.findByName(name)
                .orElseGet(() -> {
                    Author a = new Author();
                    a.setName(name);
                    return authorRepository.save(a);
                });
    }

    private Genre getDefaultGenre() {
        return genreRepository.findByName("Khác")
                .orElseGet(() -> genreRepository.findAll().stream().findFirst()
                        .orElseGet(() -> {
                            Genre g = new Genre();
                            g.setName("Tổng hợp");
                            return genreRepository.save(g);
                        }));
    }

    private AccessLevel parseAccessLevel(String rawLevel) {
        if (rawLevel == null || rawLevel.isBlank()) return AccessLevel.PUBLIC;
        String cleaned = rawLevel.trim().toUpperCase();
        if ("FREE".equals(cleaned)) return AccessLevel.PUBLIC;
        try {
            return AccessLevel.valueOf(cleaned);
        } catch (Exception e) {
            return AccessLevel.PUBLIC;
        }
    }
}
