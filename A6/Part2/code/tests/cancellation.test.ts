import "reflect-metadata";
import { test } from "node:test";
import assert from "node:assert/strict";
import { Types } from "mongoose";
import { CancelBookingInputUseCase } from "../src/application/use_cases/User/CancelBooking";
import { UpdateBookingStatus } from "../src/application/use_cases/Driver/UpdateBookingstatus";
import { FareCalculatorService } from "../src/infrastructure/services/FareCalculatorService";
import { TripLifecycle, TripEvent } from "../src/domain/booking/TripState";
import { RiderCancellationPolicy, DriverCancellationPolicy, cancellationCutoff } from "../src/domain/booking/CancellationPolicy";
import { InvalidTransitionError } from "../src/domain/errors/InvalidTransitionError";
import { BookingStatus } from "../src/domain/models/Booking";
import { FakeBookingRepo, FakeNotifier, makeBooking } from "./helpers/fakes";

// CH02 - ride cancellation: trip lifecycle as State objects, cancellation fee as Strategy.

const run = (events: TripEvent[]) => {
  const trip = new TripLifecycle(BookingStatus.PENDING);
  let errors = 0;
  for (const e of events) {
    try {
      trip.apply(e);
    } catch (err) {
      assert.ok(err instanceof InvalidTransitionError);
      errors++;
    }
  }
  return [trip.status, errors];
};

// Same fixtures as Part3/test-cases/state_spec.md (T1-T8)
test("CH02 trip state fixtures T1-T8", () => {
  assert.deepEqual(run(["accept", "complete"]), [BookingStatus.COMPLETED, 0]);
  assert.deepEqual(run(["cancel"]), [BookingStatus.CANCELLED, 0]);
  assert.deepEqual(run(["accept", "cancel"]), [BookingStatus.CANCELLED, 0]);
  assert.deepEqual(run(["expire"]), [BookingStatus.EXPIRED, 0]);
  assert.deepEqual(run(["complete"]), [BookingStatus.PENDING, 1]);
  assert.deepEqual(run(["accept", "complete", "cancel"]), [BookingStatus.COMPLETED, 1]);
  assert.deepEqual(run(["accept", "reject"]), [BookingStatus.REJECTED, 0]);
  assert.deepEqual(run(["expire", "accept", "cancel"]), [BookingStatus.EXPIRED, 2]);
});

const hours = (h: number) => new Date(Date.now() + h * 3600 * 1000);

test("CH02 rider policy: PENDING is free even close to the ride", () => {
  const b = makeBooking({ status: BookingStatus.PENDING, startDate: hours(2), estimatedFare: 900 });
  assert.equal(new RiderCancellationPolicy().calculateFee(b, new Date()), 0);
});

test("CH02 rider policy: CONFIRMED before the 9 PM IST cutoff is free", () => {
  const b = makeBooking({ status: BookingStatus.CONFIRMED, startDate: hours(5 * 24), estimatedFare: 900 });
  assert.equal(new RiderCancellationPolicy().calculateFee(b, new Date()), 0);
});

test("CH02 rider policy: CONFIRMED after the cutoff pays 10% of the fare, minimum Rs 50", () => {
  const big = makeBooking({ status: BookingStatus.CONFIRMED, startDate: hours(2), estimatedFare: 1200 });
  const small = makeBooking({ status: BookingStatus.CONFIRMED, startDate: hours(2), estimatedFare: 450 });
  const policy = new RiderCancellationPolicy();
  assert.equal(policy.calculateFee(big, new Date()), 120);
  assert.equal(policy.calculateFee(small, new Date()), 50);
});

test("CH02 cutoff is 21:00 IST (15:30 UTC) on the previous day", () => {
  assert.equal(cancellationCutoff(new Date("2026-12-10T04:30:00.000Z")).toISOString(), "2026-12-09T15:30:00.000Z");
});

test("CH02 driver policy never charges the rider, even one hour before the ride", () => {
  assert.equal(new DriverCancellationPolicy().calculateFee(), 0);
});

test("CH02 (fixes baseline defect) a COMPLETED trip cannot be cancelled and nothing is saved", async () => {
  const bookings = new FakeBookingRepo();
  const b = bookings.seed(makeBooking({ status: BookingStatus.COMPLETED }));
  const useCase = new CancelBookingInputUseCase(new FakeNotifier() as any, bookings as any);
  await assert.rejects(useCase.execute({ bookingId: String(b._id), reason: "late", cancelledBy: "user",
    actorId: b.userId.toString() }), InvalidTransitionError);
  assert.equal(bookings.updates.length, 0);
});

test("CH02 only the rider or the assigned driver of the trip may cancel it", async () => {
  const bookings = new FakeBookingRepo();
  const b = bookings.seed(makeBooking({ status: BookingStatus.CONFIRMED, driverId: new Types.ObjectId(), startDate: hours(48) }));
  const useCase = new CancelBookingInputUseCase(new FakeNotifier() as any, bookings as any);
  await assert.rejects(useCase.execute({ bookingId: String(b._id), reason: "x", cancelledBy: "user",
    actorId: new Types.ObjectId().toString() }), /your own rides/);
  await assert.rejects(useCase.execute({ bookingId: String(b._id), reason: "x", cancelledBy: "driver",
    actorId: new Types.ObjectId().toString() }), /your own rides/);
});

test("CH02 late rider cancellation stores fee and actor, and notifies the driver", async () => {
  const bookings = new FakeBookingRepo();
  const driverId = new Types.ObjectId();
  const b = bookings.seed(makeBooking({ status: BookingStatus.CONFIRMED, driverId, startDate: hours(3), estimatedFare: 800 }));
  const notifier = new FakeNotifier();
  const result = await new CancelBookingInputUseCase(notifier as any, bookings as any)
    .execute({ bookingId: String(b._id), reason: "flight delayed", cancelledBy: "user", actorId: b.userId.toString() });
  assert.deepEqual(result, { bookingId: String(b._id), status: BookingStatus.CANCELLED, cancellationFee: 80 });
  const saved = await bookings.findBookingById(String(b._id));
  assert.equal(saved?.cancelledBy, "user");
  assert.equal(saved?.cancellationFee, 80);
  assert.deepEqual(notifier.calls.map((c) => [c[0], c[1]]), [["cancelBookingNotification", driverId.toString()]]);
});

test("CH02 driver cancellation is free for the rider and notifies the rider", async () => {
  const bookings = new FakeBookingRepo();
  const driverId = new Types.ObjectId();
  const b = bookings.seed(makeBooking({ status: BookingStatus.CONFIRMED, driverId, startDate: hours(3), estimatedFare: 800 }));
  const notifier = new FakeNotifier();
  const result = await new CancelBookingInputUseCase(notifier as any, bookings as any)
    .execute({ bookingId: String(b._id), reason: "vehicle issue", cancelledBy: "driver", actorId: driverId.toString() });
  assert.equal(result.cancellationFee, 0);
  assert.deepEqual(notifier.calls.map((c) => [c[0], c[1]]), [["driverCancelledBookingNotification", b.userId.toString()]]);
});

test("CH02 cancelling an unaccepted broadcast request dismisses the drivers' popups", async () => {
  const bookings = new FakeBookingRepo();
  const b = bookings.seed(makeBooking({ status: BookingStatus.PENDING }));
  const notifier = new FakeNotifier();
  await new CancelBookingInputUseCase(notifier as any, bookings as any)
    .execute({ bookingId: String(b._id), reason: "x", cancelledBy: "user", actorId: b.userId.toString() });
  assert.deepEqual(notifier.names(), ["bookingAssignedNotification"]);
});

test("CH02 driver status update follows the trip state (cannot complete a PENDING ride)", async () => {
  const bookings = new FakeBookingRepo();
  const b = bookings.seed(makeBooking({ status: BookingStatus.PENDING }));
  const useCase = new UpdateBookingStatus(bookings as any, new FakeNotifier() as any, new FareCalculatorService());
  await assert.rejects(useCase.execute({ bookingId: String(b._id), status: BookingStatus.COMPLETED, finalKm: 5 }),
    InvalidTransitionError);
  await assert.rejects(useCase.execute({ bookingId: String(b._id), status: BookingStatus.CANCELLED }), /cancel endpoint/);
  assert.equal(bookings.updates.length, 0);
});
