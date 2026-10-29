from constructor_injection import NotificationService, AttendanceComponent
service=NotificationService(); component=AttendanceComponent(service)
assert component.notification_service is service
assert component.notify()=="sent: Attendance marked"
print("Constructor injection test passed")
