// Runs fixtures T1-T8 from Part3/test-cases/state_spec.md.
import { InvalidTransition, Trip } from "./trip_lifecycle.js";

const cases = [
  ["T1", ["accept", "complete"], "COMPLETED", 0],
  ["T2", ["cancel"], "CANCELLED", 0],
  ["T3", ["accept", "cancel"], "CANCELLED", 0],
  ["T4", ["expire"], "EXPIRED", 0],
  ["T5", ["complete"], "PENDING", 1],
  ["T6", ["accept", "complete", "cancel"], "COMPLETED", 1],
  ["T7", ["accept", "reject"], "REJECTED", 0],
  ["T8", ["expire", "accept", "cancel"], "EXPIRED", 2],
];

let passed = 0;
for (const [id, events, expectedState, expectedErrors] of cases) {
  const trip = new Trip();
  let errors = 0;
  for (const event of events) {
    try {
      trip.apply(event);
    } catch (e) {
      if (!(e instanceof InvalidTransition)) throw e;
      errors++;
    }
  }
  if (trip.status === expectedState && errors === expectedErrors) {
    passed++;
    console.log(`PASS ${id}`);
  } else {
    console.log(`FAIL ${id}: got ${trip.status}/${errors}`);
  }
}
console.log(`RESULT ${passed}/${cases.length} passed`);
process.exitCode = passed === cases.length ? 0 : 1;
