package com.storyapp.storyapp.dto.response;

import com.storyapp.storyapp.enums.PaymentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VipOrderResponse {
    private Long orderCode;
    private String packageName;
    private Integer durationDays;
    private Long amount;
    private PaymentStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime paidAt;
}