package com.infosys.billingservice.service;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;
import java.math.BigDecimal;
import java.util.UUID;
@Component @Profile("!external-payments")
public class SimulatedPaymentProvider implements PaymentProvider {
 private final boolean simulateFailure;
 public SimulatedPaymentProvider(@org.springframework.beans.factory.annotation.Value("${payments.simulate-failure:false}") boolean simulateFailure){this.simulateFailure=simulateFailure;}
 @Override public String charge(Long invoiceId, BigDecimal amount) { if(simulateFailure) throw new IllegalStateException("Simulated payment provider failure."); if(amount==null || amount.signum()<=0) throw new IllegalArgumentException("Payment amount must be positive."); return "SIM-"+UUID.randomUUID(); }
}
