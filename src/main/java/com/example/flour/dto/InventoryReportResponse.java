package com.example.flour.dto;

import java.util.List;

public class InventoryReportResponse {

    private long totalProducts;
    private long lowStockProductsCount;
    private List<LowStockProductDto> lowStockProducts;

    public InventoryReportResponse() {
    }

    public InventoryReportResponse(long totalProducts, long lowStockProductsCount, List<LowStockProductDto> lowStockProducts) {
        this.totalProducts = totalProducts;
        this.lowStockProductsCount = lowStockProductsCount;
        this.lowStockProducts = lowStockProducts;
    }

    public long getTotalProducts() {
        return totalProducts;
    }

    public void setTotalProducts(long totalProducts) {
        this.totalProducts = totalProducts;
    }

    public long getLowStockProductsCount() {
        return lowStockProductsCount;
    }

    public void setLowStockProductsCount(long lowStockProductsCount) {
        this.lowStockProductsCount = lowStockProductsCount;
    }

    public List<LowStockProductDto> getLowStockProducts() {
        return lowStockProducts;
    }

    public void setLowStockProducts(List<LowStockProductDto> lowStockProducts) {
        this.lowStockProducts = lowStockProducts;
    }
}
