package com.infosys.notificationservice;
import com.infosys.notificationservice.entity.Notification;
import com.infosys.notificationservice.repository.NotificationRepository;
import com.infosys.notificationservice.service.*;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
class NotificationServiceTest {
 @Test void storesNotificationRecord(){NotificationRepository repo=mock(NotificationRepository.class);NotificationSender sender=mock(NotificationSender.class);when(repo.save(any())).thenAnswer(call->call.getArgument(0));NotificationService service=new NotificationService(repo,sender);Notification n=new Notification();n.setPatientId(7L);n.setEventType("APPOINTMENT_CONFIRMED");n.setDestination("test@example.invalid");n.setMessage("confirmed");assertEquals("RECORDED",service.create(n).getStatus());}
 @Test void retainsFailedDeliveryWithoutThrowing(){NotificationRepository repo=mock(NotificationRepository.class);NotificationSender sender=mock(NotificationSender.class);when(repo.save(any())).thenAnswer(call->call.getArgument(0));doThrow(new IllegalStateException("transport down")).when(sender).send(any());NotificationService service=new NotificationService(repo,sender);Notification n=new Notification();n.setPatientId(7L);n.setEventType("APPOINTMENT_CONFIRMED");n.setDestination("test@example.invalid");n.setMessage("confirmed");assertEquals("DELIVERY_FAILED",service.create(n).getStatus());verify(repo,times(2)).save(any());}
}
