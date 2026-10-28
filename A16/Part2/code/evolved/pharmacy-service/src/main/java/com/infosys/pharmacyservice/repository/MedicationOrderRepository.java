package com.infosys.pharmacyservice.repository;
import com.infosys.pharmacyservice.entity.MedicationOrder;
import org.springframework.data.jpa.repository.JpaRepository;
public interface MedicationOrderRepository extends JpaRepository<MedicationOrder,Long> {}
