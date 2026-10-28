import java.util.ArrayList;
import java.util.List;

interface Observer {
    void update(String orderId, String status);
}

class Admin implements Observer {
    public void update(String orderId, String status) {
        System.out.println("Admin notified: Order " + orderId + " is " + status);
    }
}

class Restaurant implements Observer {
    public void update(String orderId, String status) {
        System.out.println("Restaurant notified: Order " + orderId + " is " + status);
    }
}

class DeliveryPerson implements Observer {
    private String name;

    DeliveryPerson(String name) {
        this.name = name;
    }

    public void update(String orderId, String status) {
        System.out.println(name + " notified: Order " + orderId + " is " + status);
    }
}

class Order {
    private String orderId;
    private String status;
    private List<Observer> observers = new ArrayList<>();

    Order(String orderId) {
        this.orderId = orderId;
    }

    void addObserver(Observer observer) {
        observers.add(observer);
    }

    void setStatus(String status) {
        this.status = status;
        for (Observer observer : observers) {
            observer.update(orderId, status);
        }
    }
}

class DeliveryPartner {
    String name;
    boolean available;
    int priority;

    DeliveryPartner(String name, boolean available, int priority) {
        this.name = name;
        this.available = available;
        this.priority = priority;
    }
}

interface DeliveryStrategy {
    DeliveryPartner assign(List<DeliveryPartner> partners);
}

class AvailabilityStrategy implements DeliveryStrategy {
    public DeliveryPartner assign(List<DeliveryPartner> partners) {
        for (DeliveryPartner partner : partners) {
            if (partner.available) {
                return partner;
            }
        }
        return null;
    }
}

class PriorityStrategy implements DeliveryStrategy {
    public DeliveryPartner assign(List<DeliveryPartner> partners) {
        DeliveryPartner selected = null;

        for (DeliveryPartner partner : partners) {
            if (partner.available &&
                (selected == null || partner.priority > selected.priority)) {
                selected = partner;
            }
        }

        return selected;
    }
}

class DeliveryAssignment {
    private DeliveryStrategy strategy;

    DeliveryAssignment(DeliveryStrategy strategy) {
        this.strategy = strategy;
    }

    void assignOrder(List<DeliveryPartner> partners) {
        DeliveryPartner partner = strategy.assign(partners);

        if (partner != null) {
            System.out.println("Assigned to: " + partner.name);
        } else {
            System.out.println("No delivery partner available");
        }
    }
}

public class DesignPatterns {
    public static void main(String[] args) {
        System.out.println("Observer:");

        Order order = new Order("O101");
        order.addObserver(new Admin());
        order.addObserver(new Restaurant());
        order.addObserver(new DeliveryPerson("Delivery Partner"));
        order.setStatus("Shipped");

        System.out.println("\nStrategy:");

        List<DeliveryPartner> partners = new ArrayList<>();
        partners.add(new DeliveryPartner("Partner A", true, 2));
        partners.add(new DeliveryPartner("Partner B", false, 5));
        partners.add(new DeliveryPartner("Partner C", true, 4));

        DeliveryAssignment assignment =
            new DeliveryAssignment(new AvailabilityStrategy());
        assignment.assignOrder(partners);

        assignment =
            new DeliveryAssignment(new PriorityStrategy());
        assignment.assignOrder(partners);
    }
}
