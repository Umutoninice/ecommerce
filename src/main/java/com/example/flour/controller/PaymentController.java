package com.example.flour.controller;

import com.example.flour.dto.PaymentCallbackRequest;
import com.example.flour.dto.PaymentDto;
import com.example.flour.security.UserPrincipal;
import com.example.flour.service.PaymentService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private static final Logger logger = LoggerFactory.getLogger(PaymentController.class);
    private final PaymentService paymentService;

    @Autowired
    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @GetMapping("/order/{orderId}")
    public ResponseEntity<PaymentDto> getPaymentByOrderId(
            @PathVariable Long orderId,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        logger.info("REST request to view payment for order ID: {}", orderId);
        PaymentDto payment = paymentService.getPaymentByOrderId(orderId, currentUser);
        return ResponseEntity.ok(payment);
    }

    @PostMapping("/momo-callback")
    public ResponseEntity<Map<String, String>> paymentCallback(@Valid @RequestBody PaymentCallbackRequest callback) {
        logger.info("REST webhook payment callback triggered for txn ref: {} status: {}", 
                callback.getTransactionReference(), callback.getStatus());
        
        paymentService.handlePaymentCallback(callback);

        Map<String, String> response = new HashMap<>();
        response.put("status", "SUCCESS");
        response.put("message", "Payment callback processed and order updated successfully");
        return ResponseEntity.ok(response);
    }
}
