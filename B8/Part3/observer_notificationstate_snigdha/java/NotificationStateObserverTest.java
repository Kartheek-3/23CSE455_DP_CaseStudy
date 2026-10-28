/** Simple test runner for NotificationStateObserver. */
public class NotificationStateObserverTest {
    public static void main(String[] args) {
        NotificationStateObserver.NotificationsSubject subject =
            new NotificationStateObserver.NotificationsSubject();
        NotificationStateObserver.NotificationPanel panel =
            new NotificationStateObserver.NotificationPanel();

        subject.subscribe(panel);
        check(panel.displayedUnreadCount == 0, "Subscriber receives initial unread count");

        subject.publishNewNotification("Attendance marked successfully");
        check(panel.displayedUnreadCount == 1, "New notification increments unread count");
        check("Attendance marked successfully".equals(panel.displayedLatest),
              "Subscriber receives latest notification");

        subject.publishNewNotification("Class starts in 10 minutes");
        check(panel.displayedUnreadCount == 2, "Second notification increments count");
        subject.markOneAsRead();
        check(panel.displayedUnreadCount == 1, "Mark one read decrements count");
        subject.markAllAsRead();
        check(panel.displayedUnreadCount == 0, "Mark all read resets count");

        subject.unsubscribe(panel);
        subject.publishNewNotification("This update is no longer observed");
        check(panel.displayedUnreadCount == 0, "Unsubscribed observer receives no updates");

        System.out.println("All NotificationStateObserver tests passed.");
    }
    private static void check(boolean condition, String message) {
        if (!condition) throw new AssertionError(message);
    }
}
