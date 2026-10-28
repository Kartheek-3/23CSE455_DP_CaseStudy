package com.infosys.pharmacyservice.entity;
import jakarta.persistence.*;
@Entity @Table(name="orders_pharmacyservice")
public class MedicationOrder {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @Column(nullable=false) private Long patientId;
    @Column(nullable=false) private Long appointmentId;
    @Column(nullable=false) private String medicationName;
    @Column(nullable=false) private String dosage;
    private String status = "PENDING";
    public Long getId() { return id; } public void setId(Long id) { this.id=id; }
    public Long getPatientId() { return patientId; } public void setPatientId(Long patientId) { this.patientId=patientId; }
    public Long getAppointmentId() { return appointmentId; } public void setAppointmentId(Long appointmentId) { this.appointmentId=appointmentId; }
    public String getMedicationName() { return medicationName; } public void setMedicationName(String medicationName) { this.medicationName=medicationName; }
    public String getDosage() { return dosage; } public void setDosage(String dosage) { this.dosage=dosage; }
    public String getStatus() { return status; } public void setStatus(String status) { this.status=status; }
}
