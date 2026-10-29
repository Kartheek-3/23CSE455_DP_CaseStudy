package com.infosys.pharmacyservice.controller;
import com.infosys.pharmacyservice.entity.MedicationOrder;
import com.infosys.pharmacyservice.repository.MedicationOrderRepository;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;
@RestController @RequestMapping("/orders")
public class MedicationOrderController {
 private final MedicationOrderRepository repository;
 public MedicationOrderController(MedicationOrderRepository repository) { this.repository=repository; }
 @PostMapping public MedicationOrder create(@RequestBody MedicationOrder value) { value.setId(null); return repository.save(value); }
 @GetMapping public List<MedicationOrder> list() { return repository.findAll(); }
 @GetMapping("/{id}") public MedicationOrder get(@PathVariable Long id) { return repository.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND)); }
}
