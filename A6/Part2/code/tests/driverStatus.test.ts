import "reflect-metadata";
import { test } from "node:test";
import assert from "node:assert/strict";
import { AdminChangeDriverStatus } from "../src/application/use_cases/Admin/AdminChangeDriverStatus";
import { AcceptBooking } from "../src/application/use_cases/Driver/AcceptBooking";
import { BookDriver } from "../src/application/use_cases/User/BookDriver";
import { FareCalculatorService } from "../src/infrastructure/services/FareCalculatorService";
import { DriverAccount } from "../src/domain/driver/DriverAccountState";
import { InvalidTransitionError } from "../src/domain/errors/InvalidTransitionError";
import { BookingStatus, BookingType } from "../src/domain/models/Booking";
import { FakeBookingRepo, FakeDriverRepo, FakeNotifier, FakeDistance, makeBooking, makeDriver, id } from "./helpers/fakes";

// CH01 - new driver status SUSPENDED, driver account lifecycle as State objects.

test("CH01 state table: allowed admin transitions", () => {
  assert.equal(new DriverAccount("pending").changeTo("approved"), "approved");
  assert.equal(new DriverAccount("pending").changeTo("rejected", "documents unclear"), "rejected");
  assert.equal(new DriverAccount("approved").changeTo("suspended", "complaints"), "suspended");
  assert.equal(new DriverAccount("suspended").changeTo("approved"), "approved");
  assert.equal(new DriverAccount("suspended").changeTo("rejected", "fraud"), "rejected");
  assert.equal(new DriverAccount("rejected").changeTo("pending"), "pending");
});

test("CH01 state table: illegal admin transitions are refused", () => {
  assert.throws(() => new DriverAccount("rejected").changeTo("approved"), InvalidTransitionError);
  assert.throws(() => new DriverAccount("pending").changeTo("suspended", "x"), InvalidTransitionError);
  assert.throws(() => new DriverAccount("approved").changeTo("approved"), InvalidTransitionError);
  assert.throws(() => new DriverAccount("approved").changeTo("pending"), InvalidTransitionError);
});

test("CH01 suspending requires a reason", () => {
  assert.throws(() => new DriverAccount("approved").changeTo("suspended"), /reason is required/);
});

test("CH01 only approved drivers can receive rides", () => {
  assert.deepEqual(
    ["pending", "approved", "rejected", "suspended"].map((s) => new DriverAccount(s).canReceiveRides()),
    [false, true, false, false]
  );
});

test("CH01 admin suspends an approved driver: saved and driver notified", async () => {
  const drivers = new FakeDriverRepo();
  const d = drivers.seed(makeDriver({ status: "approved" }));
  const notifier = new FakeNotifier();
  const res = await new AdminChangeDriverStatus(drivers as any, notifier as any)
    .execute(String(d._id), "suspended", "repeated late arrivals");
  assert.equal(res?.status, "suspended");
  assert.deepEqual(drivers.statusCalls, [{ driverId: String(d._id), status: "suspended", reason: "repeated late arrivals" }]);
  assert.deepEqual(notifier.calls[0], ["adminChangeDriverStatusNotification", String(d._id),
    { status: "suspended", reason: "repeated late arrivals" }]);
});

test("CH01 (fixes baseline defect) a rejected driver cannot jump straight to approved; nothing saved or sent", async () => {
  const drivers = new FakeDriverRepo();
  const d = drivers.seed(makeDriver({ status: "rejected" }));
  const notifier = new FakeNotifier();
  await assert.rejects(new AdminChangeDriverStatus(drivers as any, notifier as any).execute(String(d._id), "approved"),
    InvalidTransitionError);
  assert.equal(drivers.statusCalls.length, 0);
  assert.equal(notifier.calls.length, 0);
});

test("CH01 a suspended driver cannot accept a booking", async () => {
  const bookings = new FakeBookingRepo();
  const drivers = new FakeDriverRepo();
  const b = bookings.seed(makeBooking({ status: BookingStatus.PENDING }));
  const d = drivers.seed(makeDriver({ status: "suspended" }));
  await assert.rejects(new AcceptBooking(bookings as any, new FakeNotifier() as any, drivers as any)
    .execute({ bookingId: String(b._id), driverId: String(d._id) }), /cannot accept rides/);
  assert.equal((await bookings.findBookingById(String(b._id)))?.status, BookingStatus.PENDING);
});

test("CH01 an approved driver accepts a PENDING booking through the repository (refactored)", async () => {
  const bookings = new FakeBookingRepo();
  const drivers = new FakeDriverRepo();
  const b = bookings.seed(makeBooking({ status: BookingStatus.PENDING }));
  const d = drivers.seed(makeDriver({ status: "approved" }));
  const notifier = new FakeNotifier();
  const accepted = await new AcceptBooking(bookings as any, notifier as any, drivers as any)
    .execute({ bookingId: String(b._id), driverId: String(d._id) });
  assert.equal(accepted.status, BookingStatus.CONFIRMED);
  assert.deepEqual(notifier.names(), ["sendBookingConfirmation", "bookingAssignedNotification"]);
  // a second driver is too late
  const d2 = drivers.seed(makeDriver({ status: "approved" }));
  await assert.rejects(new AcceptBooking(bookings as any, notifier as any, drivers as any)
    .execute({ bookingId: String(b._id), driverId: String(d2._id) }), /no longer available/);
});

test("CH01 a rider cannot request a suspended driver directly", async () => {
  const drivers = new FakeDriverRepo();
  const d = drivers.seed(makeDriver({ status: "suspended" }));
  const useCase = new BookDriver(new FakeBookingRepo() as any, drivers as any, new FareCalculatorService(),
    new FakeNotifier() as any, new FakeDistance() as any);
  await assert.rejects(useCase.execute({
    userId: id(), driverId: String(d._id), fromLocation: "Kochi", startDate: new Date(Date.now() + 864e5),
    estimatedKm: 30, bookingType: BookingType.ONE_WAY, fromLat: 10, fromLng: 76.3,
  }), /not available/);
});
