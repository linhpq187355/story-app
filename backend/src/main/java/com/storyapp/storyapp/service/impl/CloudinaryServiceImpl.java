package com.storyapp.storyapp.service.impl;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.storyapp.storyapp.service.CloudinaryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class CloudinaryServiceImpl implements CloudinaryService {

    private final Cloudinary cloudinary;

    @Value("${cloudinary.cloud-name:}")
    private String cloudName;

    @Value("${cloudinary.api-key:}")
    private String apiKey;

    @Value("${cloudinary.api-secret:}")
    private String apiSecret;

    @Override
    public boolean isConfigured() {
        return StringUtils.hasText(cloudName) && StringUtils.hasText(apiKey) && StringUtils.hasText(apiSecret);
    }

    @Override
    public String uploadImage(MultipartFile file, String folder) {
        if (!isConfigured()) {
            log.info("Cloudinary is not fully configured (missing cloudName/apiKey/apiSecret). Skipping Cloudinary upload.");
            return null;
        }
        if (file == null || file.isEmpty()) {
            return null;
        }

        try {
            log.info("Uploading image to Cloudinary (folder: {})...", folder);
            Map<?, ?> uploadResult = cloudinary.uploader().upload(
                file.getBytes(),
                ObjectUtils.asMap(
                    "folder", "story-app/" + folder,
                    "resource_type", "image"
                )
            );
            String secureUrl = (String) uploadResult.get("secure_url");
            log.info("Cloudinary image upload successful: {}", secureUrl);
            return secureUrl;
        } catch (IOException e) {
            log.error("Cloudinary image upload failed: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to upload image to Cloudinary", e);
        }
    }

    @Override
    public String uploadAudio(MultipartFile file, String folder) {
        if (!isConfigured()) {
            log.info("Cloudinary is not fully configured. Skipping Cloudinary upload.");
            return null;
        }
        if (file == null || file.isEmpty()) {
            return null;
        }

        try {
            log.info("Uploading audio file to Cloudinary (folder: {})...", folder);
            Map<?, ?> uploadResult = cloudinary.uploader().upload(
                file.getBytes(),
                ObjectUtils.asMap(
                    "folder", "story-app/" + folder,
                    "resource_type", "video" // Cloudinary processes audio under 'video' resource type
                )
            );
            String secureUrl = (String) uploadResult.get("secure_url");
            log.info("Cloudinary audio upload successful: {}", secureUrl);
            return secureUrl;
        } catch (IOException e) {
            log.error("Cloudinary audio upload failed: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to upload audio to Cloudinary", e);
        }
    }

    @Override
    public String uploadAudioBytes(byte[] audioBytes, String fileName, String folder) {
        if (!isConfigured()) {
            log.info("Cloudinary is not fully configured. Skipping Cloudinary byte upload.");
            return null;
        }
        if (audioBytes == null || audioBytes.length == 0) {
            return null;
        }

        try {
            log.info("Uploading audio bytes to Cloudinary (folder: {}, file: {})...", folder, fileName);
            Map<?, ?> uploadResult = cloudinary.uploader().upload(
                audioBytes,
                ObjectUtils.asMap(
                    "folder", "story-app/" + folder,
                    "resource_type", "video",
                    "public_id", fileName != null ? fileName.replaceAll("\\.[^.]+$", "") : null
                )
            );
            String secureUrl = (String) uploadResult.get("secure_url");
            log.info("Cloudinary audio byte upload successful: {}", secureUrl);
            return secureUrl;
        } catch (IOException e) {
            log.error("Cloudinary audio byte upload failed: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to upload audio bytes to Cloudinary", e);
        }
    }
}
