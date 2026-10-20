package com.example.flour.service;

import com.example.flour.dto.PaymentCallbackRequest;
import com.example.flour.dto.PaymentDto;
import com.example.flour.security.UserPrincipal;

public interface PaymentService {
    PaymentDto getPaymentByOrderId(Long orderId, UserPrincipal currentUser);
    void handlePaymentCallback(PaymentCallbackRequest callback);
}
