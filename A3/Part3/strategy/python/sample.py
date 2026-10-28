class SecondFactor:
    def authenticate(self, code):
        raise NotImplementedError


class Totp(SecondFactor):
    def __init__(self, provider):
        self.provider = provider

    def authenticate(self, code):
        return self.provider(code)


class Recovery(SecondFactor):
    def __init__(self, provider):
        self.provider = provider

    def authenticate(self, code):
        return self.provider(code)


class Login:
    def __init__(self, strategy):
        self.strategy = strategy

    def authenticate(self, code):
        return self.strategy.authenticate(code)
