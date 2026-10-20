package com.example.flour.service;

import com.example.flour.dto.ProductCreateRequest;
import com.example.flour.dto.ProductDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ProductService {
    ProductDto createProduct(ProductCreateRequest request);
    ProductDto updateProduct(Long id, ProductDto productDto);
    ProductDto getProductById(Long id);
    Page<ProductDto> getProducts(Long categoryId, String search, Pageable pageable);
    void deleteProduct(Long id);
}
