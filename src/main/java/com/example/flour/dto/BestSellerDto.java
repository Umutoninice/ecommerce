package com.example.flour.dto;

public class BestSellerDto {

    private Long productId;
    private String productName;
    private String brand;
    private String weight;
    private long quantitySold;

    public BestSellerDto() {
    }

    public BestSellerDto(Long productId, String productName, String brand, String weight, long quantitySold) {
        this.productId = productId;
        this.name = productName; // support name getter compatibility
        this.productName = productName;
        this.brand = brand;
        this.weight = weight;
        this.quantitySold = quantitySold;
    }

    // Support field name name/productName for flexibility
    private String name;

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
        this.name = productName;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
        this.productName = name;
    }

    public String getBrand() {
        return brand;
    }

    public void setBrand(String brand) {
        this.brand = brand;
    }

    public String getWeight() {
        return weight;
    }

    public void setWeight(String weight) {
        this.weight = weight;
    }

    public long getQuantitySold() {
        return quantitySold;
    }

    public void setQuantitySold(long quantitySold) {
        this.quantitySold = quantitySold;
    }
}
