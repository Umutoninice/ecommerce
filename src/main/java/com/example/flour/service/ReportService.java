package com.example.flour.service;

import com.example.flour.dto.BestSellerDto;
import com.example.flour.dto.CustomerPurchaseReportDto;
import com.example.flour.dto.InventoryReportResponse;
import com.example.flour.dto.SalesReportResponse;
import java.util.List;

public interface ReportService {
    SalesReportResponse getSalesReport();
    List<BestSellerDto> getBestSellingFlours();
    List<CustomerPurchaseReportDto> getCustomerPurchaseReport();
    InventoryReportResponse getInventoryReport();
}
