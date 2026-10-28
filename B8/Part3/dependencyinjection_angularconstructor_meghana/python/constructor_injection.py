class NotificationService:
    def send(self, message): return "sent: " + message
class AttendanceComponent:
    def __init__(self, notification_service): self.notification_service=notification_service
    def notify(self): return self.notification_service.send("Attendance marked")
