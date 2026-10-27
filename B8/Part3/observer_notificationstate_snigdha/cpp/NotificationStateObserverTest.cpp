#include "NotificationStateObserver.hpp"
#include <cassert>
#include <iostream>

int main() {
    NotificationsSubject subject;
    NotificationPanel panel;
    subject.subscribe(&panel);
    assert(panel.state.unreadCount == 0);

    subject.publishNewNotification("Workout reminder");
    assert(panel.state.unreadCount == 1);
    assert(panel.state.latestNotification == "Workout reminder");

    subject.publishNewNotification("Class starts soon");
    subject.markOneAsRead();
    assert(panel.state.unreadCount == 1);
    subject.markAllAsRead();
    assert(panel.state.unreadCount == 0);

    subject.unsubscribe(&panel);
    subject.publishNewNotification("Not delivered");
    assert(panel.state.unreadCount == 0);

    std::cout << "All NotificationStateObserver tests passed.\\n";
    return 0;
}
