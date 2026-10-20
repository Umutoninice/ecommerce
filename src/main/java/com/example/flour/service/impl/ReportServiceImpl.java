package com.example.flour.service.impl;

import com.example.flour.dto.*;
import com.example.flour.entity.Inventory;
import com.example.flour.entity.Order;
import com.example.flour.entity.Product;
import com.example.flour.entity.User;
import com.example.flour.repository.InventoryRepository;
import com.example.flour.repository.OrderItemRepository;
import com.example.flour.repository.OrderRepository;
import com.example.flour.repository.ProductRepository;
import com.example.flour.service.ReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ReportServiceImpl implements ReportService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final ProductRepository productRepository;
    private final InventoryRepository inventoryRepository;

    @Autowired
    public ReportServiceImpl(OrderRepository orderRepository, OrderItemRepository orderItemRepository,
                             ProductRepository productRepository, InventoryRepository inventoryRepository) {
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.productRepository = productRepository;
        this.inventoryRepository = inventoryRepository;
    }

    @Override
    public SalesReportResponse getSalesReport() {
        List<Order> successfulOrders = orderRepository.findAllSuccessfulOrders();

        BigDecimal totalSales = BigDecimal.ZERO;
        long successfulOrdersCount = 0;

        // Group by Year and Month
        Map<String, BigDecimal> monthlyAggregation = new HashMap<>();

        for (Order order : successfulOrders) {
            // Count all orders that are paid/confirmed/processing/shipped/delivered (everything except pending or cancelled)
            // The prompt says payment status: Pending, Paid, Failed
            // And order status: Pending, Confirmed, Processing, Shipped, Delivered, Cancelled
            // Let's assume Confirmed, Processing, Shipped, Delivered, or any Paid order is a successful sale.
            // Actually, we've filtered out 'CANCELLED' orders in orderRepository.findAllSuccessfulOrders()
            // Let's count them all as successful for sales reports, except PENDING orders with unpaid status.
            // Let's include everything that is not CANCELLED and has a PAID or PENDING status, but let's count PAID/CONFIRMED/PROCESSING/SHIPPED/DELIVERED.
            if (!order.getStatus().equalsIgnoreCase("PENDING") || 
                (order.getPayment() != null && order.getPayment().getStatus().equalsIgnoreCase("PAID"))) {
                
                totalSales = totalSales.add(order.getTotalAmount());
                successfulOrdersCount++;

                LocalDateTime createdAt = order.getCreatedAt();
                if (createdAt != null) {
                    String monthYearKey = createdAt.getYear() + "-" + String.format("%02d", createdAt.getMonthValue());
                    monthlyAggregation.put(monthYearKey, monthlyAggregation.getOrDefault(monthYearKey, BigDecimal.ZERO).add(order.getTotalAmount()));
                }
            }
        }

        BigDecimal averageOrderValue = BigDecimal.ZERO;
        if (successfulOrdersCount > 0) {
            averageOrderValue = totalSales.divide(BigDecimal.valueOf(successfulOrdersCount), 2, RoundingMode.HALF_UP);
        }

        List<SalesByMonthDto> salesByMonth = monthlyAggregation.entrySet().stream()
                .map(entry -> {
                    String[] parts = entry.getKey().split("-");
                    int year = Integer.parseInt(parts[0]);
                    int month = Integer.parseInt(parts[1]);
                    return new SalesByMonthDto(month, year, entry.getValue());
                })
                .sorted((a, b) -> {
                    if (a.getYear() != b.getYear()) {
                        return Integer.compare(a.getYear(), b.getYear());
                    }
                    return Integer.compare(a.getMonth(), b.getMonth());
                })
                .collect(Collectors.toList());

        return new SalesReportResponse(totalSales, successfulOrdersCount, averageOrderValue, salesByMonth);
    }

    @Override
    public List<BestSellerDto> getBestSellingFlours() {
        List<Object[]> rawBestSellers = orderItemRepository.findBestSellingProducts();

        return rawBestSellers.stream().map(row -> {
            Product product = (Product) row[0];
            long qtySold = (Long) row[1];
            return new BestSellerDto(
                    product.getId(),
                    product.getName(),
                    product.getBrand(),
                    product.getWeight(),
                    qtySold
            );
        }).collect(Collectors.toList());
    }

    @Override
    public List<CustomerPurchaseReportDto> getCustomerPurchaseReport() {
        List<Order> orders = orderRepository.findAllSuccessfulOrders();
        
        // Group by User
        Map<User, List<Order>> userOrdersMap = orders.stream()
                .filter(o -> !o.getStatus().equalsIgnoreCase("CANCELLED"))
                .collect(Collectors.groupingBy(Order::getUser));

        return userOrdersMap.entrySet().stream().map(entry -> {
            User user = entry.getKey();
            List<Order> userOrders = entry.getValue();

            long totalOrders = userOrders.size();
            BigDecimal totalSpent = userOrders.stream()
                    .map(Order::getTotalAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            String customerName = user.getFirstName() + " " + user.getLastName();

            return new CustomerPurchaseReportDto(
                    user.getId(),
                    customerName,
                    user.getEmail(),
                    totalOrders,
                    totalSpent
            );
        })
        .sorted((a, b) -> b.getTotalSpent().compareTo(a.getTotalSpent())) // sort descending by spent
        .collect(Collectors.toList());
    }

    @Override
    public InventoryReportResponse getInventoryReport() {
        long totalProducts = productRepository.count();

        List<Inventory> lowStockInventories = inventoryRepository.findLowStockInventories();

        List<LowStockProductDto> lowStockProducts = lowStockInventories.stream().map(i -> {
            Product p = i.getProduct();
            return new LowStockProductDto(
                    p.getId(),
                    p.getName(),
                    p.getStockQuantity(),
                    i.getLowStockThreshold(),
                    i.getWarehouseLocation()
            );
        }).collect(Collectors.toList());

        return new InventoryReportResponse(totalProducts, lowStockProducts.size(), lowStockProducts);
    }
}
