package com.storyapp.storyapp.controller.admin;

import com.storyapp.storyapp.dto.request.UpdateVipRequest;
import com.storyapp.storyapp.dto.response.UserResponse;
import com.storyapp.storyapp.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
public class AdminUserController {

    private final UserService userService;

    @GetMapping
    public List<UserResponse> getUsers() {
        return userService.getAll();
    }

    @PatchMapping("/{userId}/vip")
    public UserResponse updateVipStatus(
            @PathVariable Long userId,
            @Valid @RequestBody UpdateVipRequest request
    ) {
        return userService.updateVipStatus(userId, request.getVip());
    }
}
