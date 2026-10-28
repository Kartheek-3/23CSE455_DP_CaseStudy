package com.infosys.doctorservice.repository;
import com.infosys.doctorservice.entity.Doctor;
import org.springframework.data.jpa.repository.JpaRepository;
public interface DoctorRepository extends JpaRepository<Doctor,Long> {}
