#ifndef NOTIFICATION_STATE_OBSERVER_HPP
#define NOTIFICATION_STATE_OBSERVER_HPP

#include <algorithm>
#include <string>
#include <vector>

struct NotificationState {
    int unreadCount = 0;
    std::string latestNotification;
};

class NotificationObserver {
public:
    virtual ~NotificationObserver() = default;
    virtual void update(const NotificationState& state) = 0;
};

class NotificationsSubject {
    NotificationState state;
    std::vector<NotificationObserver*> observers;

    void notifyObservers() {
        for (auto* observer : observers) observer->update(state);
    }

public:
    void subscribe(NotificationObserver* observer) {
        if (std::find(observers.begin(), observers.end(), observer) == observers.end())
            observers.push_back(observer);
        observer->update(state); // BehaviorSubject-like initial delivery
    }

    void unsubscribe(NotificationObserver* observer) {
        observers.erase(std::remove(observers.begin(), observers.end(), observer),
                        observers.end());
    }

    void publishNewNotification(const std::string& message) {
        ++state.unreadCount;
        state.latestNotification = message;
        notifyObservers();
    }

    void markOneAsRead() {
        if (state.unreadCount > 0) --state.unreadCount;
        notifyObservers();
    }

    void markAllAsRead() {
        state.unreadCount = 0;
        notifyObservers();
    }
};

class NotificationPanel : public NotificationObserver {
public:
    NotificationState state;
    void update(const NotificationState& newState) override { state = newState; }
};

#endif
