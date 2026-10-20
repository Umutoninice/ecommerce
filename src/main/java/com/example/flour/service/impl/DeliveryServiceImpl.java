package com.example.flour.service.impl;

import com.example.flour.dto.DeliveryDto;
import com.example.flour.entity.Delivery;
import com.example.flour.entity.Order;
import com.example.flour.exception.BadRequestException;
import com.example.flour.exception.ResourceNotFoundException;
import com.example.flour.repository.DeliveryRepository;
import com.example.flour.repository.OrderRepository;
import com.example.flour.security.UserPrincipal;
import com.example.flour.service.DeliveryService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.util.List;

@Service
public class DeliveryServiceImpl implements DeliveryService {

    private static final Logger logger = LoggerFactory.getLogger(DeliveryServiceImpl.class);

    private final DeliveryRepository deliveryRepository;
    private final OrderRepository orderRepository;

    @Autowired
    public DeliveryServiceImpl(DeliveryRepository deliveryRepository, OrderRepository orderRepository) {
        this.deliveryRepository = deliveryRepository;
        this.orderRepository = orderRepository;
    }

    @Override
    public DeliveryDto getDeliveryByOrderId(Long orderId, UserPrincipal currentUser) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));

        boolean isAdmin = currentUser.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        if (!isAdmin && !order.getUser().getId().equals(currentUser.getId())) {
            throw new BadRequestException("You do not have permission to view delivery tracking for this order");
        }

        Delivery delivery = deliveryRepository.findByOrderId(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Delivery", "orderId", orderId));

        return convertToDto(delivery);
    }

    @Override
    @Transactional
    public DeliveryDto updateDeliveryStatus(Long deliveryId, String status, LocalDate estimatedDate) {
        Delivery delivery = deliveryRepository.findById(deliveryId)
                .orElseThrow(() -> new ResourceNotFoundException("Delivery", "id", deliveryId));

        List<String> validStatuses = List.of("PENDING", "SHIPPED", "DELIVERED", "FAILED");
        if (!validStatuses.contains(status.toUpperCase())) {
            throw new BadRequestException("Invalid delivery status: " + status);
        }

        delivery.setStatus(status.toUpperCase());
        if (estimatedDate != null) {
            delivery.setEstimatedDeliveryDate(estimatedDate);
        }

        if (status.equalsIgnoreCase("DELIVERED")) {
            delivery.setActualDeliveryDate(LocalDate.now());
            // Sync order status to DELIVERED as well
            Order order = delivery.getOrder();
            order.setStatus("DELIVERED");
            orderRepository.save(order);
        } else if (status.equalsIgnoreCase("SHIPPED")) {
            Order order = delivery.getOrder();
            order.setStatus("SHIPPED");
            orderRepository.save(order);
        }

        Delivery updated = deliveryRepository.save(delivery);
        logger.info("Successfully updated delivery {} status to {}", delivery.getTrackingNumber(), status);

        return convertToDto(updated);
    }

    private DeliveryDto convertToDto(Delivery delivery) {
        DeliveryDto dto = new DeliveryDto();
        dto.setId(delivery.getId());
        dto.setTrackingNumber(delivery.getTrackingNumber());
        dto.setRecipientName(delivery.getRecipientName());
        dto.setRecipientPhone(delivery.getRecipientPhone());
        dto.setAddressLine1(delivery.getAddressLine1());
        dto.setCity(delivery.getCity());
        dto.setProvince(delivery.getProvince());
        dto.setStatus(delivery.getStatus());
        dto.setEstimatedDeliveryDate(delivery.getEstimatedDeliveryDate());
        dto.setActualDeliveryDate(delivery.getActualDeliveryDate());
        return dto;
    }
}
