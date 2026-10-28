class Publisher:
    def __init__(self): self.observers = []
    def subscribe(self, observer): self.observers.append(observer)
    def publish(self, identifier):
        for observer in self.observers: observer(identifier)
def demo():
    seen=[]; publisher=Publisher(); publisher.subscribe(lambda x: seen.append("email:"+x)); publisher.subscribe(lambda x: seen.append("audit:"+x)); publisher.publish("t1")
    return seen == ["email:t1", "audit:t1"]

