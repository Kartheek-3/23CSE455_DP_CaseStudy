class Email: 
    def send(self): return "email"
class Audit:
    def send(self): return "audit"
class NotifierFactory:
    def create(self, kind): return Email() if kind == "email" else Audit()
def demo():
    factory=NotifierFactory(); return factory.create("email").send() == "email" and factory.create("audit").send() == "audit"

