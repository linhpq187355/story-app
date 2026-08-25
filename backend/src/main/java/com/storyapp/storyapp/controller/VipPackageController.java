package com.storyapp.storyapp.controller;

import com.storyapp.storyapp.dto.response.VipPackageResponse;
import com.storyapp.storyapp.service.VipPackageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/vip-packages")
@RequiredArgsConstructor
public class VipPackageController {

    private final VipPackageService vipPackageService;

    @GetMapping
    public ResponseEntity<List<VipPackageResponse>> getActivePackages() {
        return ResponseEntity.ok(vipPackageService.getActivePackages());
    }
}
