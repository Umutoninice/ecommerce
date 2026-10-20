package com.example.flour.controller;

import com.example.flour.dto.CartDto;
import com.example.flour.dto.CartItemAddRequest;
import com.example.flour.security.UserPrincipal;
import com.example.flour.service.CartService;
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
@RequestMapping("/api/cart")
public class CartController {

    private static final Logger logger = LoggerFactory.getLogger(CartController.class);
    private final CartService cartService;

    @Autowired
    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    @GetMapping
    public ResponseEntity<CartDto> getCart(@AuthenticationPrincipal UserPrincipal currentUser) {
        logger.info("REST request to view cart for user: {}", currentUser.getUsername());
        CartDto cart = cartService.getCart(currentUser);
        return ResponseEntity.ok(cart);
    }

    @PostMapping("/items")
    public ResponseEntity<CartDto> addToCart(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @Valid @RequestBody CartItemAddRequest request) {
        logger.info("REST request to add product {} to cart for user: {}", request.getProductId(), currentUser.getUsername());
        CartDto cart = cartService.addToCart(currentUser, request);
        return ResponseEntity.ok(cart);
    }

    @PutMapping("/items/{itemId}")
    public ResponseEntity<CartDto> updateCartItem(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PathVariable Long itemId,
            @RequestParam int quantity) {
        logger.info("REST request to update cart item {} quantity to {} for user: {}", itemId, quantity, currentUser.getUsername());
        CartDto cart = cartService.updateCartItem(currentUser, itemId, quantity);
        return ResponseEntity.ok(cart);
    }

    @DeleteMapping("/items/{itemId}")
    public ResponseEntity<CartDto> removeCartItem(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PathVariable Long itemId) {
        logger.info("REST request to remove cart item {} for user: {}", itemId, currentUser.getUsername());
        CartDto cart = cartService.removeCartItem(currentUser, itemId);
        return ResponseEntity.ok(cart);
    }

    @DeleteMapping
    public ResponseEntity<Map<String, String>> clearCart(@AuthenticationPrincipal UserPrincipal currentUser) {
        logger.info("REST request to clear cart for user: {}", currentUser.getUsername());
        cartService.clearCart(currentUser);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Shopping cart cleared successfully");
        return ResponseEntity.ok(response);
    }
}
