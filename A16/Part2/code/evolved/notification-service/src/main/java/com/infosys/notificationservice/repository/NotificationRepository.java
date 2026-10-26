package com.infosys.notificationservice.repository;
import com.infosys.notificationservice.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
public interface NotificationRepository extends JpaRepository<Notification,Long> {}
