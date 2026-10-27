# Change 3 — Notification service and workflow events

## Before / after

Before, no notification service or event record existed. After, Notification persists event type, patient/appointment IDs, destination, message, status and timestamp. Appointment confirmation/cancellation and payment outcomes call it through a load-balanced WebClient. Calls have a 2-second bound and failures are caught so they do not reverse clinical or billing updates. The default `LoggingNotificationSender` records locally; it does not send email/SMS. Delivery attempts end in `RECORDED` or `DELIVERY_FAILED`.

## Source areas

`notification-service/src/main/java/com/infosys/notificationservice/` (entity, repository, service, sender and controller); `appointment-service/src/main/java/com/infosys/appointmentservice/Service/NotificationClient.java`; `appointment-service/src/main/java/com/infosys/appointmentservice/Controller/AppointmentController.java`; `billing-service/src/main/java/com/infosys/billingservice/service/NotificationClient.java`; `billing-service/src/main/java/com/infosys/billingservice/service/BillingService.java`; Gateway routes and root `pom.xml`.

## Verification

`NotificationServiceTest` checks recorded delivery and retained failure records. Integration smoke records appointment confirmation/cancellation and payment outcomes and reads them through Gateway. Four records were present in the isolated run.
