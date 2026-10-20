package com.example.flour.dto;

import java.math.BigDecimal;

public class CustomerPurchaseReportDto {

    private Long customerId;
    private String customerName;
    private String email;
    private long totalOrders;
    private BigDecimal totalSpent;

    public CustomerPurchaseReportDto() {
    }

    public CustomerPurchaseReportDto(Long customerId, String customerName, String email, long totalOrders, BigDecimal totalSpent) {
        this.customerId = customerId;
        this.customerName = customerName;
        this.email = email;
        this.totalOrders = totalOrders;
        this.totalSpent = totalSpent;
    }

    public Long getCustomerId() {
        return customerId;
    }

    public void setCustomerId(Long customerId) {
        this.customerId = customerId;
    }

    public String getCustomerName() {
        return customerName;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public long getTotalOrders() {
        return totalOrders;
    }

    public void setTotalOrders(long totalOrders) {
        this.totalOrders = totalOrders;
    }

    public BigDecimal getTotalSpent() {
        return totalSpent;
    }

    public void setTotalSpent(BigDecimal totalSpent) {
        this.totalSpent = totalSpent;
    }
}
