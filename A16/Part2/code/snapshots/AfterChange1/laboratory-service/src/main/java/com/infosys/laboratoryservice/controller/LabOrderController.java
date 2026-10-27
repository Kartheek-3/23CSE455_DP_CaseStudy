package com.infosys.laboratoryservice.controller;
import com.infosys.laboratoryservice.entity.LabOrder;
import com.infosys.laboratoryservice.repository.LabOrderRepository;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;
@RestController @RequestMapping("/orders")
public class LabOrderController {
 private final LabOrderRepository repository;
 public LabOrderController(LabOrderRepository repository) { this.repository=repository; }
 @PostMapping public LabOrder create(@RequestBody LabOrder value) { value.setId(null); return repository.save(value); }
 @GetMapping public List<LabOrder> list() { return repository.findAll(); }
 @GetMapping("/{id}") public LabOrder get(@PathVariable Long id) { return repository.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND)); }
}
