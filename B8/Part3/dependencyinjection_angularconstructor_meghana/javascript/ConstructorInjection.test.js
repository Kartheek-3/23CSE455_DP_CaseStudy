const assert=require('node:assert/strict');
const {NotificationService,AttendanceComponent}=require('./ConstructorInjection');
const service=new NotificationService(), c=new AttendanceComponent(service);
assert.strictEqual(c.notificationService,service);
assert.equal(c.notify(),'sent: Attendance marked');
console.log('Constructor injection test passed');
