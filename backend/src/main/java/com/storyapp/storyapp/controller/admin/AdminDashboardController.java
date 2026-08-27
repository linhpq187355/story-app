package com.storyapp.storyapp.controller.admin;

import com.storyapp.storyapp.dto.response.AdminDashboardResponse;
import com.storyapp.storyapp.dto.response.ReadingStatisticResponse;
import com.storyapp.storyapp.service.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin/dashboard")
@RequiredArgsConstructor
@Tag(name = "Admin Dashboard API", description = "APIs for Admin Dashboard analytics and metrics")
@SecurityRequirement(name = "bearerAuth")
public class AdminDashboardController {

    private final DashboardService dashboardService;

    @GetMapping
    @Operation(summary = "Get complete Admin Dashboard MVP summary data")
    public ResponseEntity<AdminDashboardResponse> getDashboardData() {
        return ResponseEntity.ok(dashboardService.getDashboardData());
    }

    @GetMapping("/reading-statistics")
    @Operation(summary = "Get reading statistics for custom period (7d, 30d, 90d)")
    public ResponseEntity<List<ReadingStatisticResponse>> getReadingStatistics(
            @RequestParam(defaultValue = "7d") String period
    ) {
        return ResponseEntity.ok(dashboardService.getReadingStatistics(period));
    }

    @GetMapping("/revenue-statistics")
    @Operation(summary = "Get revenue statistics for custom period (7d, 30d, 90d)")
    public ResponseEntity<List<com.storyapp.storyapp.dto.response.RevenueStatisticResponse>> getRevenueStatistics(
            @RequestParam(defaultValue = "7d") String period
    ) {
        return ResponseEntity.ok(dashboardService.getRevenueStatistics(period));
    }
}
