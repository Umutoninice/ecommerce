package com.example.flour.controller;

import com.example.flour.dto.BestSellerDto;
import com.example.flour.dto.CustomerPurchaseReportDto;
import com.example.flour.dto.InventoryReportResponse;
import com.example.flour.dto.SalesReportResponse;
import com.example.flour.service.ReportService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;

@RestController
@RequestMapping("/api/reports")
@PreAuthorize("hasRole('ADMIN')")
public class ReportController {

    private static final Logger logger = LoggerFactory.getLogger(ReportController.class);
    private final ReportService reportService;

    @Autowired
    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @GetMapping("/sales")
    public ResponseEntity<SalesReportResponse> getSalesReport() {
        logger.info("REST request to pull sales report (ADMIN only)");
        SalesReportResponse report = reportService.getSalesReport();
        return ResponseEntity.ok(report);
    }

    @GetMapping("/best-sellers")
    public ResponseEntity<List<BestSellerDto>> getBestSellingFlours() {
        logger.info("REST request to pull best-selling flour products (ADMIN only)");
        List<BestSellerDto> report = reportService.getBestSellingFlours();
        return ResponseEntity.ok(report);
    }

    @GetMapping("/customers")
    public ResponseEntity<List<CustomerPurchaseReportDto>> getCustomerPurchaseReport() {
        logger.info("REST request to pull customer purchases report (ADMIN only)");
        List<CustomerPurchaseReportDto> report = reportService.getCustomerPurchaseReport();
        return ResponseEntity.ok(report);
    }

    @GetMapping("/inventory")
    public ResponseEntity<InventoryReportResponse> getInventoryReport() {
        logger.info("REST request to pull inventory logs and low stock report (ADMIN only)");
        InventoryReportResponse report = reportService.getInventoryReport();
        return ResponseEntity.ok(report);
    }
}
