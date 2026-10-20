package com.example.flour.repository;

import com.example.flour.entity.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {

    @Query("SELECT oi.product, SUM(oi.quantity) as totalQty " +
           "FROM OrderItem oi " +
           "JOIN oi.order o " +
           "WHERE o.status != 'CANCELLED' " +
           "GROUP BY oi.product " +
           "ORDER BY totalQty DESC")
    List<Object[]> findBestSellingProducts();
}
