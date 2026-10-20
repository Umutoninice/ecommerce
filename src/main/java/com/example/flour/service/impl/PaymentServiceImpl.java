package com.example.flour.service.impl;

import com.example.flour.dto.PaymentCallbackRequest;
import com.example.flour.dto.PaymentDto;
import com.example.flour.entity.Order;
import com.example.flour.entity.Payment;
import com.example.flour.exception.BadRequestException;
import com.example.flour.exception.ResourceNotFoundException;
import com.example.flour.repository.OrderRepository;
import com.example.flour.repository.PaymentRepository;
import com.example.flour.security.UserPrincipal;
import com.example.flour.service.PaymentService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PaymentServiceImpl implements PaymentService {

    private static final Logger logger = LoggerFactory.getLogger(PaymentServiceImpl.class);

    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;

    @Autowired
    public PaymentServiceImpl(PaymentRepository paymentRepository, OrderRepository orderRepository) {
        this.paymentRepository = paymentRepository;
        this.orderRepository = orderRepository;
    }

    @Override
    public PaymentDto getPaymentByOrderId(Long orderId, UserPrincipal currentUser) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));

        // Verify ownership/authorization
        boolean isAdmin = currentUser.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        if (!isAdmin && !order.getUser().getId().equals(currentUser.getId())) {
            throw new BadRequestException("You do not have permission to view payment for this order");
        }

        Payment payment = paymentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment", "orderId", orderId));

        return convertToDto(payment);
    }

    @Override
    @Transactional
    public void handlePaymentCallback(PaymentCallbackRequest callback) {
        Payment payment = paymentRepository.findByTransactionReference(callback.getTransactionReference())
                .orElseThrow(() -> new ResourceNotFoundException("Payment", "transactionReference", callback.getTransactionReference()));

        if (!payment.getStatus().equals("PENDING")) {
            throw new BadRequestException("This payment transaction is already processed");
        }

        payment.setStatus(callback.getStatus().toUpperCase());
        paymentRepository.save(payment);

        Order order = payment.getOrder();
        if (callback.getStatus().equalsIgnoreCase("PAID")) {
            order.setStatus("CONFIRMED"); // Mark order as confirmed once paid
            logger.info("Payment SUCCESSFUL for order {}. Status updated to CONFIRMED.", order.getOrderNumber());
        } else {
            order.setStatus("CANCELLED"); // Cancel order if payment failed (to restore stock in order status updater, but since status update handles restock, we call restock logic)
            logger.info("Payment FAILED for order {}. Status updated to CANCELLED.", order.getOrderNumber());
            
            // Restock items
            order.getOrderItems().forEach(item -> {
                item.getProduct().setStockQuantity(item.getProduct().getStockQuantity() + item.getQuantity());
            });
        }
        orderRepository.save(order);
    }

    private PaymentDto convertToDto(Payment payment) {
        PaymentDto dto = new PaymentDto();
        dto.setId(payment.getId());
        dto.setAmount(payment.getAmount());
        dto.setPaymentMethod(payment.getPaymentMethod());
        dto.setStatus(payment.getStatus());
        dto.setTransactionReference(payment.getTransactionReference());
        return dto;
    }
}
