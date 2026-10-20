package com.example.flour.service;

import com.example.flour.dto.OrderDto;
import com.example.flour.dto.OrderRequest;
import com.example.flour.security.UserPrincipal;
import java.util.List;

public interface OrderService {
    OrderDto placeOrder(UserPrincipal currentUser, OrderRequest request);
    OrderDto getOrderById(Long orderId, UserPrincipal currentUser);
    List<OrderDto> getMyOrders(UserPrincipal currentUser);
    List<OrderDto> getAllOrders();
    OrderDto updateOrderStatus(Long orderId, String status);
}
