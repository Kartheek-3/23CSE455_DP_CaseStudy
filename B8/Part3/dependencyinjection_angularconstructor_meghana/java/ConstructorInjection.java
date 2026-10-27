class NotificationService { String send(String m){return "sent: "+m;} }
class AttendanceComponent {
 private final NotificationService service;
 AttendanceComponent(NotificationService service){this.service=service;}
 String notifyMember(){return service.send("Attendance marked");}
}
