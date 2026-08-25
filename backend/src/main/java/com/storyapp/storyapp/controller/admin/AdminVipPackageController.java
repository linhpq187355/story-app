package com.storyapp.storyapp.controller.admin;

import com.storyapp.storyapp.dto.request.VipPackageRequest;
import com.storyapp.storyapp.dto.response.VipPackageResponse;
import com.storyapp.storyapp.service.VipPackageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/vip-packages")
@RequiredArgsConstructor
public class AdminVipPackageController {

    private final VipPackageService vipPackageService;

    @GetMapping
    public ResponseEntity<List<VipPackageResponse>> getAllPackages() {
        return ResponseEntity.ok(vipPackageService.getAllPackages());
    }

    @GetMapping("/{id}")
    public ResponseEntity<VipPackageResponse> getPackageById(@PathVariable Long id) {
        return ResponseEntity.ok(vipPackageService.getPackageById(id));
    }

    @PostMapping
    public ResponseEntity<VipPackageResponse> createPackage(@Valid @RequestBody VipPackageRequest request) {
        return ResponseEntity.ok(vipPackageService.createPackage(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<VipPackageResponse> updatePackage(
            @PathVariable Long id,
            @Valid @RequestBody VipPackageRequest request
    ) {
        return ResponseEntity.ok(vipPackageService.updatePackage(id, request));
    }

    @PatchMapping("/{id}/toggle")
    public ResponseEntity<VipPackageResponse> togglePackageStatus(@PathVariable Long id) {
        return ResponseEntity.ok(vipPackageService.togglePackageStatus(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePackage(@PathVariable Long id) {
        vipPackageService.deletePackage(id);
        return ResponseEntity.noContent().build();
    }
}
