class Observer:
    def update(self, order_id, status):
        pass


class Admin(Observer):
    def update(self, order_id, status):
        print(f"Admin notified: Order {order_id} is {status}")


class Restaurant(Observer):
    def update(self, order_id, status):
        print(f"Restaurant notified: Order {order_id} is {status}")


class DeliveryPerson(Observer):
    def __init__(self, name):
        self.name = name

    def update(self, order_id, status):
        print(f"{self.name} notified: Order {order_id} is {status}")


class Order:
    def __init__(self, order_id):
        self.order_id = order_id
        self.status = None
        self.observers = []

    def add_observer(self, observer):
        self.observers.append(observer)

    def set_status(self, status):
        self.status = status
        for observer in self.observers:
            observer.update(self.order_id, status)


class DeliveryPartner:
    def __init__(self, name, available, priority):
        self.name = name
        self.available = available
        self.priority = priority


class DeliveryStrategy:
    def assign(self, partners):
        pass


class AvailabilityStrategy(DeliveryStrategy):
    def assign(self, partners):
        for partner in partners:
            if partner.available:
                return partner
        return None


class PriorityStrategy(DeliveryStrategy):
    def assign(self, partners):
        available = [partner for partner in partners if partner.available]
        if not available:
            return None
        return max(available, key=lambda partner: partner.priority)


class DeliveryAssignment:
    def __init__(self, strategy):
        self.strategy = strategy

    def assign_order(self, partners):
        partner = self.strategy.assign(partners)

        if partner:
            print("Assigned to:", partner.name)
        else:
            print("No delivery partner available")


print("Observer:")

order = Order("O101")
order.add_observer(Admin())
order.add_observer(Restaurant())
order.add_observer(DeliveryPerson("Delivery Partner"))
order.set_status("Shipped")

print("\nStrategy:")

partners = [
    DeliveryPartner("Partner A", True, 2),
    DeliveryPartner("Partner B", False, 5),
    DeliveryPartner("Partner C", True, 4)
]

assignment = DeliveryAssignment(AvailabilityStrategy())
assignment.assign_order(partners)

assignment = DeliveryAssignment(PriorityStrategy())
assignment.assign_order(partners)
