package com.storyapp.storyapp.service;

public interface EmailService {
    void sendOtpEmail(String toEmail, String otpCode);
}
