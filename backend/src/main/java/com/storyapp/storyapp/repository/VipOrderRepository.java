package com.storyapp.storyapp.repository;

import com.storyapp.storyapp.entity.VipOrder;
import com.storyapp.storyapp.enums.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface VipOrderRepository
        extends JpaRepository<VipOrder, Long> {

    Optional<VipOrder> findByOrderCode(Long orderCode);

    List<VipOrder> findByUserIdAndStatusOrderByCreatedAtDesc(Long userId, PaymentStatus status);
}