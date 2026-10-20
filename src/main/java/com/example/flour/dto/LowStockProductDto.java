package com.example.flour.dto;

public class LowStockProductDto {

    private Long productId;
    private String productName;
    private Integer stockQuantity;
    private Integer lowStockThreshold;
    private String warehouseLocation;

    public LowStockProductDto() {
    }

    public LowStockProductDto(Long productId, String productName, Integer stockQuantity, Integer lowStockThreshold, String warehouseLocation) {
        this.productId = productId;
        this.productName = productName;
        this.stockQuantity = stockQuantity;
        this.lowStockThreshold = lowStockThreshold;
        this.warehouseLocation = warehouseLocation;
    }

    public Long getProductId() {
        return productId;
    }

    public void setProductId(Long productId) {
        this.productId = productId;
    }

    public String getProductName() {
        return productName;
    }

    public void setProductName(String productName) {
        this.productName = productName;
    }

    public Integer getStockQuantity() {
        return stockQuantity;
    }

    public void setStockQuantity(Integer stockQuantity) {
        this.stockQuantity = stockQuantity;
    }

    public Integer getLowStockThreshold() {
        return lowStockThreshold;
    }

    public void setLowStockThreshold(Integer lowStockThreshold) {
        this.lowStockThreshold = lowStockThreshold;
    }

    public String getWarehouseLocation() {
        return warehouseLocation;
    }

    public void setWarehouseLocation(String warehouseLocation) {
        this.warehouseLocation = warehouseLocation;
    }
}
