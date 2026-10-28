import json


class Broker:
    """Stands in for Redis plus the per-connection channel emitters."""

    def __init__(self):
        self._subscribers = {}

    def subscribe(self, channel, handler):
        self._subscribers.setdefault(channel, []).append(handler)

    def unsubscribe(self, channel, handler):
        handlers = self._subscribers.get(channel, [])
        if handler in handlers:
            handlers.remove(handler)

    def publish(self, channel, message):
        handlers = list(self._subscribers.get(channel, []))
        for handler in handlers:
            handler(channel, message)
        return len(handlers)


class GlobalEventService:
    def __init__(self, broker):
        self._broker = broker

    def publish_main_stream(self, user_id, event_type, body):
        return self._publish("mainStream:" + user_id, event_type, body)

    def publish_broadcast_stream(self, event_type, body):
        return self._publish("broadcast", event_type, body)

    def _publish(self, channel, event_type, body):
        message = json.dumps({"type": event_type, "body": body}, separators=(",", ":"))
        return self._broker.publish(channel, message)
