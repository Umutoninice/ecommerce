package com.example.flour.service.impl;

import com.example.flour.dto.ProductCreateRequest;
import com.example.flour.dto.ProductDto;
import com.example.flour.entity.Category;
import com.example.flour.entity.Inventory;
import com.example.flour.entity.Product;
import com.example.flour.exception.ResourceNotFoundException;
import com.example.flour.repository.CategoryRepository;
import com.example.flour.repository.InventoryRepository;
import com.example.flour.repository.ProductRepository;
import com.example.flour.service.ProductService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ProductServiceImpl implements ProductService {

    private static final Logger logger = LoggerFactory.getLogger(ProductServiceImpl.class);

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final InventoryRepository inventoryRepository;

    @Autowired
    public ProductServiceImpl(ProductRepository productRepository, 
                              CategoryRepository categoryRepository, 
                              InventoryRepository inventoryRepository) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.inventoryRepository = inventoryRepository;
    }

    @Override
    @Transactional
    public ProductDto createProduct(ProductCreateRequest request) {
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", request.getCategoryId()));

        Product product = new Product();
        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setCategory(category);
        product.setBrand(request.getBrand());
        product.setWeight(request.getWeight());
        product.setPrice(request.getPrice());
        product.setStockQuantity(request.getStockQuantity());
        product.setImageUrl(request.getImageUrl());
        
        // Determine availability
        if (request.getStockQuantity() <= 0) {
            product.setAvailabilityStatus("OUTOFSTOCK");
        } else if (request.getStockQuantity() <= request.getLowStockThreshold()) {
            product.setAvailabilityStatus("LOWSTOCK");
        } else {
            product.setAvailabilityStatus("INSTOCK");
        }

        Product savedProduct = productRepository.save(product);

        // Initialize Inventory record
        Inventory inventory = new Inventory(
                savedProduct,
                request.getLowStockThreshold(),
                request.getWarehouseLocation()
        );
        inventoryRepository.save(inventory);

        logger.info("Successfully created product: {} and initialized inventory", savedProduct.getName());

        return convertToDto(savedProduct);
    }

    @Override
    @Transactional
    public ProductDto updateProduct(Long id, ProductDto productDto) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));

        Category category = categoryRepository.findById(productDto.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", productDto.getCategoryId()));

        product.setName(productDto.getName());
        product.setDescription(productDto.getDescription());
        product.setCategory(category);
        product.setBrand(productDto.getBrand());
        product.setWeight(productDto.getWeight());
        product.setPrice(productDto.getPrice());
        product.setStockQuantity(productDto.getStockQuantity());
        product.setImageUrl(productDto.getImageUrl());

        // Update Availability Status based on stock and low stock threshold
        Inventory inventory = inventoryRepository.findByProductId(product.getId()).orElse(null);
        int threshold = (inventory != null) ? inventory.getLowStockThreshold() : 10;

        if (product.getStockQuantity() <= 0) {
            product.setAvailabilityStatus("OUTOFSTOCK");
        } else if (product.getStockQuantity() <= threshold) {
            product.setAvailabilityStatus("LOWSTOCK");
        } else {
            product.setAvailabilityStatus("INSTOCK");
        }

        Product updatedProduct = productRepository.save(product);
        logger.info("Successfully updated product: {}", updatedProduct.getName());

        return convertToDto(updatedProduct);
    }

    @Override
    public ProductDto getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));
        return convertToDto(product);
    }

    @Override
    public Page<ProductDto> getProducts(Long categoryId, String search, Pageable pageable) {
        Page<Product> productPage;

        if (categoryId != null && search != null && !search.trim().isEmpty()) {
            productPage = productRepository.findByCategoryIdAndNameContainingIgnoreCase(categoryId, search, pageable);
        } else if (categoryId != null) {
            productPage = productRepository.findByCategoryId(categoryId, pageable);
        } else if (search != null && !search.trim().isEmpty()) {
            productPage = productRepository.findByNameContainingIgnoreCaseOrDescriptionContainingIgnoreCase(search, search, pageable);
        } else {
            productPage = productRepository.findAll(pageable);
        }

        return productPage.map(this::convertToDto);
    }

    @Override
    @Transactional
    public void deleteProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));

        // Delete associated inventory record first to prevent foreign key issues
        inventoryRepository.findByProductId(product.getId()).ifPresent(inventoryRepository::delete);

        productRepository.delete(product);
        logger.info("Successfully deleted product with id: {}", id);
    }

    private ProductDto convertToDto(Product product) {
        ProductDto dto = new ProductDto();
        dto.setId(product.getId());
        dto.setName(product.getName());
        dto.setDescription(product.getDescription());
        if (product.getCategory() != null) {
            dto.setCategoryId(product.getCategory().getId());
            dto.setCategoryName(product.getCategory().getName());
        }
        dto.setBrand(product.getBrand());
        dto.setWeight(product.getWeight());
        dto.setPrice(product.getPrice());
        dto.setStockQuantity(product.getStockQuantity());
        dto.setImageUrl(product.getImageUrl());
        dto.setAvailabilityStatus(product.getAvailabilityStatus());
        return dto;
    }
}
