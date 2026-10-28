class Observer {
    update(orderId, status) {}
}

class Admin extends Observer {
    update(orderId, status) {
        console.log(`Admin notified: Order ${orderId} is ${status}`);
    }
}

class Restaurant extends Observer {
    update(orderId, status) {
        console.log(`Restaurant notified: Order ${orderId} is ${status}`);
    }
}

class DeliveryPerson extends Observer {
    constructor(name) {
        super();
        this.name = name;
    }

    update(orderId, status) {
        console.log(`${this.name} notified: Order ${orderId} is ${status}`);
    }
}

class Order {
    constructor(orderId) {
        this.orderId = orderId;
        this.status = null;
        this.observers = [];
    }

    addObserver(observer) {
        this.observers.push(observer);
    }

    setStatus(status) {
        this.status = status;

        this.observers.forEach(observer => {
            observer.update(this.orderId, status);
        });
    }
}

class DeliveryPartner {
    constructor(name, available, priority) {
        this.name = name;
        this.available = available;
        this.priority = priority;
    }
}

class DeliveryStrategy {
    assign(partners) {}
}

class AvailabilityStrategy extends DeliveryStrategy {
    assign(partners) {
        return partners.find(partner => partner.available) || null;
    }
}

class PriorityStrategy extends DeliveryStrategy {
    assign(partners) {
        const available = partners.filter(partner => partner.available);

        if (available.length === 0) {
            return null;
        }

        return available.reduce((best, partner) =>
            partner.priority > best.priority ? partner : best
        );
    }
}

class DeliveryAssignment {
    constructor(strategy) {
        this.strategy = strategy;
    }

    assignOrder(partners) {
        const partner = this.strategy.assign(partners);

        if (partner) {
            console.log("Assigned to:", partner.name);
        } else {
            console.log("No delivery partner available");
        }
    }
}

console.log("Observer:");

const order = new Order("O101");
order.addObserver(new Admin());
order.addObserver(new Restaurant());
order.addObserver(new DeliveryPerson("Delivery Partner"));
order.setStatus("Shipped");

console.log("\nStrategy:");

const partners = [
    new DeliveryPartner("Partner A", true, 2),
    new DeliveryPartner("Partner B", false, 5),
    new DeliveryPartner("Partner C", true, 4)
];

let assignment = new DeliveryAssignment(new AvailabilityStrategy());
assignment.assignOrder(partners);

assignment = new DeliveryAssignment(new PriorityStrategy());
assignment.assignOrder(partners);
