package com.infosys.laboratoryservice.entity;
import jakarta.persistence.*;
@Entity @Table(name="orders_laboratoryservice")
public class LabOrder {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @Column(nullable=false) private Long patientId;
    @Column(nullable=false) private Long appointmentId;
    @Column(nullable=false) private String testName;
    private String status = "ORDERED";
    public Long getId() { return id; } public void setId(Long id) { this.id=id; }
    public Long getPatientId() { return patientId; } public void setPatientId(Long patientId) { this.patientId=patientId; }
    public Long getAppointmentId() { return appointmentId; } public void setAppointmentId(Long appointmentId) { this.appointmentId=appointmentId; }
    public String getTestName() { return testName; } public void setTestName(String testName) { this.testName=testName; }
    public String getStatus() { return status; } public void setStatus(String status) { this.status=status; }
}
