class NotificationService { send(m){return `sent: ${m}`;} }
class AttendanceComponent {
 constructor(notificationService){this.notificationService=notificationService;}
 notify(){return this.notificationService.send('Attendance marked');}
}
module.exports={NotificationService,AttendanceComponent};
