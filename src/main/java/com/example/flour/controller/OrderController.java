package com.example.flour.controller;

import com.example.flour.dto.OrderDto;
import com.example.flour.dto.OrderRequest;
import com.example.flour.security.UserPrincipal;
import com.example.flour.service.OrderService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private static final Logger logger = LoggerFactory.getLogger(OrderController.class);
    private final OrderService orderService;

    @Autowired
    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping
    public ResponseEntity<OrderDto> placeOrder(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @Valid @RequestBody OrderRequest request) {
        logger.info("REST request to place order for user: {}", currentUser.getUsername());
        OrderDto created = orderService.placeOrder(currentUser, request);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<OrderDto>> getOrders(@AuthenticationPrincipal UserPrincipal currentUser) {
        boolean isAdmin = currentUser.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        if (isAdmin) {
            logger.info("REST request to list all orders (ADMIN Mode)");
            List<OrderDto> orders = orderService.getAllOrders();
            return ResponseEntity.ok(orders);
        } else {
            logger.info("REST request to list orders for user: {}", currentUser.getUsername());
            List<OrderDto> orders = orderService.getMyOrders(currentUser);
            return ResponseEntity.ok(orders);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrderDto> getOrderById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        logger.info("REST request to view order details for order ID: {}", id);
        OrderDto order = orderService.getOrderById(id, currentUser);
        return ResponseEntity.ok(order);
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<OrderDto> updateOrderStatus(
            @PathVariable Long id,
            @RequestParam String status) {
        logger.info("REST request to update order {} status to {}", id, status);
        OrderDto updated = orderService.updateOrderStatus(id, status);
        return ResponseEntity.ok(updated);
    }
}
