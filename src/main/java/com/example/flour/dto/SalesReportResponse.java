package com.example.flour.dto;

import java.math.BigDecimal;
import java.util.List;

public class SalesReportResponse {

    private BigDecimal totalSales;
    private long successfulOrdersCount;
    private BigDecimal averageOrderValue;
    private List<SalesByMonthDto> salesByMonth;

    public SalesReportResponse() {
    }

    public SalesReportResponse(BigDecimal totalSales, long successfulOrdersCount, BigDecimal averageOrderValue, List<SalesByMonthDto> salesByMonth) {
        this.totalSales = totalSales;
        this.successfulOrdersCount = successfulOrdersCount;
        this.averageOrderValue = averageOrderValue;
        this.salesByMonth = salesByMonth;
    }

    public BigDecimal getTotalSales() {
        return totalSales;
    }

    public void setTotalSales(BigDecimal totalSales) {
        this.totalSales = totalSales;
    }

    public long getSuccessfulOrdersCount() {
        return successfulOrdersCount;
    }

    public void setSuccessfulOrdersCount(long successfulOrdersCount) {
        this.successfulOrdersCount = successfulOrdersCount;
    }

    public BigDecimal getAverageOrderValue() {
        return averageOrderValue;
    }

    public void setAverageOrderValue(BigDecimal averageOrderValue) {
        this.averageOrderValue = averageOrderValue;
    }

    public List<SalesByMonthDto> getSalesByMonth() {
        return salesByMonth;
    }

    public void setSalesByMonth(List<SalesByMonthDto> salesByMonth) {
        this.salesByMonth = salesByMonth;
    }
}
