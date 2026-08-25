package com.storyapp.storyapp.service;

import org.springframework.web.multipart.MultipartFile;

public interface CloudinaryService {

    String uploadImage(MultipartFile file, String folder);

    String uploadAudio(MultipartFile file, String folder);

    String uploadAudioBytes(byte[] audioBytes, String fileName, String folder);

    boolean isConfigured();
}
