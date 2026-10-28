class Shipment {
    constructor(shipmentId, shipmentNumber, status) {
        this.shipmentId = shipmentId;
        this.shipmentNumber = shipmentNumber;
        this.status = status;
    }
}

class ShipmentRepository {
    constructor() {
        this.shipments = new Map();
    }

    save(shipment) {
        this.shipments.set(shipment.shipmentId, shipment);
    }

    findById(shipmentId) {
        return this.shipments.get(shipmentId);
    }

    findAll() {
        return Array.from(this.shipments.values());
    }
}

function main() {
    const repository = new ShipmentRepository();

    repository.save(new Shipment(1, "SHP-001", "planned"));
    repository.save(new Shipment(2, "SHP-002", "in_transit"));

    const shipment = repository.findById(2);
    const shipments = repository.findAll();

    if (!shipment || shipment.shipmentNumber !== "SHP-002") {
        throw new Error("Shipment lookup failed");
    }

    if (shipments.length !== 2) {
        throw new Error("Shipment count failed");
    }

    console.log("Repository Pattern: PASS");
    console.log(`Found shipment: ${shipment.shipmentNumber}`);
    console.log(`Total shipments: ${shipments.length}`);
}

main();
