package com.infosys.notificationservice.service;
import com.infosys.notificationservice.entity.Notification;
import com.infosys.notificationservice.repository.NotificationRepository;
import org.springframework.stereotype.Service;
@Service public class NotificationService {
 private final NotificationRepository repository; private final NotificationSender sender;
 public NotificationService(NotificationRepository repository,NotificationSender sender){this.repository=repository;this.sender=sender;}
 public Notification create(Notification n){if(n.getPatientId()==null||n.getEventType()==null||n.getDestination()==null||n.getMessage()==null) throw new IllegalArgumentException("patientId, eventType, destination and message are required."); n.setId(null);n.setStatus("QUEUED");Notification saved=repository.save(n);try{sender.send(saved);saved.setStatus("RECORDED");}catch(RuntimeException e){saved.setStatus("DELIVERY_FAILED");}return repository.save(saved);}
}
