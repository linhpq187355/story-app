package com.storyapp.storyapp.repository;

import com.storyapp.storyapp.entity.VipOrder;
import com.storyapp.storyapp.enums.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface VipOrderRepository
        extends JpaRepository<VipOrder, Long> {

    Optional<VipOrder> findByOrderCode(Long orderCode);

    List<VipOrder> findByUserIdAndStatusOrderByCreatedAtDesc(Long userId, PaymentStatus status);

    @Query("SELECT COALESCE(SUM(vo.amount), 0) FROM VipOrder vo WHERE vo.status = com.storyapp.storyapp.enums.PaymentStatus.PAID")
    Long sumTotalRevenue();

    @Query("SELECT COALESCE(SUM(vo.amount), 0) FROM VipOrder vo WHERE vo.status = com.storyapp.storyapp.enums.PaymentStatus.PAID AND vo.createdAt >= :startDate")
    Long sumRevenueAfter(@org.springframework.data.repository.query.Param("startDate") java.time.LocalDateTime startDate);

    @Query("SELECT COALESCE(SUM(vo.amount), 0) FROM VipOrder vo WHERE vo.status = com.storyapp.storyapp.enums.PaymentStatus.PAID AND vo.createdAt >= :startDate AND vo.createdAt < :endDate")
    Long sumRevenueBetween(@org.springframework.data.repository.query.Param("startDate") java.time.LocalDateTime startDate, @org.springframework.data.repository.query.Param("endDate") java.time.LocalDateTime endDate);

    List<VipOrder> findTop5ByStatusOrderByCreatedAtDesc(PaymentStatus status);

    long countByStatus(PaymentStatus status);

    List<VipOrder> findByStatus(PaymentStatus status);
}