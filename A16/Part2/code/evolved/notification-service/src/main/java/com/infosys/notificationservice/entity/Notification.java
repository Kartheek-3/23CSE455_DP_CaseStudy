package com.infosys.notificationservice.entity;
import jakarta.persistence.*;
import java.time.Instant;
@Entity @Table(name="notifications")
public class Notification {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
 @Column(nullable=false) private Long patientId;
 private Long appointmentId;
 @Column(nullable=false) private String eventType;
 @Column(nullable=false) private String destination;
 @Column(nullable=false,length=1000) private String message;
 @Column(nullable=false) private String status="RECORDED";
 @Column(nullable=false) private Instant createdAt=Instant.now();
 public Long getId(){return id;} public void setId(Long v){id=v;}
 public Long getPatientId(){return patientId;} public void setPatientId(Long v){patientId=v;}
 public Long getAppointmentId(){return appointmentId;} public void setAppointmentId(Long v){appointmentId=v;}
 public String getEventType(){return eventType;} public void setEventType(String v){eventType=v;}
 public String getDestination(){return destination;} public void setDestination(String v){destination=v;}
 public String getMessage(){return message;} public void setMessage(String v){message=v;}
 public String getStatus(){return status;} public void setStatus(String v){status=v;}
 public Instant getCreatedAt(){return createdAt;} public void setCreatedAt(Instant v){createdAt=v;}
}
