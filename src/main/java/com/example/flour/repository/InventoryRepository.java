package com.example.flour.repository;

import com.example.flour.entity.Inventory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface InventoryRepository extends JpaRepository<Inventory, Long> {
    Optional<Inventory> findByProductId(Long productId);

    @Query("SELECT i FROM Inventory i JOIN FETCH i.product p WHERE p.stockQuantity <= i.lowStockThreshold")
    List<Inventory> findLowStockInventories();
}
