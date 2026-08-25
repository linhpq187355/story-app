package com.storyapp.storyapp.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LoginRequest {

    @NotBlank(message = "Tên đăng nhập hoặc email không được để trống")
    @Size(max = 100, message = "Tên đăng nhập hoặc email không được vượt quá 100 ký tự")
    private String usernameOrEmail;

    @NotBlank(message = "Mật khẩu không được để trống")
    private String password;
}
