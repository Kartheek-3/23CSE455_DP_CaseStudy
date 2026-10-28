class AttendanceSubject:
    def __init__(self): self.observers=[]
    def subscribe(self,o):
        if o not in self.observers: self.observers.append(o)
    def unsubscribe(self,o):
        if o in self.observers: self.observers.remove(o)
    def mark_attendance(self,member):
        event={"type":"attendance_marked","member":member}
        for o in list(self.observers): o.update(event)
class AttendanceNotification:
    def __init__(self): self.events=[]
    def update(self,event): self.events.append(event)
