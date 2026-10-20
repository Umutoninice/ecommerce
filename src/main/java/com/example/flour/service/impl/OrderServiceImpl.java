package com.example.flour.service.impl;

import com.example.flour.dto.*;
import com.example.flour.entity.*;
import com.example.flour.exception.BadRequestException;
import com.example.flour.exception.InsufficientStockException;
import com.example.flour.exception.ResourceNotFoundException;
import com.example.flour.repository.*;
import com.example.flour.security.UserPrincipal;
import com.example.flour.service.OrderService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class OrderServiceImpl implements OrderService {

    private static final Logger logger = LoggerFactory.getLogger(OrderServiceImpl.class);

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final InventoryRepository inventoryRepository;
    private final UserRepository userRepository;
    private final PaymentRepository paymentRepository;
    private final DeliveryRepository deliveryRepository;

    @Autowired
    public OrderServiceImpl(OrderRepository orderRepository, OrderItemRepository orderItemRepository,
                            CartRepository cartRepository, CartItemRepository cartItemRepository,
                            ProductRepository productRepository, InventoryRepository inventoryRepository,
                            UserRepository userRepository, PaymentRepository paymentRepository,
                            DeliveryRepository deliveryRepository) {
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
        this.productRepository = productRepository;
        this.inventoryRepository = inventoryRepository;
        this.userRepository = userRepository;
        this.paymentRepository = paymentRepository;
        this.deliveryRepository = deliveryRepository;
    }

    @Override
    @Transactional
    public OrderDto placeOrder(UserPrincipal currentUser, OrderRequest request) {
        User user = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", currentUser.getId()));

        Cart cart = cartRepository.findByUserId(user.getId())
                .orElseThrow(() -> new BadRequestException("Shopping cart not found for user"));

        if (cart.getCartItems() == null || cart.getCartItems().isEmpty()) {
            throw new BadRequestException("Shopping cart is empty");
        }

        // 1. Validate stock levels
        for (CartItem item : cart.getCartItems()) {
            Product product = item.getProduct();
            if (product.getStockQuantity() < item.getQuantity()) {
                throw new InsufficientStockException(product.getName(), item.getQuantity(), product.getStockQuantity());
            }
        }

        // 2. Calculate Total
        BigDecimal total = BigDecimal.ZERO;
        for (CartItem item : cart.getCartItems()) {
            BigDecimal itemTotal = item.getProduct().getPrice().multiply(BigDecimal.valueOf(item.getQuantity()));
            total = total.add(itemTotal);
        }

        // 3. Generate Order Number
        String orderNumber = "FLR-" + LocalDate.now().toString().replace("-", "") + "-" + (int)(Math.random() * 90000 + 10000);

        // 4. Create Order
        Order order = new Order();
        order.setOrderNumber(orderNumber);
        order.setUser(user);
        order.setTotalAmount(total);
        order.setStatus("PENDING");

        Order savedOrder = orderRepository.save(order);

        // 5. Create OrderItems & Reduce Stock & Low Stock Warnings
        List<OrderItem> orderItems = new ArrayList<>();
        for (CartItem item : cart.getCartItems()) {
            Product product = item.getProduct();
            
            // Reduce stock
            int originalStock = product.getStockQuantity();
            int newStock = originalStock - item.getQuantity();
            product.setStockQuantity(newStock);

            // Fetch low stock threshold from inventory config
            Inventory inventory = inventoryRepository.findByProductId(product.getId()).orElse(null);
            int threshold = (inventory != null) ? inventory.getLowStockThreshold() : 10;

            // Sync availability status
            if (newStock <= 0) {
                product.setAvailabilityStatus("OUTOFSTOCK");
            } else if (newStock <= threshold) {
                product.setAvailabilityStatus("LOWSTOCK");
            } else {
                product.setAvailabilityStatus("INSTOCK");
            }

            productRepository.save(product);

            // Alert admin if stock is low
            if (newStock <= threshold) {
                logger.warn("CRITICAL: LOW STOCK ALERT for '{}' (ID: {}). Stock level has dropped to {} bags. (Low Stock Threshold is {})", 
                        product.getName(), product.getId(), newStock, threshold);
            }

            // Create OrderItem
            OrderItem orderItem = new OrderItem(savedOrder, product, item.getQuantity(), product.getPrice());
            orderItemRepository.save(orderItem);
            orderItems.add(orderItem);
        }
        savedOrder.setOrderItems(orderItems);

        // 6. Create Delivery record
        String trackingNumber = "TRK-" + (int)(Math.random() * 90000000 + 10000000);
        Delivery delivery = new Delivery();
        delivery.setOrder(savedOrder);
        delivery.setRecipientName(request.getRecipientName());
        delivery.setRecipientPhone(request.getRecipientPhone());
        delivery.setAddressLine1(request.getAddressLine1());
        delivery.setCity(request.getCity());
        delivery.setProvince(request.getProvince());
        delivery.setTrackingNumber(trackingNumber);
        delivery.setStatus("PENDING");
        delivery.setEstimatedDeliveryDate(LocalDate.now().plusDays(2)); // standard 2 days in Rwanda

        deliveryRepository.save(delivery);
        savedOrder.setDelivery(delivery);

        // 7. Create Payment record
        String txnRef = "TXN-" + (int)(Math.random() * 900000000 + 100000000);
        Payment payment = new Payment();
        payment.setOrder(savedOrder);
        payment.setAmount(total);
        payment.setPaymentMethod(request.getPaymentMethod());
        payment.setStatus("PENDING");
        payment.setTransactionReference(txnRef);

        paymentRepository.save(payment);
        savedOrder.setPayment(payment);

        // 8. Clear Cart
        cartItemRepository.deleteByCartId(cart.getId());
        cart.getCartItems().clear();

        logger.info("Successfully placed order {} for user {}", orderNumber, user.getEmail());

        return convertToDto(savedOrder);
    }

    @Override
    public OrderDto getOrderById(Long orderId, UserPrincipal currentUser) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));

        // Check if customer owns this order, admins can view any order
        boolean isAdmin = currentUser.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        if (!isAdmin && !order.getUser().getId().equals(currentUser.getId())) {
            throw new BadRequestException("You do not have permission to view this order");
        }

        return convertToDto(order);
    }

    @Override
    public List<OrderDto> getMyOrders(UserPrincipal currentUser) {
        return orderRepository.findByUserId(currentUser.getId()).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<OrderDto> getAllOrders() {
        return orderRepository.findAll().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public OrderDto updateOrderStatus(Long orderId, String status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));

        // Validate status value
        List<String> validStatuses = List.of("PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED");
        if (!validStatuses.contains(status.toUpperCase())) {
            throw new BadRequestException("Invalid status: " + status);
        }

        order.setStatus(status.toUpperCase());

        // Update corresponding delivery status if applicable
        Delivery delivery = order.getDelivery();
        if (delivery != null) {
            if (status.equalsIgnoreCase("SHIPPED")) {
                delivery.setStatus("SHIPPED");
            } else if (status.equalsIgnoreCase("DELIVERED")) {
                delivery.setStatus("DELIVERED");
                delivery.setActualDeliveryDate(LocalDate.now());
            } else if (status.equalsIgnoreCase("CANCELLED")) {
                delivery.setStatus("FAILED");
            }
            deliveryRepository.save(delivery);
        }

        // Handle cancellations: Restock products!
        if (status.equalsIgnoreCase("CANCELLED")) {
            for (OrderItem item : order.getOrderItems()) {
                Product product = item.getProduct();
                product.setStockQuantity(product.getStockQuantity() + item.getQuantity());
                
                // Update availability status
                Inventory inventory = inventoryRepository.findByProductId(product.getId()).orElse(null);
                int threshold = (inventory != null) ? inventory.getLowStockThreshold() : 10;
                
                if (product.getStockQuantity() > threshold) {
                    product.setAvailabilityStatus("INSTOCK");
                } else if (product.getStockQuantity() > 0) {
                    product.setAvailabilityStatus("LOWSTOCK");
                } else {
                    product.setAvailabilityStatus("OUTOFSTOCK");
                }
                
                productRepository.save(product);
            }
            
            // Mark payment as FAILED/CANCELLED if it was still pending
            Payment payment = order.getPayment();
            if (payment != null && payment.getStatus().equals("PENDING")) {
                payment.setStatus("FAILED");
                paymentRepository.save(payment);
            }
        }

        Order updatedOrder = orderRepository.save(order);
        logger.info("Successfully updated order {} status to {}", order.getOrderNumber(), status);

        return convertToDto(updatedOrder);
    }

    private OrderDto convertToDto(Order order) {
        OrderDto dto = new OrderDto();
        dto.setId(order.getId());
        dto.setOrderNumber(order.getOrderNumber());
        dto.setTotalAmount(order.getTotalAmount());
        dto.setStatus(order.getStatus());
        dto.setCreatedAt(order.getCreatedAt());

        if (order.getOrderItems() != null) {
            List<OrderItemDto> itemDtos = order.getOrderItems().stream().map(item -> {
                OrderItemDto idto = new OrderItemDto();
                idto.setProductId(item.getProduct().getId());
                idto.setProductName(item.getProduct().getName());
                idto.setQuantity(item.getQuantity());
                idto.setPriceAtPurchase(item.getPriceAtPurchase());
                idto.setSubtotal(item.getPriceAtPurchase().multiply(BigDecimal.valueOf(item.getQuantity())));
                return idto;
            }).collect(Collectors.toList());
            dto.setOrderItems(itemDtos);
        }

        if (order.getPayment() != null) {
            PaymentDto pdto = new PaymentDto();
            pdto.setId(order.getPayment().getId());
            pdto.setAmount(order.getPayment().getAmount());
            pdto.setPaymentMethod(order.getPayment().getPaymentMethod());
            pdto.setStatus(order.getPayment().getStatus());
            pdto.setTransactionReference(order.getPayment().getTransactionReference());
            dto.setPayment(pdto);
        }

        if (order.getDelivery() != null) {
            DeliveryDto ddto = new DeliveryDto();
            ddto.setId(order.getDelivery().getId());
            ddto.setTrackingNumber(order.getDelivery().getTrackingNumber());
            ddto.setRecipientName(order.getDelivery().getRecipientName());
            ddto.setRecipientPhone(order.getDelivery().getRecipientPhone());
            ddto.setAddressLine1(order.getDelivery().getAddressLine1());
            ddto.setCity(order.getDelivery().getCity());
            ddto.setProvince(order.getDelivery().getProvince());
            ddto.setStatus(order.getDelivery().getStatus());
            ddto.setEstimatedDeliveryDate(order.getDelivery().getEstimatedDeliveryDate());
            ddto.setActualDeliveryDate(order.getDelivery().getActualDeliveryDate());
            dto.setDelivery(ddto);
        }

        return dto;
    }
}
