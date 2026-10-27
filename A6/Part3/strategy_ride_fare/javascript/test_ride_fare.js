// Runs fixtures S1-S8 from Part3/test-cases/strategy_spec.md.
import { FareCalculator, FareError } from "./ride_fare.js";

const trip = (rideType, km = 0, days = 0, hours = 0) => ({ rideType, km, days, hours });

const cases = [
  ["S1", trip("ONE_WAY", 30), "450"],
  ["S2", trip("ONE_WAY", 60), "600"],
  ["S3", trip("ROUND_TRIP", 0, 3), "3000"],
  ["S4", trip("HOURLY", 0, 0, 3), "800"],
  ["S5", trip("HOURLY", 0, 0, 5.5), "1200"],
  ["S6", trip("OUTSTATION", 200, 2), "3000"],
  ["S7", trip("ONE_WAY", 0), "error INVALID_INPUT"],
  ["S8", trip("SHUTTLE", 10), "error UNKNOWN_RIDE_TYPE"],
];

let passed = 0;
for (const [id, input, expected] of cases) {
  let actual;
  try {
    actual = String(new FareCalculator().calculate(input));
  } catch (e) {
    if (!(e instanceof FareError)) throw e;
    actual = `error ${e.code}`;
  }
  if (actual === expected) {
    passed++;
    console.log(`PASS ${id}`);
  } else {
    console.log(`FAIL ${id}: expected ${expected}, got ${actual}`);
  }
}
console.log(`RESULT ${passed}/${cases.length} passed`);
process.exitCode = passed === cases.length ? 0 : 1;
