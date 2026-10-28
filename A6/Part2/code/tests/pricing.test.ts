import "reflect-metadata";
import { test } from "node:test";
import assert from "node:assert/strict";
import { FareCalculatorService } from "../src/infrastructure/services/FareCalculatorService";
import { BookDriver } from "../src/application/use_cases/User/BookDriver";
import { FareStrategy, OneWayFare } from "../src/domain/pricing/FareStrategy";
import { PeakHourSurcharge, LowSupplySurcharge } from "../src/domain/pricing/DynamicPricing";
import { BookingType } from "../src/domain/models/Booking";
import { FakeBookingRepo, FakeDriverRepo, FakeNotifier, FakeDistance, id } from "./helpers/fakes";

// CH03 - multiple ride types (Strategy) and dynamic pricing (Decorator).

const calc = new FareCalculatorService();
const noon = new Date("2027-01-15T06:30:00.000Z"); // 12:00 IST, off-peak
const plusHours = (d: Date, h: number) => new Date(d.getTime() + h * 3600 * 1000);
const plusDays = (d: Date, n: number) => new Date(d.getTime() + n * 24 * 3600 * 1000);

// Same fixtures as Part3/test-cases/strategy_spec.md (S1-S8), expressed with dates.
test("CH03 ride-type strategies S1-S8", () => {
  assert.equal(calc.calculate({ bookingType: BookingType.ONE_WAY, estimatedKm: 30, startDate: noon }), 450);
  assert.equal(calc.calculate({ bookingType: BookingType.ONE_WAY, estimatedKm: 60, startDate: noon }), 600);
  assert.equal(calc.calculate({ bookingType: BookingType.ROUND_TRIP, startDate: noon, endDate: plusDays(noon, 2) }), 3000);
  assert.equal(calc.calculate({ bookingType: BookingType.HOURLY, startDate: noon, endDate: plusHours(noon, 3) }), 800);
  assert.equal(calc.calculate({ bookingType: BookingType.HOURLY, startDate: noon, endDate: plusHours(noon, 5.5) }), 1200);
  assert.equal(calc.calculate({ bookingType: BookingType.OUTSTATION, estimatedKm: 200, startDate: noon,
    endDate: plusDays(noon, 1) }), 3000);
  assert.throws(() => calc.calculate({ bookingType: BookingType.ONE_WAY, estimatedKm: 0, startDate: noon }), /required/);
  assert.throws(() => calc.calculate({ bookingType: "SHUTTLE" as BookingType, estimatedKm: 10, startDate: noon }),
    /Invalid booking type/);
});

test("CH03 peak hours add 25% through the calculator (08:00 IST)", () => {
  assert.equal(calc.calculate({ bookingType: BookingType.ONE_WAY, estimatedKm: 60,
    startDate: new Date("2027-01-15T02:30:00.000Z") }), 750);
});

test("CH03 peak boundary check by IST hour", () => {
  const peak = new PeakHourSurcharge(new OneWayFare());
  const fare = (utc: string) => peak.calculate({ bookingType: BookingType.ONE_WAY, estimatedKm: 60, startDate: new Date(utc) });
  assert.equal(fare("2027-01-15T02:29:00.000Z"), 600); // 07:59 IST
  assert.equal(fare("2027-01-15T05:29:00.000Z"), 750); // 10:59 IST
  assert.equal(fare("2027-01-15T05:30:00.000Z"), 600); // 11:00 IST
  assert.equal(fare("2027-01-15T11:30:00.000Z"), 750); // 17:00 IST
  assert.equal(fare("2027-01-15T15:30:00.000Z"), 600); // 21:00 IST
});

test("CH03 fewer than 3 nearby drivers adds 20%; unknown supply adds nothing", () => {
  const f = (availableDrivers?: number) =>
    calc.calculate({ bookingType: BookingType.ONE_WAY, estimatedKm: 60, startDate: noon, availableDrivers });
  assert.deepEqual([f(undefined), f(1), f(2), f(3)], [600, 720, 720, 600]);
});

test("CH03 decorators stack: peak + low supply", () => {
  const evening = new Date("2027-01-15T12:30:00.000Z"); // 18:00 IST
  assert.equal(calc.calculate({ bookingType: BookingType.ONE_WAY, estimatedKm: 60, startDate: evening, availableDrivers: 1 }), 900);
});

test("CH03 a new ride type is added by registering a strategy, without editing existing ones", () => {
  const custom = new FareCalculatorService();
  const flat: FareStrategy = { extraKmRate: 10, calculate: () => 999 };
  custom.register("AIRPORT" as BookingType, flat);
  assert.equal(custom.calculate({ bookingType: "AIRPORT" as BookingType, startDate: noon }), 999);
  assert.equal(custom.calculate({ bookingType: BookingType.ONE_WAY, estimatedKm: 60, startDate: noon }), 600);
});

test("CH03 final fare uses the ride type's extra-km rate (baseline Rs 10, outstation Rs 12)", () => {
  assert.equal(calc.finalFare({ bookingType: BookingType.ONE_WAY, estimatedFare: 450, finalKm: 12 }), 570);
  assert.equal(calc.finalFare({ bookingType: BookingType.OUTSTATION, estimatedFare: 3000, finalKm: 10 }), 3120);
});

test("CH03 BookDriver applies the low-supply surcharge when only one driver is in range", async () => {
  const drivers = new FakeDriverRepo();
  const near = id();
  drivers.nearby = [{ _id: near, latitude: 10.01, longitude: 76.3 }];
  const useCase = new BookDriver(new FakeBookingRepo() as any, drivers as any, calc, new FakeNotifier() as any,
    new FakeDistance({ [near]: 5 }) as any);
  const saved = await useCase.execute({
    userId: id(), fromLocation: "Kochi", startDate: noon, endDate: plusHours(noon, 6),
    bookingType: BookingType.HOURLY, fromLat: 10, fromLng: 76.3,
  });
  assert.equal(saved.estimatedFare, 1440); // 6 h * 200 = 1200, +20%
});
