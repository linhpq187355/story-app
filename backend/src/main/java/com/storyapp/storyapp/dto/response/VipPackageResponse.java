package com.storyapp.storyapp.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class VipPackageResponse {

    private Long id;

    private String name;

    private String description;

    private Long price;

    private Integer durationDays;

    private Boolean isActive;

    private LocalDateTime createdAt;
}
