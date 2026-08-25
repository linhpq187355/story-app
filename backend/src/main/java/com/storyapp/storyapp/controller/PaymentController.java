package com.storyapp.storyapp.controller;

import com.storyapp.storyapp.dto.request.CreatePaymentRequest;
import com.storyapp.storyapp.dto.response.VipOrderResponse;
import com.storyapp.storyapp.security.UserPrincipal;
import com.storyapp.storyapp.service.VipPaymentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import vn.payos.PayOS;
import vn.payos.model.webhooks.Webhook;
import vn.payos.model.webhooks.WebhookData;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
@Slf4j
public class PaymentController {

    private final VipPaymentService vipPaymentService;
    private final PayOS payOS;

    @PostMapping("/create")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> createPaymentLink(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @RequestBody(required = false) CreatePaymentRequest request
    ) {
        try {
            Long packageId = request != null ? request.getPackageId() : null;
            String checkoutUrl = vipPaymentService.createVipPaymentLink(currentUser.getId(), packageId);
            return ResponseEntity.ok(Map.of("checkoutUrl", checkoutUrl));
        } catch (Exception e) {
            log.error("Failed to create payment link for user: {}", currentUser.getId(), e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/create-coin")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> createCoinPayment(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @jakarta.validation.Valid @RequestBody com.storyapp.storyapp.dto.request.CreateCoinPaymentRequest request
    ) {
        try {
            String checkoutUrl = vipPaymentService.createCoinPaymentLink(currentUser.getId(), request.getCoins());
            return ResponseEntity.ok(Map.of("checkoutUrl", checkoutUrl));
        } catch (Exception e) {
            log.error("Failed to create coin payment link for user: {}", currentUser.getId(), e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/payos-webhook")
    public ResponseEntity<Void> handleWebhook(@RequestBody Webhook webhookBody) {
        log.info("Received PayOS webhook.");

        try {
            WebhookData verifiedData = payOS.webhooks().verify(webhookBody);

            log.info(
                    "Webhook verified successfully for order code: {}",
                    verifiedData.getOrderCode()
            );

            vipPaymentService.handlePayosWebhook(verifiedData);

            return ResponseEntity.ok().build();

        } catch (Exception e) {
            log.error("Webhook verification failed or processing error", e);
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/history")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<VipOrderResponse>> getPaymentHistory(@AuthenticationPrincipal UserPrincipal currentUser) {
        return ResponseEntity.ok(vipPaymentService.getPaymentHistory(currentUser.getId()));
    }
}