package com.infosys.notificationservice.controller;
import com.infosys.notificationservice.entity.Notification;
import com.infosys.notificationservice.repository.NotificationRepository;
import com.infosys.notificationservice.service.NotificationService;
import org.springframework.http.HttpStatus; import org.springframework.web.bind.annotation.*; import org.springframework.web.server.ResponseStatusException;
import java.util.List;
@RestController @RequestMapping("/notifications")
public class NotificationController {
 private final NotificationRepository repository;private final NotificationService service;
 public NotificationController(NotificationRepository repository,NotificationService service){this.repository=repository;this.service=service;}
 @PostMapping public Notification create(@RequestBody Notification n){try{return service.create(n);}catch(IllegalArgumentException e){throw new ResponseStatusException(HttpStatus.BAD_REQUEST,e.getMessage());}}
 @GetMapping public List<Notification> list(){return repository.findAll();}
 @GetMapping("/{id}") public Notification get(@PathVariable Long id){return repository.findById(id).orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND));}
}
