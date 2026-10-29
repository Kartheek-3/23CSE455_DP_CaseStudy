const assert=require('node:assert/strict');
const {AttendanceSubject,AttendanceNotification}=require('./AttendanceObserver');
const s=new AttendanceSubject(),o=new AttendanceNotification(); s.subscribe(o);
s.markAttendance('Member A'); assert.equal(o.events[0].member,'Member A');
s.unsubscribe(o); s.markAttendance('Member B'); assert.equal(o.events.length,1);
console.log('Attendance Observer tests passed');
