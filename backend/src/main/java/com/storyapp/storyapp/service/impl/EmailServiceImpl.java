package com.storyapp.storyapp.service.impl;

import com.storyapp.storyapp.service.EmailService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.util.StringUtils;

@Service
@Slf4j
public class EmailServiceImpl implements EmailService {

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Value("${spring.mail.username:}")
    private String fromEmail;

    @Override
    public void sendOtpEmail(String toEmail, String otpCode) {
        log.info("==============================================");
        log.info("PASSWORD RESET OTP CODE FOR {}: {}", toEmail, otpCode);
        log.info("==============================================");

        if (mailSender != null && StringUtils.hasText(fromEmail)) {
            try {
                SimpleMailMessage message = new SimpleMailMessage();
                message.setFrom(fromEmail);
                message.setTo(toEmail);
                message.setSubject("[Story App] Mã OTP đặt lại mật khẩu của bạn");
                message.setText("Chào bạn,\n\nMã OTP để đặt lại mật khẩu của bạn là: " + otpCode + 
                        "\n\nMã này có hiệu lực trong 10 phút. Vui lòng không chia sẻ mã này với bất kỳ ai.\n\nTrân trọng,\nStory App Team");
                mailSender.send(message);
                log.info("Email OTP successfully sent to {}", toEmail);
            } catch (Exception e) {
                log.warn("Could not send email via SMTP (using console fallback): {}", e.getMessage());
            }
        }
    }
}
