package com.storyapp.storyapp.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateCoinsRequest {

    @NotNull(message = "Coins amount is required")
    private Long coins;
}
