public class ConstructorInjectionTest {
 public static void main(String[] args){
  NotificationService s=new NotificationService(); AttendanceComponent c=new AttendanceComponent(s);
  if(!c.notifyMember().equals("sent: Attendance marked")) throw new AssertionError();
  System.out.println("Constructor injection test passed");
 }
}
