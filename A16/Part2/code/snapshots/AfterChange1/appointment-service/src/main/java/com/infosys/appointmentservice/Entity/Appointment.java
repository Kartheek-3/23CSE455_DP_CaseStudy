package com.infosys.appointmentservice.Entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "appointments")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Appointment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long patientId;

    private String doctorName;

    private Long doctorId;

    private LocalDate appointmentDate;

    private String appointmentTime;

    private String status; // e.g., SCHEDULED, COMPLETED, CANCELLED
}
