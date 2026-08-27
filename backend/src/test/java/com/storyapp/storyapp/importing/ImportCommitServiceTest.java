package com.storyapp.storyapp.importing;

import com.storyapp.storyapp.dto.importing.ImportCommitRequest;
import com.storyapp.storyapp.dto.importing.ImportCommitResponse;
import com.storyapp.storyapp.dto.importing.ImportPreviewResponse;
import com.storyapp.storyapp.entity.Author;
import com.storyapp.storyapp.entity.Genre;
import com.storyapp.storyapp.entity.Story;
import com.storyapp.storyapp.enums.StoryStatus;
import com.storyapp.storyapp.repository.AuthorRepository;
import com.storyapp.storyapp.repository.ChapterRepository;
import com.storyapp.storyapp.repository.GenreRepository;
import com.storyapp.storyapp.repository.StoryRepository;
import com.storyapp.storyapp.service.ImportCommitService;
import com.storyapp.storyapp.service.ImportParserService.RawChapterRow;
import com.storyapp.storyapp.service.ImportParserService.RawStoryRow;
import com.storyapp.storyapp.service.ImportSessionService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ImportCommitServiceTest {

    @Mock
    private StoryRepository storyRepository;

    @Mock
    private ChapterRepository chapterRepository;

    @Mock
    private AuthorRepository authorRepository;

    @Mock
    private GenreRepository genreRepository;

    @Mock
    private ImportSessionService sessionService;

    @InjectMocks
    private ImportCommitService commitService;

    private Genre sampleGenre;
    private Author sampleAuthor;

    @BeforeEach
    void setUp() {
        sampleGenre = new Genre();
        sampleGenre.setId(1L);
        sampleGenre.setName("Tổng hợp");

        sampleAuthor = new Author();
        sampleAuthor.setId(1L);
        sampleAuthor.setName("Thiên Tằm Thổ Đậu");
    }

    @Test
    void commitImport_shouldCreateNewStoryAndNewChapters() {
        RawStoryRow storyRow = new RawStoryRow(2, "TR001", "Đấu Phá Thương Khung", "Thiên Tằm Thổ Đậu", "Mô tả", "cover.jpg", "ONGOING");
        RawChapterRow chapterRow = new RawChapterRow(2, "TR001", 1, "1", "Chương 1", "Nội dung...", "FREE");

        when(storyRepository.findByExternalId("TR001")).thenReturn(Optional.empty());
        when(genreRepository.findByName(anyString())).thenReturn(Optional.of(sampleGenre));
        when(authorRepository.findByName("Thiên Tằm Thổ Đậu")).thenReturn(Optional.of(sampleAuthor));

        Story savedStory = new Story();
        savedStory.setId(100L);
        savedStory.setExternalId("TR001");
        savedStory.setTitle("Đấu Phá Thương Khung");

        when(storyRepository.save(any(Story.class))).thenReturn(savedStory);
        when(chapterRepository.findByStoryIdAndChapterNumber(100L, 1)).thenReturn(Optional.empty());

        ImportCommitRequest request = ImportCommitRequest.builder()
                .importId("test-id")
                .storyPolicy("KEEP")
                .chapterPolicy("SKIP")
                .build();

        ImportCommitResponse response = commitService.commitImport(request, List.of(storyRow), List.of(chapterRow));

        assertNotNull(response);
        assertTrue(response.isSuccess());
        assertEquals(1, response.getStoriesCreated());
        assertEquals(1, response.getChaptersCreated());
        verify(storyRepository, times(1)).save(any(Story.class));
        verify(chapterRepository, times(1)).save(any());
    }

    @Test
    void commitImport_shouldKeepExistingStoryWhenPolicyIsKeep() {
        RawStoryRow storyRow = new RawStoryRow(2, "TR001", "Tên mới từ Excel", "Thiên Tằm Thổ Đậu", "Mô tả mới", "cover.jpg", "COMPLETED");

        Story existingStory = new Story();
        existingStory.setId(50L);
        existingStory.setExternalId("TR001");
        existingStory.setTitle("Tên cũ trong CSDL");
        existingStory.setStatus(StoryStatus.ONGOING);

        when(storyRepository.findByExternalId("TR001")).thenReturn(Optional.of(existingStory));
        when(genreRepository.findByName(anyString())).thenReturn(Optional.of(sampleGenre));

        ImportCommitRequest request = ImportCommitRequest.builder()
                .importId("test-id")
                .storyPolicy("KEEP")
                .chapterPolicy("SKIP")
                .build();

        ImportCommitResponse response = commitService.commitImport(request, List.of(storyRow), Collections.emptyList());

        assertEquals(0, response.getStoriesCreated());
        assertEquals(0, response.getStoriesUpdated());
        assertEquals(1, response.getStoriesSkipped());
        assertEquals("Tên cũ trong CSDL", existingStory.getTitle()); // Unchanged
    }

    @Test
    void commitImport_shouldUpdateExistingStoryWhenPolicyIsUpdate() {
        RawStoryRow storyRow = new RawStoryRow(2, "TR001", "Tên mới từ Excel", "Thiên Tằm Thổ Đậu", "Mô tả mới", "cover.jpg", "COMPLETED");

        Story existingStory = new Story();
        existingStory.setId(50L);
        existingStory.setExternalId("TR001");
        existingStory.setTitle("Tên cũ trong CSDL");

        when(storyRepository.findByExternalId("TR001")).thenReturn(Optional.of(existingStory));
        when(genreRepository.findByName(anyString())).thenReturn(Optional.of(sampleGenre));
        when(authorRepository.findByName("Thiên Tằm Thổ Đậu")).thenReturn(Optional.of(sampleAuthor));

        ImportCommitRequest request = ImportCommitRequest.builder()
                .importId("test-id")
                .storyPolicy("UPDATE")
                .chapterPolicy("SKIP")
                .build();

        ImportCommitResponse response = commitService.commitImport(request, List.of(storyRow), Collections.emptyList());

        assertEquals(0, response.getStoriesCreated());
        assertEquals(1, response.getStoriesUpdated());
        assertEquals(0, response.getStoriesSkipped());
        assertEquals("Tên mới từ Excel", existingStory.getTitle()); // Updated
    }
}
