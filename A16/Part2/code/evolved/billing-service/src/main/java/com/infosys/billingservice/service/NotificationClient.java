package com.infosys.billingservice.service;
import com.infosys.billingservice.entity.Invoice;
import org.slf4j.Logger;import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;import org.springframework.web.reactive.function.client.WebClient;import java.time.Duration;
@Component public class NotificationClient {
 private static final Logger log=LoggerFactory.getLogger(NotificationClient.class); private final WebClient.Builder client;
 public NotificationClient(WebClient.Builder client){this.client=client;}
 public void send(Invoice invoice,String event,String message){try{client.build().post().uri("http://NOTIFICATION-SERVICE/notifications").bodyValue(new Notice(invoice.getPatientId(),invoice.getAppointmentId(),event,"patient-"+invoice.getPatientId()+"@local.invalid",message)).retrieve().toBodilessEntity().block(Duration.ofSeconds(2));}catch(RuntimeException e){log.warn("Notification service unavailable for invoice {} event {}",invoice.getId(),event);}}
 private record Notice(Long patientId,Long appointmentId,String eventType,String destination,String message){}
}
