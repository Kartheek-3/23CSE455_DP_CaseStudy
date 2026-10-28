import "reflect-metadata";
import { test } from "node:test";
import assert from "node:assert/strict";
import { Types } from "mongoose";
import { BookDriver } from "../src/application/use_cases/User/BookDriver";
import { CancelBookingInputUseCase } from "../src/application/use_cases/User/CancelBooking";
import { UpdateBookingStatus } from "../src/application/use_cases/Driver/UpdateBookingstatus";
import { FareCalculatorService } from "../src/infrastructure/services/FareCalculatorService";
import { BookingStatus, BookingType } from "../src/domain/models/Booking";
import { FakeBookingRepo, FakeDriverRepo, FakeNotifier, FakeDistance, makeBooking, id } from "./helpers/fakes";

const future = new Date(Date.now() + 5 * 24 * 3600 * 1000);
// CH03: fixed off-peak start (12:00 IST) so dynamic pricing does not apply to the baseline expectation
const offPeak = new Date("2027-01-15T06:30:00.000Z");

test("BookDriver broadcasts only to drivers within 20 km road distance and saves a PENDING trip", async () => {
  const bookings = new FakeBookingRepo();
  const drivers = new FakeDriverRepo();
  // CH03: three drivers in range = normal supply, so the low-supply surcharge does not apply
  const [n1, n2, n3, far] = [id(), id(), id(), id()];
  drivers.nearby = [n1, n2, n3, far].map((d) => ({ _id: d, latitude: 10.01, longitude: 76.3 }));
  const notifier = new FakeNotifier();
  const useCase = new BookDriver(bookings as any, drivers as any, new FareCalculatorService(), notifier as any,
    new FakeDistance({ [n1]: 4, [n2]: 9, [n3]: 19, [far]: 25 }) as any);

  const saved = await useCase.execute({
    userId: id(), fromLocation: "Kochi", toLocation: "Aluva", startDate: offPeak,
    estimatedKm: 30, bookingType: BookingType.ONE_WAY, fromLat: 10, fromLng: 76.3,
  });

  assert.equal(saved.status, BookingStatus.PENDING);
  assert.equal(saved.estimatedFare, 450);
  assert.deepEqual(notifier.calls.map((c) => [c[0], c[1]]), [["broadcastBookingNotification", [n1, n2, n3].join(",")]]);
});

test("BookDriver refuses the request when no driver is within 20 km by road", async () => {
  const drivers = new FakeDriverRepo();
  const far = id();
  drivers.nearby = [{ _id: far, latitude: 10.2, longitude: 76.3 }];
  const useCase = new BookDriver(new FakeBookingRepo() as any, drivers as any, new FareCalculatorService(),
    new FakeNotifier() as any, new FakeDistance({ [far]: 25 }) as any);
  await assert.rejects(useCase.execute({
    userId: id(), fromLocation: "Kochi", startDate: future, estimatedKm: 30,
    bookingType: BookingType.ONE_WAY, fromLat: 10, fromLng: 76.3,
  }));
});

test("rider cancelling a PENDING trip sets CANCELLED and stores the reason", async () => {
  const bookings = new FakeBookingRepo();
  const b = bookings.seed(makeBooking({ status: BookingStatus.PENDING }));
  const useCase = new CancelBookingInputUseCase(new FakeNotifier() as any, bookings as any);
  // CH02: input now names the actor instead of passing a status (expectations unchanged)
  await useCase.execute({ bookingId: String(b._id), reason: "plans changed", cancelledBy: "user", actorId: b.userId.toString() });
  const after = await bookings.findBookingById(String(b._id));
  assert.equal(after?.status, BookingStatus.CANCELLED);
  assert.equal(after?.reason, "plans changed");
});

test("rider cancelling a CONFIRMED trip notifies the assigned driver", async () => {
  const bookings = new FakeBookingRepo();
  const driverId = new Types.ObjectId();
  const b = bookings.seed(makeBooking({ status: BookingStatus.CONFIRMED, driverId, startDate: future }));
  const notifier = new FakeNotifier();
  const useCase = new CancelBookingInputUseCase(notifier as any, bookings as any);
  await useCase.execute({ bookingId: String(b._id), reason: "x", cancelledBy: "user", actorId: b.userId.toString() });
  assert.deepEqual(notifier.calls.map((c) => [c[0], c[1]]), [["cancelBookingNotification", driverId.toString()]]);
});

test("driver completing a trip stores finalFare = estimatedFare + finalKm * 10", async () => {
  const bookings = new FakeBookingRepo();
  const b = bookings.seed(makeBooking({ status: BookingStatus.CONFIRMED, driverId: new Types.ObjectId() }));
  const useCase = new UpdateBookingStatus(bookings as any, new FakeNotifier() as any, new FareCalculatorService());
  await useCase.execute({ bookingId: String(b._id), status: BookingStatus.COMPLETED, finalKm: 12 });
  assert.equal((await bookings.findBookingById(String(b._id)))?.finalFare, 570);
});

test("completing a trip without finalKm is rejected", async () => {
  const bookings = new FakeBookingRepo();
  const b = bookings.seed(makeBooking({ status: BookingStatus.CONFIRMED }));
  const useCase = new UpdateBookingStatus(bookings as any, new FakeNotifier() as any, new FareCalculatorService());
  await assert.rejects(useCase.execute({ bookingId: String(b._id), status: BookingStatus.COMPLETED }));
});
