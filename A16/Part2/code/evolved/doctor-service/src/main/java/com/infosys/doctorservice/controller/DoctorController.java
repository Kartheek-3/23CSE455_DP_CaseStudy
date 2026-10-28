package com.infosys.doctorservice.controller;
import com.infosys.doctorservice.entity.Doctor;
import com.infosys.doctorservice.repository.DoctorRepository;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;
@RestController @RequestMapping("/doctors")
public class DoctorController {
 private final DoctorRepository repository;
 public DoctorController(DoctorRepository repository) { this.repository=repository; }
 @PostMapping public Doctor create(@RequestBody Doctor value) { value.setId(null); return repository.save(value); }
 @GetMapping public List<Doctor> list() { return repository.findAll(); }
 @GetMapping("/{id}") public Doctor get(@PathVariable Long id) { return repository.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND)); }
}
