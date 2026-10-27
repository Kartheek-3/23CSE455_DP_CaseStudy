class EmailAdapter:
    def __init__(self, vendor):
        self.vendor = vendor

    def send(self, receiver, message):
        try:
            status = self.vendor({"to": receiver, "html": message})
            return "sent" if status == 202 else "failed"
        except RuntimeError:
            return "failed"
