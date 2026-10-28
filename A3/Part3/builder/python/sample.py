class HeaderBuilder:
    def __init__(self):
        self.headers = {}

    def add(self, key, value):
        if not key:
            raise ValueError("key required")
        self.headers[key] = value
        return self

    def remove(self, key):
        self.headers.pop(key, None)
        return self

    def build(self):
        return dict(self.headers)
