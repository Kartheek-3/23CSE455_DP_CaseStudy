'use strict';

// Layered Architecture pattern -- presentation/business/data layers with
// downward-only dependencies. Production snippet. Tests in
// test_layered_architecture.js.

class Reservation {
  constructor(slotId, plate) {
    this.slotId = slotId;
    this.plate = plate;
  }
}

// Data layer
class ReservationRepository {
  constructor() {
    this.items = [];
  }
  save(reservation) {
    this.items.push(reservation);
    return reservation;
  }
  count() {
    return this.items.length;
  }
  findByPlate(plate) {
    return this.items.find((item) => item.plate === plate) || null;
  }
}

// Business layer (depends on the data layer)
class ParkingService {
  constructor(repository) {
    this.repository = repository;
  }
  reserve(slotId, plate) {
    return this.repository.save(new Reservation(slotId, plate));
  }
  reservations() {
    return this.repository.count();
  }
}

// Presentation layer (depends on the business layer)
class ParkingController {
  constructor(service) {
    this.service = service;
  }
  postReservation(slotId, plate) {
    if (slotId <= 0) {
      return 'ERR:invalid-slot';
    }
    this.service.reserve(slotId, plate);
    return 'OK:' + slotId + ':' + plate;
  }
}

module.exports = {
  Reservation,
  ReservationRepository,
  ParkingService,
  ParkingController,
};
