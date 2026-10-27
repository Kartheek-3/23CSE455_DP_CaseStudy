package com.infosys.patientservice.Controller;

import com.infosys.patientservice.Entity.Patient;
import com.infosys.patientservice.Repository.PatientRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/patients")
public class PatientController {

    @Autowired
    private PatientRepo patientRepo;

    @PostMapping
    public Patient createPatient(@RequestBody Patient patient) {
        return patientRepo.save(patient);
    }

    @GetMapping
    public List<Patient> getAllPatients() {
        return patientRepo.findAll();
    }

    @GetMapping("/{id}")
    public Patient getPatientById(@PathVariable Long id) {
        return patientRepo.findById(id).orElse(null);
    }

    @PutMapping("/{id}")
    public Patient updatePatient(@PathVariable Long id, @RequestBody Patient patientDetails) {
        Patient patient = patientRepo.findById(id).orElse(null);
        if (patient != null) {
            patient.setName(patientDetails.getName());
            patient.setAge(patientDetails.getAge());
            patient.setGender(patientDetails.getGender());
            patient.setPhone(patientDetails.getPhone());
            patient.setAddress(patientDetails.getAddress());
            return patientRepo.save(patient);
        }
        return null;
    }

    @DeleteMapping("/{id}")
    public boolean deletePatient(@PathVariable Long id) {
        if (patientRepo.existsById(id)) {
            patientRepo.deleteById(id);
            return true;
        }
        return false;
    }
}
