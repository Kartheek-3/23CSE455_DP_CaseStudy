package com.infosys.notificationservice.service;
import com.infosys.notificationservice.entity.Notification;
import org.slf4j.Logger; import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
@Component public class LoggingNotificationSender implements NotificationSender {
 private static final Logger log=LoggerFactory.getLogger(LoggingNotificationSender.class);
 @Override public void send(Notification n){log.info("Notification queued: event={}, patientId={}, appointmentId={}",n.getEventType(),n.getPatientId(),n.getAppointmentId());}
}
