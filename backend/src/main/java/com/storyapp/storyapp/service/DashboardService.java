package com.storyapp.storyapp.service;

import com.storyapp.storyapp.dto.response.AdminDashboardResponse;
import com.storyapp.storyapp.dto.response.ReadingStatisticResponse;

import java.util.List;

public interface DashboardService {

    AdminDashboardResponse getDashboardData();

    List<ReadingStatisticResponse> getReadingStatistics(String period);
}
