#include <cassert>
#include <iostream>
#include <string>
#include <unordered_map>
#include <vector>

struct Shipment {
    int shipmentId;
    std::string shipmentNumber;
    std::string status;
};

class ShipmentRepository {
public:
    virtual ~ShipmentRepository() = default;
    virtual void save(const Shipment& shipment) = 0;
    virtual const Shipment* findById(int shipmentId) const = 0;
    virtual std::vector<Shipment> findAll() const = 0;
};

class InMemoryShipmentRepository : public ShipmentRepository {
private:
    std::unordered_map<int, Shipment> shipments;

public:
    void save(const Shipment& shipment) override {
        shipments[shipment.shipmentId] = shipment;
    }

    const Shipment* findById(int shipmentId) const override {
        auto it = shipments.find(shipmentId);
        if (it == shipments.end()) {
            return nullptr;
        }
        return &it->second;
    }

    std::vector<Shipment> findAll() const override {
        std::vector<Shipment> result;
        for (const auto& entry : shipments) {
            result.push_back(entry.second);
        }
        return result;
    }
};

int main() {
    InMemoryShipmentRepository repository;

    repository.save({1, "SHP-001", "planned"});
    repository.save({2, "SHP-002", "in_transit"});

    const Shipment* shipment = repository.findById(2);
    std::vector<Shipment> shipments = repository.findAll();

    assert(shipment != nullptr);
    assert(shipment->shipmentNumber == "SHP-002");
    assert(shipments.size() == 2);

    std::cout << "Repository Pattern: PASS\n";
    std::cout << "Found shipment: " << shipment->shipmentNumber << "\n";
    std::cout << "Total shipments: " << shipments.size() << "\n";

    return 0;
}
