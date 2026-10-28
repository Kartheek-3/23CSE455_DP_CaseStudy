import unittest
from notification_state import NotificationsSubject, NotificationPanel


class NotificationObserverTests(unittest.TestCase):
    def test_subscriber_receives_initial_state(self):
        subject, panel = NotificationsSubject(), NotificationPanel()
        subject.subscribe(panel.update)
        self.assertEqual(panel.state.unread_count, 0)
        self.assertIsNone(panel.state.latest_notification)

    def test_new_notification_updates_observer(self):
        subject, panel = NotificationsSubject(), NotificationPanel()
        subject.subscribe(panel.update)
        subject.publish_new_notification("Workout reminder")
        self.assertEqual(panel.state.unread_count, 1)
        self.assertEqual(panel.state.latest_notification, "Workout reminder")

    def test_mark_one_and_all_as_read(self):
        subject, panel = NotificationsSubject(), NotificationPanel()
        subject.subscribe(panel.update)
        subject.publish_new_notification("A")
        subject.publish_new_notification("B")
        subject.mark_one_as_read()
        self.assertEqual(panel.state.unread_count, 1)
        subject.mark_all_as_read()
        self.assertEqual(panel.state.unread_count, 0)

    def test_unsubscribe_stops_updates(self):
        subject, panel = NotificationsSubject(), NotificationPanel()
        subject.subscribe(panel.update)
        subject.unsubscribe(panel.update)
        subject.publish_new_notification("Not delivered")
        self.assertEqual(panel.state.unread_count, 0)


if __name__ == "__main__":
    unittest.main()
