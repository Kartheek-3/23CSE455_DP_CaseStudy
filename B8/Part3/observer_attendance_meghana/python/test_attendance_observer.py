from attendance_observer import *
s=AttendanceSubject(); o=AttendanceNotification(); s.subscribe(o)
s.mark_attendance("Member A"); assert o.events[0]["member"]=="Member A"
s.unsubscribe(o); s.mark_attendance("Member B"); assert len(o.events)==1
print("Attendance Observer tests passed")
