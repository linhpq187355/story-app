package com.storyapp.storyapp.controller.admin;

import com.storyapp.storyapp.dto.request.UpdateCoinsRequest;
import com.storyapp.storyapp.dto.request.UpdateVipRequest;
import com.storyapp.storyapp.dto.response.UserResponse;
import com.storyapp.storyapp.service.CoinService;
import com.storyapp.storyapp.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
public class AdminUserController {

    private final UserService userService;
    private final CoinService coinService;

    @GetMapping
    public ResponseEntity<List<UserResponse>> getUsers(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Boolean isVip
    ) {
        return ResponseEntity.ok(userService.getAll(search, isVip));
    }

    @PatchMapping("/{userId}/vip")
    public ResponseEntity<UserResponse> updateVipStatus(
            @PathVariable Long userId,
            @Valid @RequestBody UpdateVipRequest request
    ) {
        return ResponseEntity.ok(userService.updateVipStatus(userId, request.getVip(), request.getPackageId(), request.getDurationDays()));
    }

    @PatchMapping("/{userId}/coins")
    public ResponseEntity<UserResponse> updateUserCoins(
            @PathVariable Long userId,
            @Valid @RequestBody UpdateCoinsRequest request
    ) {
        return ResponseEntity.ok(coinService.updateUserCoins(userId, request.getCoins()));
    }
}
