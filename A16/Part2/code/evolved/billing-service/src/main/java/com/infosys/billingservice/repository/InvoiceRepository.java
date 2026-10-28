package com.infosys.billingservice.repository;
import com.infosys.billingservice.entity.Invoice;
import org.springframework.data.jpa.repository.JpaRepository;
public interface InvoiceRepository extends JpaRepository<Invoice,Long> {}
