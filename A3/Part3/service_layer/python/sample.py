class PostingService:
    def __init__(self, store, sender):
        self.store = store
        self.sender = sender

    def post(self, signed_amount):
        account = self.store.load()
        if account is None:
            return False
        account["balance"] += signed_amount
        self.store.save(account)
        self.sender()
        return True
