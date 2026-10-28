package com.infosys.billingservice.service;
import com.infosys.billingservice.entity.Invoice;
import com.infosys.billingservice.repository.InvoiceRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
@Service public class BillingService {
 private final InvoiceRepository invoices; private final PaymentProvider provider; private final PaymentCircuitBreaker breaker; private final NotificationClient notifications;
 public BillingService(InvoiceRepository invoices,PaymentProvider provider,PaymentCircuitBreaker breaker,NotificationClient notifications){this.invoices=invoices;this.provider=provider;this.breaker=breaker;this.notifications=notifications;}
 public Invoice create(Invoice invoice){if(invoice.getAmount()==null || invoice.getAmount().signum()<=0) throw new IllegalArgumentException("Invoice amount must be positive."); invoice.setId(null); invoice.setStatus("UNPAID"); return invoices.save(invoice);}
 @Transactional public Invoice pay(Long id){Invoice invoice=invoices.findById(id).orElseThrow(()->new java.util.NoSuchElementException("Invoice not found."));
  if("PAID".equals(invoice.getStatus())) return invoice;
  try {String reference=breaker.execute(()->provider.charge(invoice.getId(),invoice.getAmount())); invoice.setPaymentReference(reference); invoice.setStatus("PAID");}
  catch(RuntimeException failure){invoice.setStatus("PAYMENT_RETRY_REQUIRED");}
  Invoice saved=invoices.save(invoice);
  notifications.send(saved,"PAID".equals(saved.getStatus())?"PAYMENT_CONFIRMED":"PAYMENT_RETRY_REQUIRED","PAID".equals(saved.getStatus())?"Your invoice payment was confirmed.":"Your invoice payment needs to be retried.");
  return saved;
 }
 public String circuitState(){return breaker.state();}
}
