package com.infosys.billingservice;
import com.infosys.billingservice.entity.Invoice;
import com.infosys.billingservice.repository.InvoiceRepository;
import com.infosys.billingservice.service.*;
import org.junit.jupiter.api.Test;
import java.math.BigDecimal;
import java.time.*;
import java.util.Optional;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
class BillingServiceTest {
 private Invoice invoice(){Invoice i=new Invoice();i.setId(8L);i.setPatientId(3L);i.setAppointmentId(4L);i.setAmount(new BigDecimal("150.00"));i.setStatus("UNPAID");return i;}
 @Test void successfulPaymentMarksInvoicePaid(){InvoiceRepository repo=mock(InvoiceRepository.class);PaymentProvider provider=(id,amount)->"ref-8";NotificationClient notices=mock(NotificationClient.class);Invoice i=invoice();when(repo.findById(8L)).thenReturn(Optional.of(i));when(repo.save(any())).thenAnswer(x->x.getArgument(0));BillingService service=new BillingService(repo,provider,new PaymentCircuitBreaker(2,Duration.ofSeconds(1),Clock.systemUTC()),notices);assertEquals("PAID",service.pay(8L).getStatus());assertEquals("ref-8",i.getPaymentReference());verify(notices).send(i,"PAYMENT_CONFIRMED","Your invoice payment was confirmed.");}
 @Test void providerFailurePersistsRetryRequiredAndNotifies(){InvoiceRepository repo=mock(InvoiceRepository.class);PaymentProvider provider=(id,amount)->{throw new IllegalStateException("provider down");};NotificationClient notices=mock(NotificationClient.class);Invoice i=invoice();when(repo.findById(8L)).thenReturn(Optional.of(i));when(repo.save(any())).thenAnswer(x->x.getArgument(0));BillingService service=new BillingService(repo,provider,new PaymentCircuitBreaker(1,Duration.ofSeconds(10),Clock.systemUTC()),notices);assertEquals("PAYMENT_RETRY_REQUIRED",service.pay(8L).getStatus());assertEquals("OPEN",service.circuitState());verify(notices).send(i,"PAYMENT_RETRY_REQUIRED","Your invoice payment needs to be retried.");}
}
