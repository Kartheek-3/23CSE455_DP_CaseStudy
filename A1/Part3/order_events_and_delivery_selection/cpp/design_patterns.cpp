#include <iostream>
#include <string>
#include <vector>
using namespace std;

class Observer {
public:
    virtual void update(const string& orderId, const string& status) = 0;
    virtual ~Observer() {}
};

class Admin : public Observer {
public:
    void update(const string& orderId, const string& status) override {
        cout << "Admin notified: Order " << orderId << " is " << status << endl;
    }
};

class Restaurant : public Observer {
public:
    void update(const string& orderId, const string& status) override {
        cout << "Restaurant notified: Order " << orderId << " is " << status << endl;
    }
};

class DeliveryPerson : public Observer {
    string name;

public:
    DeliveryPerson(const string& name) : name(name) {}

    void update(const string& orderId, const string& status) override {
        cout << name << " notified: Order " << orderId << " is " << status << endl;
    }
};

class Order {
    string orderId;
    string status;
    vector<Observer*> observers;

public:
    Order(const string& orderId) : orderId(orderId) {}

    void addObserver(Observer* observer) {
        observers.push_back(observer);
    }

    void setStatus(const string& status) {
        this->status = status;

        for (Observer* observer : observers) {
            observer->update(orderId, status);
        }
    }
};

class DeliveryPartner {
public:
    string name;
    bool available;
    int priority;

    DeliveryPartner(const string& name, bool available, int priority)
        : name(name), available(available), priority(priority) {}
};

class DeliveryStrategy {
public:
    virtual DeliveryPartner* assign(vector<DeliveryPartner>& partners) = 0;
    virtual ~DeliveryStrategy() {}
};

class AvailabilityStrategy : public DeliveryStrategy {
public:
    DeliveryPartner* assign(vector<DeliveryPartner>& partners) override {
        for (DeliveryPartner& partner : partners) {
            if (partner.available) {
                return &partner;
            }
        }

        return nullptr;
    }
};

class PriorityStrategy : public DeliveryStrategy {
public:
    DeliveryPartner* assign(vector<DeliveryPartner>& partners) override {
        DeliveryPartner* selected = nullptr;

        for (DeliveryPartner& partner : partners) {
            if (partner.available &&
                (selected == nullptr || partner.priority > selected->priority)) {
                selected = &partner;
            }
        }

        return selected;
    }
};

class DeliveryAssignment {
    DeliveryStrategy* strategy;

public:
    DeliveryAssignment(DeliveryStrategy* strategy) : strategy(strategy) {}

    void assignOrder(vector<DeliveryPartner>& partners) {
        DeliveryPartner* partner = strategy->assign(partners);

        if (partner != nullptr) {
            cout << "Assigned to: " << partner->name << endl;
        } else {
            cout << "No delivery partner available" << endl;
        }
    }
};

int main() {
    cout << "Observer:" << endl;

    Order order("O101");
    Admin admin;
    Restaurant restaurant;
    DeliveryPerson delivery("Delivery Partner");

    order.addObserver(&admin);
    order.addObserver(&restaurant);
    order.addObserver(&delivery);

    order.setStatus("Shipped");

    cout << "\nStrategy:" << endl;

    vector<DeliveryPartner> partners = {
        DeliveryPartner("Partner A", true, 2),
        DeliveryPartner("Partner B", false, 5),
        DeliveryPartner("Partner C", true, 4)
    };

    AvailabilityStrategy availability;
    DeliveryAssignment assignment(&availability);
    assignment.assignOrder(partners);

    PriorityStrategy priority;
    DeliveryAssignment assignment2(&priority);
    assignment2.assignOrder(partners);

    return 0;
}
