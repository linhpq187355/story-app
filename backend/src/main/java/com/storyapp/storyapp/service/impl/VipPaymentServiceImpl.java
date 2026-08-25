package com.storyapp.storyapp.service.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.storyapp.storyapp.dto.response.VipOrderResponse;
import com.storyapp.storyapp.entity.User;
import com.storyapp.storyapp.entity.VipOrder;
import com.storyapp.storyapp.enums.PaymentStatus;
import com.storyapp.storyapp.exception.BadRequestException;
import com.storyapp.storyapp.exception.ResourceNotFoundException;
import com.storyapp.storyapp.repository.UserRepository;
import com.storyapp.storyapp.repository.VipOrderRepository;
import com.storyapp.storyapp.service.VipPaymentService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import vn.payos.PayOS;
import vn.payos.model.v2.paymentRequests.CreatePaymentLinkRequest;
import vn.payos.model.v2.paymentRequests.CreatePaymentLinkResponse;
import vn.payos.model.webhooks.WebhookData;

import java.time.LocalDateTime;
import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import com.storyapp.storyapp.entity.VipPackage;
import com.storyapp.storyapp.repository.VipPackageRepository;

@Service
@RequiredArgsConstructor
@Slf4j
public class VipPaymentServiceImpl implements VipPaymentService {

    private final VipOrderRepository vipOrderRepository;
    private final UserRepository userRepository;
    private final VipPackageRepository vipPackageRepository;
    private final PayOS payOS;

    private static final long VIP_AMOUNT = 39000L;
    private static final String VIP_DESCRIPTION = "Nang cap tai khoan VIP";

    @Override
    @Transactional
    public String createVipPaymentLink(Long userId) throws Exception {
        return createVipPaymentLink(userId, null);
    }

    @Override
    @Transactional
    public String createVipPaymentLink(Long userId, Long packageId) throws Exception {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        VipPackage pkg = null;
        if (packageId != null) {
            pkg = vipPackageRepository.findById(packageId)
                    .orElseThrow(() -> new ResourceNotFoundException("VipPackage", "id", packageId));
            if (!Boolean.TRUE.equals(pkg.getIsActive())) {
                throw new BadRequestException("Gói VIP này hiện không còn hoạt động.");
            }
        }

        long amount = pkg != null ? pkg.getPrice() : VIP_AMOUNT;
        String desc = pkg != null ? pkg.getName() : VIP_DESCRIPTION;
        int durationDays = pkg != null ? pkg.getDurationDays() : 30;

        long orderCode = new Date().getTime();

        VipOrder order = new VipOrder();
        order.setOrderCode(orderCode);
        order.setUser(user);
        order.setVipPackage(pkg);
        order.setDurationDays(durationDays);
        order.setAmount(amount);
        order.setStatus(PaymentStatus.PENDING);

        vipOrderRepository.save(order);

        String payosDesc = desc.length() > 25 ? desc.substring(0, 25) : desc;

        CreatePaymentLinkRequest paymentRequest =
                CreatePaymentLinkRequest.builder()
                        .orderCode(orderCode)
                        .amount(amount)
                        .description(payosDesc)
                        .buyerName(user.getDisplayName() != null ? user.getDisplayName() : user.getUsername())
                        .buyerEmail(user.getEmail())
                        .cancelUrl("http://localhost:3000/payment/cancel")
                        .returnUrl("http://localhost:3000/payment/success")
                        .build();

        CreatePaymentLinkResponse paymentLink =
                payOS.paymentRequests().create(paymentRequest);

        return paymentLink.getCheckoutUrl();
    }

    @Override
    @Transactional
    public String createCoinPaymentLink(Long userId, Long coins) throws Exception {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        if (coins == null || coins < 2) {
            throw new BadRequestException("Số xu nạp tối thiểu là 2 xu.");
        }

        long amount = coins * 1000L;
        String desc = "Nap " + coins + " Xu";
        long orderCode = new Date().getTime();

        VipOrder order = new VipOrder();
        order.setOrderCode(orderCode);
        order.setUser(user);
        order.setVipPackage(null);
        order.setDurationDays(null);
        order.setPurchasedCoins(coins);
        order.setAmount(amount);
        order.setStatus(PaymentStatus.PENDING);

        vipOrderRepository.save(order);

        String payosDesc = desc.length() > 25 ? desc.substring(0, 25) : desc;

        CreatePaymentLinkRequest paymentRequest =
                CreatePaymentLinkRequest.builder()
                        .orderCode(orderCode)
                        .amount(amount)
                        .description(payosDesc)
                        .buyerName(user.getDisplayName() != null ? user.getDisplayName() : user.getUsername())
                        .buyerEmail(user.getEmail())
                        .cancelUrl("http://localhost:3000/payment/cancel")
                        .returnUrl("http://localhost:3000/payment/success")
                        .build();

        CreatePaymentLinkResponse paymentLink =
                payOS.paymentRequests().create(paymentRequest);

        return paymentLink.getCheckoutUrl();
    }

    @Override
    @Transactional
    public void handlePayosWebhook(WebhookData webhookData) {

        long orderCode = webhookData.getOrderCode();

        log.info("Processing PayOS webhook for orderCode: {}", orderCode);

        Optional<VipOrder> orderOptional =
                vipOrderRepository.findByOrderCode(orderCode);

        if (orderOptional.isEmpty()) {
            log.warn(
                    "Received webhook for a non-existent order code: {}. " +
                            "This might be a test webhook.",
                    orderCode
            );
            return;
        }

        VipOrder order = orderOptional.get();

        if (order.getStatus() == PaymentStatus.PAID) {
            log.info(
                    "Webhook for order code {} already processed. Ignoring.",
                    orderCode
            );
            return;
        }

        if (order.getStatus() != PaymentStatus.PENDING) {
            log.warn(
                    "Received webhook for an order that is not in PENDING state. " +
                            "Order code: {}, Status: {}",
                    orderCode,
                    order.getStatus()
            );
            return;
        }

        order.setStatus(PaymentStatus.PAID);
        order.setPaidAt(LocalDateTime.now());

        User user = order.getUser();

        if (order.getPurchasedCoins() != null && order.getPurchasedCoins() > 0) {
            long currentCoins = user.getCoins() != null ? user.getCoins() : 0L;
            user.setCoins(currentCoins + order.getPurchasedCoins());
            log.info(
                    "Successfully processed Coin payment for user ID: {} and order code: {}, added {} coins",
                    user.getId(),
                    orderCode,
                    order.getPurchasedCoins()
            );
        } else {
            user.setIsVip(true);
            int daysToAdd = order.getDurationDays() != null ? order.getDurationDays() : 30;
            LocalDateTime currentExp = user.getVipExpirationDate();
            if (currentExp != null && currentExp.isAfter(LocalDateTime.now())) {
                user.setVipExpirationDate(currentExp.plusDays(daysToAdd));
            } else {
                user.setVipExpirationDate(LocalDateTime.now().plusDays(daysToAdd));
            }
            log.info(
                    "Successfully processed VIP payment for user ID: {} and order code: {}, extended by {} days",
                    user.getId(),
                    orderCode,
                    daysToAdd
            );
        }

        userRepository.save(user);
        vipOrderRepository.save(order);
    }

    @Override
    @Transactional
    public List<VipOrderResponse> getPaymentHistory(Long userId) {
        List<VipOrder> orders = vipOrderRepository.findByUserIdAndStatusOrderByCreatedAtDesc(userId, PaymentStatus.PAID);
        return orders.stream()
                .map(order -> {
                    String pkgName;
                    if (order.getPurchasedCoins() != null) {
                        pkgName = "Nạp " + order.getPurchasedCoins() + " Xu";
                    } else if (order.getVipPackage() != null) {
                        pkgName = order.getVipPackage().getName();
                    } else if (order.getDurationDays() != null) {
                        pkgName = "Gói VIP (" + order.getDurationDays() + " ngày)";
                    } else {
                        pkgName = "Gói VIP";
                    }

                    return VipOrderResponse.builder()
                            .orderCode(order.getOrderCode())
                            .packageName(pkgName)
                            .durationDays(order.getDurationDays())
                            .amount(order.getAmount())
                            .status(order.getStatus())
                            .createdAt(order.getCreatedAt())
                            .paidAt(order.getPaidAt())
                            .build();
                })
                .collect(Collectors.toList());
    }
}