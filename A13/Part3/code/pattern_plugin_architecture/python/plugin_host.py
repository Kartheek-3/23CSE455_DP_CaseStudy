class PluginHost:
    def __init__(self):
        self._contexts = set()
        self._handlers = []  # (plugin id, handler type, function)

    def install(self, plugin_id, setup):
        self._contexts.add(plugin_id)

        def add_handler(handler_type, fn):
            self._handlers.append((plugin_id, handler_type, fn))

        setup(add_handler)  # an error here propagates; handlers added so far stay registered

    def abort(self, plugin_id):
        if plugin_id not in self._contexts:
            return
        self._contexts.discard(plugin_id)
        self._handlers = [h for h in self._handlers if h[0] != plugin_id]

    def get_handlers(self, handler_type):
        return [fn for _, t, fn in self._handlers if t == handler_type]
