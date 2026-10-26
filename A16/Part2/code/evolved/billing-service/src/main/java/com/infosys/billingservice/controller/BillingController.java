package com.infosys.billingservice.controller;
import com.infosys.billingservice.entity.Invoice;
import com.infosys.billingservice.repository.InvoiceRepository;
import com.infosys.billingservice.service.BillingService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;
@RestController @RequestMapping("/billing/invoices")
public class BillingController {
 private final InvoiceRepository repository; private final BillingService billing;
 public BillingController(InvoiceRepository repository,BillingService billing){this.repository=repository;this.billing=billing;}
 @PostMapping public Invoice create(@RequestBody Invoice invoice){try{return billing.create(invoice);}catch(IllegalArgumentException e){throw new ResponseStatusException(HttpStatus.BAD_REQUEST,e.getMessage());}}
 @GetMapping public List<Invoice> list(){return repository.findAll();}
 @GetMapping("/{id}") public Invoice get(@PathVariable Long id){return repository.findById(id).orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND));}
 @PostMapping("/{id}/payments") public Invoice pay(@PathVariable Long id){try{return billing.pay(id);}catch(java.util.NoSuchElementException e){throw new ResponseStatusException(HttpStatus.NOT_FOUND,e.getMessage());}}
 @GetMapping("/payment-circuit") public String circuit(){return billing.circuitState();}
}
