package com.example.flour.controller;

import com.example.flour.dto.DeliveryDto;
import com.example.flour.security.UserPrincipal;
import com.example.flour.service.DeliveryService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;

@RestController
@RequestMapping("/api/deliveries")
public class DeliveryController {

    private static final Logger logger = LoggerFactory.getLogger(DeliveryController.class);
    private final DeliveryService deliveryService;

    @Autowired
    public DeliveryController(DeliveryService deliveryService) {
        this.deliveryService = deliveryService;
    }

    @GetMapping("/order/{orderId}")
    public ResponseEntity<DeliveryDto> getDeliveryByOrderId(
            @PathVariable Long orderId,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        logger.info("REST request to get delivery details for order ID: {}", orderId);
        DeliveryDto delivery = deliveryService.getDeliveryByOrderId(orderId, currentUser);
        return ResponseEntity.ok(delivery);
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DeliveryDto> updateDeliveryStatus(
            @PathVariable Long id,
            @RequestParam String status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate estimatedDate) {
        logger.info("REST request to update delivery {} status to {}, estimated date: {}", id, status, estimatedDate);
        DeliveryDto updated = deliveryService.updateDeliveryStatus(id, status, estimatedDate);
        return ResponseEntity.ok(updated);
    }
}
