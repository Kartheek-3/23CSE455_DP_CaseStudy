import java.util.ArrayList;
import java.util.List;

// Layered Architecture pattern -- presentation/business/data layers with
// downward-only dependencies. Production snippet. Tests live in
// LayeredArchitectureTest.java.

class Reservation {
    final int slotId;
    final String plate;

    Reservation(int slotId, String plate) {
        this.slotId = slotId;
        this.plate = plate;
    }
}

// Data layer
public class ReservationRepository {
    private final List<Reservation> items = new ArrayList<>();

    Reservation save(Reservation reservation) {
        items.add(reservation);
        return reservation;
    }

    int count() {
        return items.size();
    }

    Reservation findByPlate(String plate) {
        for (Reservation item : items) {
            if (item.plate.equals(plate)) {
                return item;
            }
        }
        return null;
    }
}

// Business layer (depends on the data layer)
class ParkingService {
    private final ReservationRepository repository;

    ParkingService(ReservationRepository repository) {
        this.repository = repository;
    }

    Reservation reserve(int slotId, String plate) {
        return repository.save(new Reservation(slotId, plate));
    }

    int reservations() {
        return repository.count();
    }
}

// Presentation layer (depends on the business layer)
class ParkingController {
    private final ParkingService service;

    ParkingController(ParkingService service) {
        this.service = service;
    }

    String postReservation(int slotId, String plate) {
        if (slotId <= 0) {
            return "ERR:invalid-slot";
        }
        service.reserve(slotId, plate);
        return "OK:" + slotId + ":" + plate;
    }
}
