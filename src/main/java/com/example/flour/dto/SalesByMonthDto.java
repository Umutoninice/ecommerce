package com.example.flour.dto;

import java.math.BigDecimal;

public class SalesByMonthDto {

    private int month;
    private int year;
    private BigDecimal amount;

    public SalesByMonthDto() {
    }

    public SalesByMonthDto(int month, int year, BigDecimal amount) {
        this.month = month;
        this.year = year;
        this.amount = amount;
    }

    public int getMonth() {
        return month;
    }

    public void setMonth(int month) {
        this.month = month;
    }

    public int getYear() {
        return year;
    }

    public void setYear(int year) {
        this.year = year;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }
}
