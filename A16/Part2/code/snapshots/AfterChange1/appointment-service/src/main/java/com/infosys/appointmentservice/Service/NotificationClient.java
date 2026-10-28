package com.infosys.appointmentservice.Service;
import org.slf4j.Logger;import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import java.time.Duration;
@Component
public class NotificationClient {
 private static final Logger log=LoggerFactory.getLogger(NotificationClient.class);private final WebClient.Builder client;
 public NotificationClient(WebClient.Builder client){this.client=client;}
 public void notify(Long patientId,Long appointmentId,String event,String message){
  try{client.build().post().uri("http://NOTIFICATION-SERVICE/notifications").bodyValue(new NotificationRequest(patientId,appointmentId,event,"patient-"+patientId+"@local.invalid",message)).retrieve().toBodilessEntity().block(Duration.ofSeconds(2));}
  catch(RuntimeException failure){log.warn("Notification service unavailable for appointment {} event {}",appointmentId,event);}
 }
 private record NotificationRequest(Long patientId,Long appointmentId,String eventType,String destination,String message){}
}
