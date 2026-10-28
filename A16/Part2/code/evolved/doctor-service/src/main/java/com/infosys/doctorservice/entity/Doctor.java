package com.infosys.doctorservice.entity;
import jakarta.persistence.*;
@Entity @Table(name="doctors_doctorservice")
public class Doctor {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @Column(nullable=false) private String name;
    @Column(nullable=false) private String specialty;
    private String email;
    private boolean active = true;
    public Long getId() { return id; } public void setId(Long id) { this.id=id; }
    public String getName() { return name; } public void setName(String name) { this.name=name; }
    public String getSpecialty() { return specialty; } public void setSpecialty(String specialty) { this.specialty=specialty; }
    public String getEmail() { return email; } public void setEmail(String email) { this.email=email; }
    public boolean getActive() { return active; } public void setActive(boolean active) { this.active=active; }
}
