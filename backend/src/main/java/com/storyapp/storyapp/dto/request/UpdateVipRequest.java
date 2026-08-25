package com.storyapp.storyapp.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateVipRequest {

    @NotNull(message = "VIP status is required")
    private Boolean vip;

    private Long packageId;

    private Integer durationDays;
}
