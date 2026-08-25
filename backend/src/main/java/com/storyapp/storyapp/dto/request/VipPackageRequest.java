package com.storyapp.storyapp.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class VipPackageRequest {

    @NotBlank(message = "Tên gói VIP không được để trống")
    private String name;

    private String description;

    @NotNull(message = "Giá gói VIP không được để trống")
    @Min(value = 0, message = "Giá không được nhỏ hơn 0")
    private Long price;

    @NotNull(message = "Thời hạn không được để trống")
    @Min(value = 1, message = "Thời hạn phải ít nhất 1 ngày")
    private Integer durationDays;

    private Boolean isActive = true;
}
