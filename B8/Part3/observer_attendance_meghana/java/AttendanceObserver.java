import java.util.*;
interface AttendanceObserver { void update(String event); }
class AttendanceSubject {
 private final List<AttendanceObserver> observers=new ArrayList<>();
 void subscribe(AttendanceObserver o){if(!observers.contains(o))observers.add(o);}
 void unsubscribe(AttendanceObserver o){observers.remove(o);}
 void markAttendance(String member){String event="attendance_marked:"+member; for(AttendanceObserver o:observers)o.update(event);}
}
class AttendanceNotification implements AttendanceObserver {
 final List<String> events=new ArrayList<>();
 public void update(String event){events.add(event);}
}
