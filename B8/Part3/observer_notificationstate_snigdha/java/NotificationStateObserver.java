import java.util.ArrayList;
import java.util.List;

/** Observer-pattern adaptation of the notification state stream used by the RxJS UI. */
public class NotificationStateObserver {
    // Observer contract: interested views receive state changes.
    interface NotificationObserver {
        void onUnreadCountChanged(int unreadCount);
        void onLatestNotificationChanged(String latestNotification);
    }

    // Subject: stores current state and broadcasts updates to subscribers.
    static class NotificationsSubject {
        private final List<NotificationObserver> observers = new ArrayList<>();
        private int unreadCount = 0;
        private String latestNotification = "";

        void subscribe(NotificationObserver observer) {
            if (!observers.contains(observer)) observers.add(observer);
            // BehaviorSubject-like behaviour: immediately provide current state.
            observer.onUnreadCountChanged(unreadCount);
            observer.onLatestNotificationChanged(latestNotification);
        }
        void unsubscribe(NotificationObserver observer) { observers.remove(observer); }

        void publishNewNotification(String message) {
            latestNotification = message;
            unreadCount++;
            notifyObservers();
        }
        void markOneAsRead() {
            if (unreadCount > 0) unreadCount--;
            notifyObservers();
        }
        void markAllAsRead() {
            unreadCount = 0;
            notifyObservers();
        }
        private void notifyObservers() {
            for (NotificationObserver observer : new ArrayList<>(observers)) {
                observer.onUnreadCountChanged(unreadCount);
                observer.onLatestNotificationChanged(latestNotification);
            }
        }
        int getUnreadCount() { return unreadCount; }
    }

    // Example observer representing the application header's bell and panel.
    static class NotificationPanel implements NotificationObserver {
        int displayedUnreadCount;
        String displayedLatest = "";
        public void onUnreadCountChanged(int count) { displayedUnreadCount = count; }
        public void onLatestNotificationChanged(String message) { displayedLatest = message; }
    }
}
