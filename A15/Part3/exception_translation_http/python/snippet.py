class HttpError(Exception):                     # TranslatedException (base): carries the HTTP status and a message
    status = 500

    def __init__(self, message):
        super().__init__(message)
        self.message = message


class BadRequest(HttpError):
    status = 400


class NotFound(HttpError):
    status = 404


class AccountService:                           # Raiser
    def deposit(self, amount):
        if amount <= 0:
            raise BadRequest("Deposit must be positive")
        return "ok"

    def find(self, id):
        if id != 1:
            raise NotFound("Account not found")
        return "account 1"

    def boom(self):
        raise RuntimeError("unexpected")


def translate(action):                          # Translator: the boundary that turns exceptions into responses
    try:
        return "200 " + action()
    except HttpError as e:
        return "%d %s" % (e.status, e.message)
    except Exception:
        return "500 Internal error"
