public class AttendanceObserverTest {
 public static void main(String[] args){
  AttendanceSubject s=new AttendanceSubject(); AttendanceNotification o=new AttendanceNotification();
  s.subscribe(o); s.markAttendance("Member A");
  if(o.events.size()!=1 || !o.events.get(0).contains("Member A")) throw new AssertionError();
  s.unsubscribe(o); s.markAttendance("Member B"); if(o.events.size()!=1) throw new AssertionError();
  System.out.println("Attendance Observer tests passed");
 }
}
