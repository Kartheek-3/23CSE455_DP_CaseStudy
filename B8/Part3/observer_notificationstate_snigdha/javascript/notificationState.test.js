const assert = require('node:assert/strict');
const { NotificationsSubject, NotificationPanel } = require('./notificationState');

const subject = new NotificationsSubject();
const panel = new NotificationPanel();
const unsubscribe = subject.subscribe(state => panel.update(state));
assert.equal(panel.state.unreadCount, 0);

subject.publishNewNotification('Workout reminder');
assert.equal(panel.state.unreadCount, 1);
assert.equal(panel.state.latestNotification, 'Workout reminder');

subject.publishNewNotification('Class starts soon');
subject.markOneAsRead();
assert.equal(panel.state.unreadCount, 1);
subject.markAllAsRead();
assert.equal(panel.state.unreadCount, 0);

unsubscribe();
subject.publishNewNotification('Not delivered');
assert.equal(panel.state.unreadCount, 0);

console.log('All NotificationStateObserver tests passed.');
