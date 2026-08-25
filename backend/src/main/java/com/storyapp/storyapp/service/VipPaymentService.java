package com.storyapp.storyapp.service;

import com.storyapp.storyapp.dto.response.VipOrderResponse;
import vn.payos.model.webhooks.WebhookData;

import java.util.List;

public interface VipPaymentService {

    String createVipPaymentLink(Long userId) throws Exception;

    String createVipPaymentLink(Long userId, Long packageId) throws Exception;

    String createCoinPaymentLink(Long userId, Long coins) throws Exception;

    void handlePayosWebhook(WebhookData webhookData);

    List<VipOrderResponse> getPaymentHistory(Long userId);
}