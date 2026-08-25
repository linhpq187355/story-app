package com.storyapp.storyapp.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateCoinPaymentRequest {

    @NotNull(message = "Số xu nạp không được để trống.")
    @Min(value = 2, message = "Số xu nạp tối thiểu là 2 xu (2.000 VNĐ).")
    private Long coins;
}
