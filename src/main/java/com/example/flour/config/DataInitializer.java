package com.example.flour.config;

import com.example.flour.entity.Category;
import com.example.flour.entity.Inventory;
import com.example.flour.entity.Product;
import com.example.flour.repository.CategoryRepository;
import com.example.flour.repository.InventoryRepository;
import com.example.flour.repository.ProductRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);

    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final InventoryRepository inventoryRepository;

    @Autowired
    public DataInitializer(CategoryRepository categoryRepository,
                           ProductRepository productRepository,
                           InventoryRepository inventoryRepository) {
        this.categoryRepository = categoryRepository;
        this.productRepository = productRepository;
        this.inventoryRepository = inventoryRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        logger.info("Initializing baseline default categories & products if database is empty...");

        Category wheatCat = categoryRepository.findByName("Wheat Flour")
                .orElseGet(() -> categoryRepository.save(new Category("Wheat Flour", "Premium ground wheat flours for baking and everyday cooking")));

        Category maizeCat = categoryRepository.findByName("Maize Flour")
                .orElseGet(() -> categoryRepository.save(new Category("Maize Flour", "Top-quality local maize meal (Ubugali) and corn flour")));

        Category specCat = categoryRepository.findByName("Specialty Flour")
                .orElseGet(() -> categoryRepository.save(new Category("Specialty Flour", "Gluten-free, cassava, sorghum, and millet flours")));

        if (productRepository.count() == 0) {
            // Product 1: Azania PPF
            Product p1 = new Product(
                    "Azania PPF Pure Patent Flour",
                    "Premium pure patent wheat flour ideal for high quality pastries, breads, mandazi, and chapati.",
                    "Azania",
                    "25kg",
                    new BigDecimal("19500.00"),
                    150,
                    "/images/azania-ppf.jpg",
                    "INSTOCK",
                    wheatCat
            );
            p1 = productRepository.save(p1);
            inventoryRepository.save(new Inventory(p1, 15, "Kigali Free Zone, Block A"));

            // Product 2: Azam Home Baking
            Product p2 = new Product(
                    "Azam Home Baking Flour",
                    "100% Super Fine wheat flour, Africa's No. 1 choice for home baking, mandazi, and chapatis.",
                    "Azam",
                    "5kg",
                    new BigDecimal("4500.00"),
                    120,
                    "/images/azam-wheat-flour.jpg",
                    "INSTOCK",
                    wheatCat
            );
            p2 = productRepository.save(p2);
            inventoryRepository.save(new Inventory(p2, 10, "Kigali Free Zone, Block A"));

            // Product 3: Kinazi Cassava Flour
            Product p3 = new Product(
                    "Kinazi Fine Cassava Flour",
                    "High quality 100% fine cassava flour processed locally by Kinazi Cassava Plant Ltd for daily meals.",
                    "Kinazi",
                    "10kg",
                    new BigDecimal("9000.00"),
                    80,
                    "/images/kinazi-cassava-flour.jpg",
                    "INSTOCK",
                    specCat
            );
            p3 = productRepository.save(p3);
            inventoryRepository.save(new Inventory(p3, 10, "Kigali Free Zone, Block B"));

            // Product 4: Akubuzimafarine Maize Flour
            Product p4 = new Product(
                    "Akubuzimafarine Kawunga Grade 1 Maize Flour",
                    "Super quality Grade 1 white maize meal (Kawunga) made in Rwanda (Kayonza-Nyamirama) for soft Ubugali.",
                    "Akubuzimafarine",
                    "25kg",
                    new BigDecimal("16500.00"),
                    200,
                    "/images/maize-flour.jpg",
                    "INSTOCK",
                    maizeCat
            );
            p4 = productRepository.save(p4);
            inventoryRepository.save(new Inventory(p4, 20, "Kigali Free Zone, Block C"));

            logger.info("Successfully seeded 4 authentic flour products into the database.");
        }
    }
}
