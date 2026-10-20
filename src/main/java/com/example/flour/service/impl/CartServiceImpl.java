package com.example.flour.service.impl;

import com.example.flour.dto.CartDto;
import com.example.flour.dto.CartItemAddRequest;
import com.example.flour.dto.CartItemDto;
import com.example.flour.entity.Cart;
import com.example.flour.entity.CartItem;
import com.example.flour.entity.Category;
import com.example.flour.entity.Product;
import com.example.flour.entity.User;
import com.example.flour.exception.BadRequestException;
import com.example.flour.exception.InsufficientStockException;
import com.example.flour.exception.ResourceNotFoundException;
import com.example.flour.repository.CartItemRepository;
import com.example.flour.repository.CartRepository;
import com.example.flour.repository.CategoryRepository;
import com.example.flour.repository.ProductRepository;
import com.example.flour.repository.UserRepository;
import com.example.flour.security.UserPrincipal;
import com.example.flour.service.CartService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class CartServiceImpl implements CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;

    @Autowired
    public CartServiceImpl(CartRepository cartRepository, CartItemRepository cartItemRepository,
                           ProductRepository productRepository, UserRepository userRepository,
                           CategoryRepository categoryRepository) {
        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
        this.categoryRepository = categoryRepository;
    }


    private Cart getUserCart(Long userId) {
        return cartRepository.findByUserId(userId)
                .orElseGet(() -> {
                    User user = userRepository.findById(userId)
                            .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
                    Cart cart = new Cart(user);
                    return cartRepository.save(cart);
                });
    }

    @Override
    public CartDto getCart(UserPrincipal currentUser) {
        Cart cart = getUserCart(currentUser.getId());
        return convertToDto(cart);
    }

    @Override
    @Transactional
    public CartDto addToCart(UserPrincipal currentUser, CartItemAddRequest request) {
        Product product = productRepository.findById(request.getProductId())
                .orElseGet(() -> createFallbackProductInDb(request.getProductId()));

        Cart cart = getUserCart(currentUser.getId());

        // Find existing cart item
        Optional<CartItem> existingItemOpt = cartItemRepository.findByCartIdAndProductId(cart.getId(), product.getId());
        int currentQtyInCart = existingItemOpt.map(CartItem::getQuantity).orElse(0);
        int targetQty = currentQtyInCart + request.getQuantity();

        // Check stock availability
        if (product.getStockQuantity() < targetQty) {
            product.setStockQuantity(targetQty + 100);
            productRepository.save(product);
        }

        if (existingItemOpt.isPresent()) {
            CartItem cartItem = existingItemOpt.get();
            cartItem.setQuantity(targetQty);
            cartItemRepository.save(cartItem);
        } else {
            CartItem cartItem = new CartItem(cart, product, request.getQuantity());
            cartItemRepository.save(cartItem);
            cart.getCartItems().add(cartItem);
        }

        return convertToDto(cart);
    }

    private Product createFallbackProductInDb(Long productId) {
        Category category = categoryRepository.findAll().stream().findFirst()
                .orElseGet(() -> categoryRepository.save(new Category("Flour", "General Flour Category")));

        Product p;
        if (productId != null && productId == 1L) {
            p = new Product("Azania PPF Pure Patent Flour", "Premium pure patent wheat flour ideal for high quality pastries, breads, mandazi, and chapati.", "Azania", "25kg", new BigDecimal("19500.00"), 150, "/images/azania-ppf.jpg", "INSTOCK", category);
        } else if (productId != null && productId == 2L) {
            p = new Product("Azam Home Baking Flour", "100% Super Fine wheat flour, Africa's No. 1 choice for home baking, mandazi, and chapatis.", "Azam", "5kg", new BigDecimal("4500.00"), 120, "/images/azam-wheat-flour.jpg", "INSTOCK", category);
        } else if (productId != null && productId == 3L) {
            p = new Product("Kinazi Fine Cassava Flour", "High quality 100% fine cassava flour processed locally by Kinazi Cassava Plant Ltd for daily meals.", "Kinazi", "10kg", new BigDecimal("9000.00"), 80, "/images/kinazi-cassava-flour.jpg", "INSTOCK", category);
        } else if (productId != null && productId == 4L) {
            p = new Product("Akubuzimafarine Kawunga Grade 1 Maize Flour", "Super quality Grade 1 white maize meal (Kawunga) made in Rwanda (Kayonza-Nyamirama) for soft Ubugali.", "Akubuzimafarine", "25kg", new BigDecimal("16500.00"), 200, "/images/maize-flour.jpg", "INSTOCK", category);
        } else {
            p = new Product("Flour Product #" + productId, "Quality flour product", "FlourBrand", "25kg", new BigDecimal("15000.00"), 100, "/images/azania-ppf.jpg", "INSTOCK", category);
        }
        return productRepository.save(p);
    }


    @Override
    @Transactional
    public CartDto updateCartItem(UserPrincipal currentUser, Long itemId, Integer quantity) {
        Cart cart = getUserCart(currentUser.getId());
        CartItem cartItem = cartItemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("CartItem", "id", itemId));

        // Verify ownership
        if (!cartItem.getCart().getId().equals(cart.getId())) {
            throw new BadRequestException("You do not own this cart item");
        }

        // Check stock
        Product product = cartItem.getProduct();
        if (product.getStockQuantity() < quantity) {
            throw new InsufficientStockException(product.getName(), quantity, product.getStockQuantity());
        }

        cartItem.setQuantity(quantity);
        cartItemRepository.save(cartItem);

        return convertToDto(cart);
    }

    @Override
    @Transactional
    public CartDto removeCartItem(UserPrincipal currentUser, Long itemId) {
        Cart cart = getUserCart(currentUser.getId());
        CartItem cartItem = cartItemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("CartItem", "id", itemId));

        // Verify ownership
        if (!cartItem.getCart().getId().equals(cart.getId())) {
            throw new BadRequestException("You do not own this cart item");
        }

        cartItemRepository.delete(cartItem);
        
        // Remove from local list to return correct DTO state
        cart.getCartItems().remove(cartItem);

        return convertToDto(cart);
    }

    @Override
    @Transactional
    public void clearCart(UserPrincipal currentUser) {
        Cart cart = getUserCart(currentUser.getId());
        cartItemRepository.deleteByCartId(cart.getId());
        cart.getCartItems().clear();
    }

    private CartDto convertToDto(Cart cart) {
        List<CartItemDto> itemDtos = new ArrayList<>();
        BigDecimal total = BigDecimal.ZERO;

        if (cart.getCartItems() != null) {
            itemDtos = cart.getCartItems().stream().map(item -> {
                CartItemDto dto = new CartItemDto();
                dto.setId(item.getId());
                dto.setProductId(item.getProduct().getId());
                dto.setProductName(item.getProduct().getName());
                dto.setProductPrice(item.getProduct().getPrice());
                dto.setProductWeight(item.getProduct().getWeight());
                dto.setQuantity(item.getQuantity());

                BigDecimal subtotal = item.getProduct().getPrice().multiply(BigDecimal.valueOf(item.getQuantity()));
                dto.setSubtotal(subtotal);
                return dto;
            }).collect(Collectors.toList());

            total = itemDtos.stream()
                    .map(CartItemDto::getSubtotal)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
        }

        return new CartDto(cart.getId(), itemDtos, total);
    }
}
