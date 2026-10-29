import java.util.*;

class Shipment {
    private final int shipmentId;
    private final String shipmentNumber;
    private final String status;

    public Shipment(int shipmentId, String shipmentNumber, String status) {
        this.shipmentId = shipmentId;
        this.shipmentNumber = shipmentNumber;
        this.status = status;
    }

    public int getShipmentId() {
        return shipmentId;
    }

    public String getShipmentNumber() {
        return shipmentNumber;
    }

    public String getStatus() {
        return status;
    }
}

interface ShipmentRepository {
    void save(Shipment shipment);
    Optional<Shipment> findById(int shipmentId);
    List<Shipment> findAll();
}

class InMemoryShipmentRepository implements ShipmentRepository {
    private final Map<Integer, Shipment> shipments = new HashMap<>();

    @Override
    public void save(Shipment shipment) {
        shipments.put(shipment.getShipmentId(), shipment);
    }

    @Override
    public Optional<Shipment> findById(int shipmentId) {
        return Optional.ofNullable(shipments.get(shipmentId));
    }

    @Override
    public List<Shipment> findAll() {
        return new ArrayList<>(shipments.values());
    }
}

public class RepositoryDemo {
    public static void main(String[] args) {
        ShipmentRepository repository = new InMemoryShipmentRepository();

        repository.save(new Shipment(1, "SHP-001", "planned"));
        repository.save(new Shipment(2, "SHP-002", "in_transit"));

        Shipment shipment = repository.findById(2).orElseThrow();
        List<Shipment> shipments = repository.findAll();

        if (!"SHP-002".equals(shipment.getShipmentNumber())) {
            throw new AssertionError("Shipment lookup failed");
        }

        if (shipments.size() != 2) {
            throw new AssertionError("Shipment count failed");
        }

        System.out.println("Repository Pattern: PASS");
        System.out.println("Found shipment: " + shipment.getShipmentNumber());
        System.out.println("Total shipments: " + shipments.size());
    }
}
