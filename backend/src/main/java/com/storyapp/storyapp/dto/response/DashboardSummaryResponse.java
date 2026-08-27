package com.storyapp.storyapp.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardSummaryResponse {
    private long totalStories;
    private long totalChapters;
    private long totalUsers;
    private long activeVipUsers;
    private long totalViews;
    private long totalRevenue;
    private long newUsersLast7Days;
    private long newStoriesLast7Days;
    private double userGrowthPercent;
    private double storyGrowthPercent;
}
