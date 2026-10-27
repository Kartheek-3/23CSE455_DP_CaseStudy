package com.infosys.billingservice.service;
import java.math.BigDecimal;
public interface PaymentProvider { String charge(Long invoiceId, BigDecimal amount); }
