package com.example.flour.service;

import com.example.flour.dto.CartDto;
import com.example.flour.dto.CartItemAddRequest;
import com.example.flour.security.UserPrincipal;

public interface CartService {
    CartDto getCart(UserPrincipal currentUser);
    CartDto addToCart(UserPrincipal currentUser, CartItemAddRequest request);
    CartDto updateCartItem(UserPrincipal currentUser, Long itemId, Integer quantity);
    CartDto removeCartItem(UserPrincipal currentUser, Long itemId);
    void clearCart(UserPrincipal currentUser);
}
