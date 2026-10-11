class AttendanceSubject {
 constructor(){this.observers=new Set();}
 subscribe(o){this.observers.add(o);}
 unsubscribe(o){this.observers.delete(o);}
 markAttendance(member){const event={type:'attendance_marked',member}; for(const o of this.observers)o.update(event);}
}
class AttendanceNotification { constructor(){this.events=[];} update(event){this.events.push(event);} }
module.exports={AttendanceSubject,AttendanceNotification};
