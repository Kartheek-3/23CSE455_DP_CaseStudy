import "reflect-metadata";
import { test } from "node:test";
import assert from "node:assert/strict";
import { FareCalculatorService } from "../src/infrastructure/services/FareCalculatorService";
import { BookingType } from "../src/domain/models/Booking";

// Characterization of the baseline fare rules. These must keep passing after CH03.
const calc = new FareCalculatorService();
const start = new Date("2026-12-01T06:30:00.000Z"); // 12:00 IST - outside peak hours

test("ONE_WAY below the minimum is charged Rs 450", () => {
  assert.equal(calc.calculate({ bookingType: BookingType.ONE_WAY, estimatedKm: 30, startDate: start }), 450);
});

test("ONE_WAY is Rs 10 per km above the minimum", () => {
  assert.equal(calc.calculate({ bookingType: BookingType.ONE_WAY, estimatedKm: 60, startDate: start }), 600);
});

test("ONE_WAY without km is rejected", () => {
  assert.throws(() => calc.calculate({ bookingType: BookingType.ONE_WAY, startDate: start }));
});

test("ROUND_TRIP (range of dates) is Rs 1000 per calendar day, inclusive", () => {
  const end = new Date("2026-12-03T06:30:00.000Z");
  assert.equal(calc.calculate({ bookingType: BookingType.ROUND_TRIP, startDate: start, endDate: end }), 3000);
});

test("ROUND_TRIP without end date is rejected", () => {
  assert.throws(() => calc.calculate({ bookingType: BookingType.ROUND_TRIP, startDate: start }));
});

test("unknown booking type is rejected", () => {
  assert.throws(() => calc.calculate({ bookingType: "SHUTTLE" as BookingType, estimatedKm: 10, startDate: start }));
});
