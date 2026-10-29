package com.infosys.billingservice.entity;
import jakarta.persistence.*;
import java.math.BigDecimal;
@Entity @Table(name="invoices")
public class Invoice {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
 @Column(nullable=false) private Long patientId;
 @Column(nullable=false) private Long appointmentId;
 @Column(nullable=false, precision=12, scale=2) private BigDecimal amount;
 @Column(nullable=false) private String status="UNPAID";
 private String paymentReference;
 public Long getId(){return id;} public void setId(Long v){id=v;}
 public Long getPatientId(){return patientId;} public void setPatientId(Long v){patientId=v;}
 public Long getAppointmentId(){return appointmentId;} public void setAppointmentId(Long v){appointmentId=v;}
 public BigDecimal getAmount(){return amount;} public void setAmount(BigDecimal v){amount=v;}
 public String getStatus(){return status;} public void setStatus(String v){status=v;}
 public String getPaymentReference(){return paymentReference;} public void setPaymentReference(String v){paymentReference=v;}
}
