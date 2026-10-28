from collections import namedtuple

Committed = namedtuple("Committed", "key value old_value")


class PreferencesManager:
    def __init__(self):
        self._state = {}
        self._listeners = []

    def on(self, listener):
        self._listeners.append(listener)

    def off(self, listener):
        if listener in self._listeners:
            self._listeners.remove(listener)

    def commit(self, key, value):
        if key in self._state and self._state[key] == value:
            return  # an unchanged value is not announced (manager.ts:254-257)
        self._state[key] = value
        # As in manager.ts:261-271, old_value is read after the state was updated, so it equals value.
        event = Committed(key, value, self._state[key])
        for listener in list(self._listeners):
            listener(event)
