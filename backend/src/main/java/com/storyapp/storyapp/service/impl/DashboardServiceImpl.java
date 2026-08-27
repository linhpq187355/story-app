package com.storyapp.storyapp.service.impl;

import com.storyapp.storyapp.dto.response.*;
import com.storyapp.storyapp.entity.Chapter;
import com.storyapp.storyapp.entity.Story;
import com.storyapp.storyapp.entity.User;
import com.storyapp.storyapp.entity.VipOrder;
import com.storyapp.storyapp.enums.PaymentStatus;
import com.storyapp.storyapp.repository.*;
import com.storyapp.storyapp.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DashboardServiceImpl implements DashboardService {

    private final StoryRepository storyRepository;
    private final ChapterRepository chapterRepository;
    private final UserRepository userRepository;
    private final VipOrderRepository vipOrderRepository;
    private final ReadingProgressRepository readingProgressRepository;
    private final FavoriteStoryRepository favoriteStoryRepository;

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    @Override
    public AdminDashboardResponse getDashboardData() {
        DashboardSummaryResponse summary = buildSummary();
        List<ReadingStatisticResponse> readingStats = getReadingStatistics("7d");
        List<RevenueStatisticResponse> revenueStats = getRevenueStatistics("7d");
        List<TopStoryResponse> topStories = buildTopStories();
        RevenueSummaryResponse revenue = buildRevenueSummary();
        List<RecentActivityResponse> recentActivities = buildRecentActivities();
        List<AttentionItemResponse> attention = buildAttentionItems();

        return AdminDashboardResponse.builder()
                .summary(summary)
                .readingStatistics(readingStats)
                .revenueStatistics(revenueStats)
                .topStories(topStories)
                .revenue(revenue)
                .recentActivities(recentActivities)
                .attention(attention)
                .build();
    }

    @Override
    public List<ReadingStatisticResponse> getReadingStatistics(String period) {
        int days = parseDays(period);
        LocalDateTime startDate = LocalDateTime.now().minusDays(days - 1).with(LocalTime.MIN);

        // Fetch daily stats from reading progress database
        List<Object[]> rawStats = readingProgressRepository.countDailyViewsAfter(startDate);
        Map<String, Long> dateViewMap = new HashMap<>();

        for (Object[] row : rawStats) {
            if (row != null && row.length >= 2 && row[0] != null) {
                String dateStr = row[0].toString();
                Long count = ((Number) row[1]).longValue();
                dateViewMap.put(dateStr, count);
            }
        }

        // Fill all dates in range to ensure continuous chart lines
        List<ReadingStatisticResponse> result = new ArrayList<>();
        LocalDate current = startDate.toLocalDate();
        LocalDate today = LocalDate.now();

        while (!current.isAfter(today)) {
            String dateStr = current.format(DATE_FORMATTER);
            long views = dateViewMap.getOrDefault(dateStr, 0L);
            result.add(ReadingStatisticResponse.builder()
                    .date(dateStr)
                    .views(views)
                    .build());
            current = current.plusDays(1);
        }

        return result;
    }

    @Override
    public List<RevenueStatisticResponse> getRevenueStatistics(String period) {
        int days = parseDays(period);
        LocalDateTime startDate = LocalDateTime.now().minusDays(days - 1).with(LocalTime.MIN);

        List<Object[]> rawStats = vipOrderRepository.sumDailyRevenueAfter(startDate);
        Map<String, Long> dateRevMap = new HashMap<>();

        for (Object[] row : rawStats) {
            if (row != null && row.length >= 2 && row[0] != null) {
                String dateStr = row[0].toString();
                Long amount = ((Number) row[1]).longValue();
                dateRevMap.put(dateStr, amount);
            }
        }

        List<RevenueStatisticResponse> result = new ArrayList<>();
        LocalDate current = startDate.toLocalDate();
        LocalDate today = LocalDate.now();

        while (!current.isAfter(today)) {
            String dateStr = current.format(DATE_FORMATTER);
            long amount = dateRevMap.getOrDefault(dateStr, 0L);
            result.add(RevenueStatisticResponse.builder()
                    .date(dateStr)
                    .amount(amount)
                    .build());
            current = current.plusDays(1);
        }

        return result;
    }

    private DashboardSummaryResponse buildSummary() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime sevenDaysAgo = now.minusDays(7);
        LocalDateTime fourteenDaysAgo = now.minusDays(14);

        long totalStories = storyRepository.countByIsDeletedFalse();
        long totalChapters = chapterRepository.count();
        long totalUsers = userRepository.count();
        long activeVipUsers = userRepository.countActiveVipUsers(now);
        long totalViews = Optional.ofNullable(storyRepository.sumTotalViews()).orElse(0L);
        long totalRevenue = Optional.ofNullable(vipOrderRepository.sumTotalRevenue()).orElse(0L);

        long newUsers7d = userRepository.countByCreatedAtGreaterThanEqual(sevenDaysAgo);
        long newStories7d = storyRepository.countByIsDeletedFalseAndCreatedAtGreaterThanEqual(sevenDaysAgo);

        long prevUsers7d = userRepository.countByCreatedAtBetween(fourteenDaysAgo, sevenDaysAgo);
        long prevStories7d = storyRepository.countByIsDeletedFalseAndCreatedAtBetween(fourteenDaysAgo, sevenDaysAgo);

        double userGrowth = calculateGrowthPercent(newUsers7d, prevUsers7d);
        double storyGrowth = calculateGrowthPercent(newStories7d, prevStories7d);

        return DashboardSummaryResponse.builder()
                .totalStories(totalStories)
                .totalChapters(totalChapters)
                .totalUsers(totalUsers)
                .activeVipUsers(activeVipUsers)
                .totalViews(totalViews)
                .totalRevenue(totalRevenue)
                .newUsersLast7Days(newUsers7d)
                .newStoriesLast7Days(newStories7d)
                .userGrowthPercent(userGrowth)
                .storyGrowthPercent(storyGrowth)
                .build();
    }

    private List<TopStoryResponse> buildTopStories() {
        List<Story> topViewed = storyRepository.findTopViewedStories(PageRequest.of(0, 5));
        List<TopStoryResponse> result = new ArrayList<>();

        for (Story story : topViewed) {
            long favCount = favoriteStoryRepository.countByStoryId(story.getId());
            result.add(TopStoryResponse.builder()
                    .id(story.getId())
                    .title(story.getTitle())
                    .coverImageUrl(story.getCoverImageUrl())
                    .authorName(story.getAuthor() != null ? story.getAuthor().getName() : "")
                    .genreName(story.getGenre() != null ? story.getGenre().getName() : "")
                    .viewCount(story.getViewCount())
                    .viewsLast7Days(story.getViewsLast7Days())
                    .favoritesCount(favCount)
                    .status(story.getStatus())
                    .updatedAt(story.getUpdatedAt())
                    .build());
        }

        return result;
    }

    private RevenueSummaryResponse buildRevenueSummary() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime todayStart = now.with(LocalTime.MIN);
        LocalDateTime sevenDaysAgo = now.minusDays(7);
        LocalDateTime thirtyDaysAgo = now.minusDays(30);

        long todayRevenue = Optional.ofNullable(vipOrderRepository.sumRevenueAfter(todayStart)).orElse(0L);
        long last7DaysRevenue = Optional.ofNullable(vipOrderRepository.sumRevenueAfter(sevenDaysAgo)).orElse(0L);
        long last30DaysRevenue = Optional.ofNullable(vipOrderRepository.sumRevenueAfter(thirtyDaysAgo)).orElse(0L);
        long totalRevenue = Optional.ofNullable(vipOrderRepository.sumTotalRevenue()).orElse(0L);

        return RevenueSummaryResponse.builder()
                .today(todayRevenue)
                .last7Days(last7DaysRevenue)
                .last30Days(last30DaysRevenue)
                .total(totalRevenue)
                .build();
    }

    private List<RecentActivityResponse> buildRecentActivities() {
        List<RecentActivityResponse> activities = new ArrayList<>();

        // 1. Recent Users
        List<User> recentUsers = userRepository.findTop5ByOrderByCreatedAtDesc();
        for (User u : recentUsers) {
            activities.add(RecentActivityResponse.builder()
                    .type("USER_REGISTERED")
                    .description("Người dùng '" + (u.getDisplayName() != null ? u.getDisplayName() : u.getUsername()) + "' đã đăng ký tài khoản")
                    .timestamp(u.getCreatedAt())
                    .targetUrl("/admin/vip")
                    .build());
        }

        // 2. Recent Paid VIP Orders
        List<VipOrder> recentOrders = vipOrderRepository.findTop5ByStatusOrderByCreatedAtDesc(PaymentStatus.PAID);
        for (VipOrder vo : recentOrders) {
            String userName = vo.getUser() != null ? (vo.getUser().getDisplayName() != null ? vo.getUser().getDisplayName() : vo.getUser().getUsername()) : "Người dùng";
            String pkgName = vo.getVipPackage() != null ? vo.getVipPackage().getName() : "Gói nạp";
            activities.add(RecentActivityResponse.builder()
                    .type("VIP_PURCHASED")
                    .description("Người dùng '" + userName + "' đã mua " + pkgName + " (" + String.format("%,d", vo.getAmount()) + " đ)")
                    .timestamp(vo.getPaidAt() != null ? vo.getPaidAt() : vo.getCreatedAt())
                    .targetUrl("/admin/vip")
                    .build());
        }

        // 3. Recent Stories Created
        List<Story> recentStories = storyRepository.findTop5ByIsDeletedFalseOrderByCreatedAtDesc();
        for (Story s : recentStories) {
            activities.add(RecentActivityResponse.builder()
                    .type("STORY_CREATED")
                    .description("Truyện mới '" + s.getTitle() + "' đã được tạo")
                    .timestamp(s.getCreatedAt())
                    .targetUrl("/admin/stories/" + s.getId())
                    .build());
        }

        // 4. Recent Chapters Created
        List<Chapter> recentChapters = chapterRepository.findTop5ByOrderByCreatedAtDesc();
        for (Chapter c : recentChapters) {
            String storyTitle = c.getStory() != null ? c.getStory().getTitle() : "";
            activities.add(RecentActivityResponse.builder()
                    .type("CHAPTER_CREATED")
                    .description("Chương mới '" + c.getTitle() + "' (Chương " + c.getChapterNumber() + ") đã được thêm vào " + storyTitle)
                    .timestamp(c.getCreatedAt())
                    .targetUrl(c.getStory() != null ? "/admin/stories/" + c.getStory().getId() + "/chapters" : "/admin/stories")
                    .build());
        }

        // Sort all merged activities by timestamp DESC and limit to 10
        activities.sort(Comparator.comparing(RecentActivityResponse::getTimestamp, Comparator.nullsLast(Comparator.reverseOrder())));
        if (activities.size() > 10) {
            return activities.subList(0, 10);
        }
        return activities;
    }

    private List<AttentionItemResponse> buildAttentionItems() {
        List<AttentionItemResponse> result = new ArrayList<>();

        // 1. Stories without chapters
        List<Story> storiesWithoutChapters = storyRepository.findStoriesWithoutChapters();
        if (!storiesWithoutChapters.isEmpty()) {
            result.add(AttentionItemResponse.builder()
                    .type("STORY_WITHOUT_CHAPTERS")
                    .message("Có " + storiesWithoutChapters.size() + " truyện chưa có chương nào")
                    .targetUrl("/admin/stories")
                    .count(storiesWithoutChapters.size())
                    .severity("WARNING")
                    .build());
        }

        // 2. Chapters without audio
        List<Chapter> chaptersWithoutAudio = chapterRepository.findChaptersWithoutAudio();
        if (!chaptersWithoutAudio.isEmpty()) {
            result.add(AttentionItemResponse.builder()
                    .type("CHAPTER_WITHOUT_AUDIO")
                    .message("Có " + chaptersWithoutAudio.size() + " chương chưa tạo Audio giọng đọc")
                    .targetUrl("/admin/stories")
                    .count(chaptersWithoutAudio.size())
                    .severity("INFO")
                    .build());
        }

        return result;
    }

    private int parseDays(String period) {
        if (period == null) return 7;
        return switch (period.toLowerCase()) {
            case "30d", "30" -> 30;
            case "90d", "3m", "90" -> 90;
            default -> 7;
        };
    }

    private double calculateGrowthPercent(long current, long previous) {
        if (previous == 0) {
            return current > 0 ? 100.0 : 0.0;
        }
        return Math.round(((double) (current - previous) / previous * 100.0) * 10.0) / 10.0;
    }
}
