package com.example.flour.service;

import com.example.flour.dto.DeliveryDto;
import com.example.flour.security.UserPrincipal;
import java.time.LocalDate;

public interface DeliveryService {
    DeliveryDto getDeliveryByOrderId(Long orderId, UserPrincipal currentUser);
    DeliveryDto updateDeliveryStatus(Long deliveryId, String status, LocalDate estimatedDate);
}
