class PrettyConsoleBackend:
    name = "pretty"

    def write(self, level, message):
        return f"[{level.upper()}] {message}"


class JsonConsoleBackend:
    name = "json"

    def write(self, level, message):
        return '{"level":"%s","message":"%s"}' % (level, message)


def create_logging_backend(fmt):
    if fmt is None or fmt == "pretty":
        return PrettyConsoleBackend()
    if fmt == "json":
        return JsonConsoleBackend()
    raise ValueError("logging.format must be either pretty or json")
