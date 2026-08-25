package com.storyapp.storyapp.service.impl;

import com.storyapp.storyapp.dto.request.ChapterRequest;
import com.storyapp.storyapp.dto.response.AudioFileResponse;
import com.storyapp.storyapp.dto.response.ChapterResponse;
import com.storyapp.storyapp.dto.response.ChapterSummaryResponse;
import com.storyapp.storyapp.entity.AudioFile;
import com.storyapp.storyapp.entity.Chapter;
import com.storyapp.storyapp.entity.ReadingProgress;
import com.storyapp.storyapp.entity.Story;
import com.storyapp.storyapp.entity.User;
import com.storyapp.storyapp.enums.AccessLevel;
import com.storyapp.storyapp.enums.AudioSource;
import com.storyapp.storyapp.exception.ForbiddenException;
import com.storyapp.storyapp.exception.ResourceNotFoundException;
import com.storyapp.storyapp.mapper.ChapterMapper;
import com.storyapp.storyapp.repository.AudioFileRepository;
import com.storyapp.storyapp.repository.ChapterRepository;
import com.storyapp.storyapp.repository.ReadingProgressRepository;
import com.storyapp.storyapp.repository.StoryRepository;
import com.storyapp.storyapp.repository.UserRepository;
import com.storyapp.storyapp.security.UserPrincipal;
import com.storyapp.storyapp.service.ChapterService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import com.storyapp.storyapp.entity.ChapterAudio;
import com.storyapp.storyapp.enums.VoiceGender;
import com.storyapp.storyapp.dto.response.ChapterAudioResponse;
import com.storyapp.storyapp.repository.ChapterAudioRepository;
import com.storyapp.storyapp.repository.UserChapterPurchaseRepository;
import com.storyapp.storyapp.repository.UserStoryPurchaseRepository;
import com.storyapp.storyapp.service.CloudinaryService;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class ChapterServiceImpl implements ChapterService {

    private final StoryRepository storyRepository;
    private final ChapterRepository chapterRepository;
    private final AudioFileRepository audioFileRepository;
    private final ChapterAudioRepository chapterAudioRepository;
    private final ChapterMapper chapterMapper;
    private final UserRepository userRepository;
    private final ReadingProgressRepository readingProgressRepository;
    private final UserChapterPurchaseRepository userChapterPurchaseRepository;
    private final UserStoryPurchaseRepository userStoryPurchaseRepository;
    private final AzureService azureService;
    private final CloudinaryService cloudinaryService;

    @Value("${app.upload.audio-dir:uploads/audio}")
    private String audioUploadDir;

    @Value("${app.tts.voice-name:vi-VN-HoaiMyNeural}")
    private String ttsVoiceName;

    @Override
    public ChapterResponse create(Long storyId, ChapterRequest request) {
        Story story = findStory(storyId);
        if (chapterRepository.existsByStoryIdAndChapterNumber(storyId, request.getChapterNumber())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Chapter number already exists in this story");
        }

        Chapter chapter = new Chapter();
        chapter.setStory(story);
        applyRequest(chapter, request);
        return chapterMapper.toResponse(chapterRepository.save(chapter));
    }

    @Override
    @Transactional(readOnly = true)
    public List<ChapterResponse> getByStory(Long storyId) {
        ensureStoryExists(storyId);
        return chapterRepository.findByStoryIdOrderByChapterNumberAsc(storyId).stream()
                .map(chapterMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ChapterSummaryResponse> getChapterSummaries(Long storyId) {
        ensureStoryExists(storyId);
        return chapterRepository.findByStoryIdOrderByChapterNumberAsc(storyId).stream()
                .map(this::toSummaryResponse)
                .toList();
    }
    
    @Override
    @Transactional(readOnly = true)
    public Page<ChapterSummaryResponse> getChapterSummaries(Long storyId, Pageable pageable) {
        ensureStoryExists(storyId);
        return chapterRepository.findByStoryId(storyId, pageable).map(this::toSummaryResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public ChapterResponse getById(Long storyId, Long chapterId) {
        Chapter chapter = findChapter(storyId, chapterId);
        Long prevId = chapterRepository.findPreviousChapterId(storyId, chapter.getChapterNumber()).orElse(null);
        Long nextId = chapterRepository.findNextChapterId(storyId, chapter.getChapterNumber()).orElse(null);
        return chapterMapper.toResponse(chapter, prevId, nextId);
    }

    @Override
    public ChapterResponse update(Long storyId, Long chapterId, ChapterRequest request) {
        Chapter chapter = findChapter(storyId, chapterId);

        if (request.getVersion() != null && chapter.getVersion() != null && chapter.getVersion() > 0 
                && !request.getVersion().equals(chapter.getVersion())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Chương này đã được cập nhật bởi một Admin khác. Vui lòng tải lại trang và thử lại.");
        }

        if (!chapter.getChapterNumber().equals(request.getChapterNumber())
                && chapterRepository.existsByStoryIdAndChapterNumber(storyId, request.getChapterNumber())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Chapter number already exists in this story");
        }

        applyRequest(chapter, request);
        return chapterMapper.toResponse(chapterRepository.save(chapter));
    }

    @Override
    public void delete(Long storyId, Long chapterId) {
        Chapter chapter = findChapter(storyId, chapterId);
        chapterRepository.delete(chapter);
    }

    @Override
    public AudioFileResponse uploadAudio(Long chapterId, MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Audio file is required");
        }

        Chapter chapter = chapterRepository.findById(chapterId)
                .orElseThrow(() -> new ResourceNotFoundException("Chapter", "id", chapterId));

        if (!StringUtils.hasText(file.getOriginalFilename())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Audio file name is required");
        }

        String originalFileName = file.getOriginalFilename();
        String extension = originalFileName.contains(".")
                ? originalFileName.substring(originalFileName.lastIndexOf('.'))
                : "";
        String newFileName = UUID.randomUUID() + extension;

        String filePath;
        if (cloudinaryService.isConfigured()) {
            String cloudinaryUrl = cloudinaryService.uploadAudio(file, "audios");
            if (StringUtils.hasText(cloudinaryUrl)) {
                filePath = cloudinaryUrl;
            } else {
                filePath = saveLocalAudioFile(file, newFileName);
            }
        } else {
            filePath = saveLocalAudioFile(file, newFileName);
        }

        // 1. Save to audio_files table
        AudioFile audioFile = new AudioFile();
        audioFile.setChapter(chapter);
        audioFile.setFilePath(filePath);
        audioFile.setOriginalFileName(originalFileName);
        audioFile.setContentType(file.getContentType() != null ? file.getContentType() : "audio/mpeg");
        audioFile.setFileSize(file.getSize());
        audioFile.setSource(AudioSource.UPLOAD);
        AudioFile savedAudio = audioFileRepository.save(audioFile);

        // 2. Sync to chapter_audios table so getPublicChapter and audio player receive this URL
        ChapterAudio chapterAudio = chapterAudioRepository.findByChapterIdAndVoiceGender(chapter.getId(), VoiceGender.FEMALE)
                .orElseGet(() -> {
                    ChapterAudio ca = new ChapterAudio();
                    ca.setChapter(chapter);
                    ca.setVoiceGender(VoiceGender.FEMALE);
                    return ca;
                });
        chapterAudio.setVoiceName("Uploaded Audio (" + originalFileName + ")");
        chapterAudio.setFilePath(filePath);
        chapterAudio.setFileSize(file.getSize());
        chapterAudioRepository.save(chapterAudio);

        log.info("Uploaded audio successfully saved to DB (tables 'audio_files' and 'chapter_audios'): chapterId={}, filePath={}", chapterId, filePath);
        return toResponse(savedAudio);
    }

    private String saveLocalAudioFile(MultipartFile file, String newFileName) {
        try {
            Path uploadPath = Paths.get(audioUploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }
            Path targetPath = uploadPath.resolve(newFileName);
            Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);
            return "/uploads/audio/" + newFileName;
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Could not upload audio file locally", e);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<AudioFileResponse> getAudioFiles(Long chapterId) {
        Chapter chapter = chapterRepository.findById(chapterId)
                .orElseThrow(() -> new ResourceNotFoundException("Chapter", "id", chapterId));

        return audioFileRepository.findByChapterIdOrderByCreatedAtDesc(chapter.getId()).stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public ChapterResponse getPublicChapter(Long storyId, Long chapterId) {
        Chapter chapter = findChapter(storyId, chapterId);
        
        if (!checkAccess(chapter)) {
            throw new ForbiddenException("You do not have access to this chapter. Access level required: " + chapter.getAccessLevel());
        }

        Long prevId = chapterRepository.findPreviousChapterId(storyId, chapter.getChapterNumber()).orElse(null);
        Long nextId = chapterRepository.findNextChapterId(storyId, chapter.getChapterNumber()).orElse(null);

        Map<String, String> audios = new java.util.HashMap<>();
        List<ChapterAudio> chapterAudios = chapterAudioRepository.findByChapterId(chapter.getId());
        for (ChapterAudio ca : chapterAudios) {
            audios.put(ca.getVoiceGender().name(), ca.getFilePath());
        }

        String audioUrl = null;
        if (!audios.isEmpty()) {
            audioUrl = audios.getOrDefault("FEMALE", audios.values().iterator().next());
        } else if (!chapter.getAudioFiles().isEmpty()) {
            audioUrl = chapter.getAudioFiles().get(0).getFilePath();
        }

        Long lastPosition = 0L;
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated() && !"anonymousUser".equals(authentication.getPrincipal())) {
            try {
                UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
                lastPosition = readingProgressRepository.findByUserIdAndChapterId(principal.getId(), chapterId)
                        .map(ReadingProgress::getLastPosition)
                        .orElse(0L);
            } catch (Exception e) {
                log.warn("Could not load reading progress for chapter {}: {}", chapterId, e.getMessage());
            }
        }

        return ChapterResponse.builder()
                .id(chapter.getId())
                .storyId(chapter.getStory().getId())
                .storyTitle(chapter.getStory().getTitle())
                .title(chapter.getTitle())
                .chapterNumber(chapter.getChapterNumber())
                .content(chapter.getContent())
                .audio(audioUrl)
                .audios(audios)
                .accessLevel(chapter.getAccessLevel())
                .previousChapterId(prevId)
                .nextChapterId(nextId)
                .lastPosition(lastPosition)
                .createdAt(chapter.getCreatedAt())
                .updatedAt(chapter.getUpdatedAt())
                .build();
    }

    @Override
    @Transactional
    public Map<String, Boolean> recordView(Long chapterId) {

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null
                || !authentication.isAuthenticated()
                || "anonymousUser".equals(authentication.getPrincipal())) {

            return Map.of("viewed", false);
        }

        UserPrincipal principal =
                (UserPrincipal) authentication.getPrincipal();

        User user = userRepository.findById(principal.getId())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "User",
                                "id",
                                principal.getId()
                        )
                );

        Chapter chapter = chapterRepository.findById(chapterId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Chapter",
                                "id",
                                chapterId
                        )
                );

        Story story = chapter.getStory();

        LocalDateTime now = LocalDateTime.now();

        List<ReadingProgress> recentProgress =
                readingProgressRepository
                        .findByUserIdAndStoryIdOrderByUpdatedAtDesc(
                                user.getId(),
                                story.getId()
                        );

        boolean viewedRecently =
                !recentProgress.isEmpty()
                        && recentProgress.get(0)
                        .getUpdatedAt()
                        .isAfter(now.minusMinutes(30));

        ReadingProgress progress =
                readingProgressRepository
                        .findByUserIdAndChapterId(
                                user.getId(),
                                chapterId
                        )
                        .orElseGet(() -> {

                            ReadingProgress newProgress =
                                    new ReadingProgress();

                            newProgress.setUser(user);
                            newProgress.setChapter(chapter);
                            newProgress.setLastPosition(0L);

                            return newProgress;
                        });

        progress.setUpdatedAt(now);

        readingProgressRepository.save(progress);

        if (!viewedRecently) {

            story.setViewCount(
                    story.getViewCount() + 1
            );

            story.setViewsLast7Days(
                    story.getViewsLast7Days() + 1
            );

            storyRepository.save(story);

            return Map.of("viewed", true);
        }

        return Map.of("viewed", false);
    }

    @Override
    public AudioFileResponse synthesizeAndSaveAudio(Long storyId, Long chapterId) {
        ChapterAudioResponse caRes = synthesizeAndSaveAudio(storyId, chapterId, VoiceGender.FEMALE);
        return AudioFileResponse.builder()
                .id(caRes.getId())
                .chapterId(caRes.getChapterId())
                .filePath(caRes.getFilePath())
                .originalFileName(caRes.getVoiceName())
                .contentType("audio/wav")
                .build();
    }

    @Override
    @Transactional
    public ChapterAudioResponse synthesizeAndSaveAudio(Long storyId, Long chapterId, VoiceGender voiceGender) {
        Chapter chapter = findChapter(storyId, chapterId);

        if (!checkAccess(chapter)) {
            throw new ForbiddenException("You do not have access to this chapter.");
        }

        VoiceGender gender = voiceGender != null ? voiceGender : VoiceGender.FEMALE;

        Optional<ChapterAudio> existing = chapterAudioRepository.findByChapterIdAndVoiceGender(chapter.getId(), gender);
        if (existing.isPresent()) {
            ChapterAudio ca = existing.get();
            return ChapterAudioResponse.builder()
                    .id(ca.getId())
                    .chapterId(chapter.getId())
                    .voiceGender(ca.getVoiceGender())
                    .voiceName(ca.getVoiceName())
                    .filePath(ca.getFilePath())
                    .build();
        }

        if (!StringUtils.hasText(chapter.getContent())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Chapter content is empty, cannot synthesize audio.");
        }

        String voiceName = (gender == VoiceGender.MALE) ? "vi-VN-NamMinhNeural" : "vi-VN-HoaiMyNeural";

        try {
            byte[] audioData = azureService.synthesize(chapter.getContent(), voiceName);

            String newFileName = "chapter_" + chapter.getId() + "_" + gender.name() + "_" + UUID.randomUUID() + ".mp3";
            String filePath;

            if (cloudinaryService.isConfigured()) {
                String cloudinaryUrl = cloudinaryService.uploadAudioBytes(
                    audioData, 
                    "chapter_" + chapter.getId() + "_" + gender.name(), 
                    "audios"
                );
                if (StringUtils.hasText(cloudinaryUrl)) {
                    filePath = cloudinaryUrl;
                } else {
                    Path uploadPath = Paths.get(audioUploadDir);
                    if (!Files.exists(uploadPath)) {
                        Files.createDirectories(uploadPath);
                    }
                    Path targetPath = uploadPath.resolve(newFileName);
                    Files.write(targetPath, audioData);
                    filePath = "/uploads/audio/" + newFileName;
                }
            } else {
                Path uploadPath = Paths.get(audioUploadDir);
                if (!Files.exists(uploadPath)) {
                    Files.createDirectories(uploadPath);
                }
                Path targetPath = uploadPath.resolve(newFileName);
                Files.write(targetPath, audioData);
                filePath = "/uploads/audio/" + newFileName;
            }

            ChapterAudio chapterAudio = new ChapterAudio();
            chapterAudio.setChapter(chapter);
            chapterAudio.setVoiceGender(gender);
            chapterAudio.setVoiceName(voiceName);
            chapterAudio.setFilePath(filePath);
            chapterAudio.setFileSize((long) audioData.length);
            ChapterAudio savedAudio = chapterAudioRepository.save(chapterAudio);

            AudioFile audioFile = new AudioFile();
            audioFile.setChapter(chapter);
            audioFile.setFilePath(filePath);
            audioFile.setOriginalFileName("TTS_" + gender.name() + ".mp3");
            audioFile.setContentType("audio/mpeg");
            audioFile.setFileSize((long) audioData.length);
            audioFile.setSource(AudioSource.TTS);
            audioFileRepository.save(audioFile);

            log.info("Synthesized audio successfully saved to DB (tables 'chapter_audios' and 'audio_files'): chapterId={}, gender={}, filePath={}", chapterId, gender, filePath);

            return ChapterAudioResponse.builder()
                    .id(savedAudio.getId())
                    .chapterId(chapter.getId())
                    .voiceGender(savedAudio.getVoiceGender())
                    .voiceName(savedAudio.getVoiceName())
                    .filePath(savedAudio.getFilePath())
                    .build();
        } catch (IOException e) {
            log.error("Could not save synthesized audio file for chapterId: {}", chapterId, e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Lỗi khi lưu file audio.", e);
        } catch (RuntimeException e) {
            log.error("Azure TTS synthesis failed for chapterId: {}", chapterId, e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Lỗi từ dịch vụ TTS: " + e.getMessage(), e);
        }
    }

    private ChapterSummaryResponse toSummaryResponse(Chapter chapter) {
        return ChapterSummaryResponse.builder()
                .id(chapter.getId())
                .title(chapter.getTitle())
                .chapterNumber(chapter.getChapterNumber())
                .accessLevel(chapter.getAccessLevel())
                .createdAt(chapter.getCreatedAt())
                .build();
    }

    private AudioFileResponse toResponse(AudioFile audioFile) {
        return AudioFileResponse.builder()
                .id(audioFile.getId())
                .chapterId(audioFile.getChapter() != null ? audioFile.getChapter().getId() : null)
                .filePath(audioFile.getFilePath())
                .originalFileName(audioFile.getOriginalFileName())
                .contentType(audioFile.getContentType() != null ? audioFile.getContentType() : "application/octet-stream")
                .build();
    }

    private boolean checkAccess(Chapter chapter) {
        AccessLevel level = chapter.getAccessLevel();
        if (level == AccessLevel.PUBLIC) {
            return true;
        }

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            return false;
        }

        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        if (principal.isAdmin()) {
            return true;
        }
        if (level == AccessLevel.MEMBER) {
            return true;
        }
        if (level == AccessLevel.VIP) {
            if (principal.isVip()) {
                return true;
            }
            Long userId = principal.getId();
            Long storyId = chapter.getStory().getId();
            if (userStoryPurchaseRepository.existsByUserIdAndStoryId(userId, storyId)) {
                return true;
            }
            if (userChapterPurchaseRepository.existsByUserIdAndChapterId(userId, chapter.getId())) {
                return true;
            }
        }

        return false;
    }

    private void applyRequest(Chapter chapter, ChapterRequest request) {
        chapter.setTitle(request.getTitle().trim());
        chapter.setChapterNumber(request.getChapterNumber());
        chapter.setContent(request.getContent());
        chapter.setAccessLevel(request.getAccessLevel());
        chapter.setCoinPrice(request.getCoinPrice() != null ? request.getCoinPrice() : 0L);
    }

    private Story findStory(Long storyId) {
        return storyRepository.findById(storyId)
                .orElseThrow(() -> new ResourceNotFoundException("Story", "id", storyId));
    }

    private void ensureStoryExists(Long storyId) {
        if (!storyRepository.existsById(storyId)) {
            throw new ResourceNotFoundException("Story", "id", storyId);
        }
    }

    private Chapter findChapter(Long storyId, Long chapterId) {
        return chapterRepository.findByStoryIdAndId(storyId, chapterId)
                .orElseThrow(() -> new ResourceNotFoundException("Chapter", "id", chapterId));
    }
}