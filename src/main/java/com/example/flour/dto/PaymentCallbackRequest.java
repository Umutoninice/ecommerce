package com.example.flour.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public class PaymentCallbackRequest {

    @NotBlank(message = "Transaction reference is required")
    private String transactionReference;

    @NotBlank(message = "Status is required")
    @Pattern(regexp = "^(PAID|FAILED)$", message = "Status must be either PAID or FAILED")
    private String status;

    public PaymentCallbackRequest() {
    }

    public PaymentCallbackRequest(String transactionReference, String status) {
        this.transactionReference = transactionReference;
        this.status = status;
    }

    public String getTransactionReference() {
        return transactionReference;
    }

    public void setTransactionReference(String transactionReference) {
        this.transactionReference = transactionReference;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
