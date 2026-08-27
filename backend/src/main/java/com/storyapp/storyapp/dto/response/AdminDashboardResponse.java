package com.storyapp.storyapp.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminDashboardResponse {
    private DashboardSummaryResponse summary;
    private List<ReadingStatisticResponse> readingStatistics;
    private List<TopStoryResponse> topStories;
    private RevenueSummaryResponse revenue;
    private List<RecentActivityResponse> recentActivities;
    private List<AttentionItemResponse> attention;
}
