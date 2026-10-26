// Runs fixtures O1-O6 from Part3/test-cases/observer_spec.md.
import { NotificationHub, RecordingObserver } from "./ride_notification.js";

const ev = (type, bookingId) => ({ type, bookingId });

const cases = [
  ["O1", () => {
    const hub = new NotificationHub(), d1 = new RecordingObserver(), d2 = new RecordingObserver();
    hub.subscribe("d1", d1);
    hub.subscribe("d2", d2);
    const n = hub.broadcast(["d1", "d2", "d3"], ev("booking:new", "B1"));
    return n === 2 && d1.received.length === 1 && d2.received.length === 1;
  }],
  ["O2", () => {
    const hub = new NotificationHub(), d1 = new RecordingObserver();
    hub.subscribe("d1", d1);
    hub.subscribe("d2", new RecordingObserver());
    hub.unsubscribe("d1");
    const n = hub.broadcast(["d1", "d2"], ev("booking:new", "B2"));
    return n === 1 && d1.received.length === 0;
  }],
  ["O3", () => new NotificationHub().notify("r1", ev("booking:confirmation", "B3")) === false],
  ["O4", () => {
    const hub = new NotificationHub(), a = new RecordingObserver(), b = new RecordingObserver();
    hub.subscribe("d1", a);
    hub.subscribe("d1", b);
    const ok = hub.notify("d1", ev("cancel:booking", "B4"));
    return ok && a.received.length === 0 && b.received.length === 1;
  }],
  ["O5", () => {
    const hub = new NotificationHub(), d2 = new RecordingObserver();
    hub.subscribe("d2", d2);
    hub.notify("d2", ev("booking:new", "B5"));
    hub.notify("d2", ev("cancel:booking", "B5"));
    return d2.received.map((e) => e.type).join(",") === "booking:new,cancel:booking";
  }],
  ["O6", () => {
    const hub = new NotificationHub();
    hub.subscribe("r1", new RecordingObserver());
    const ok = hub.notify("r1", ev("booking:confirmation", "B6"));
    return ok && hub.broadcast([], ev("booking:new", "B7")) === 0;
  }],
];

let passed = 0;
for (const [id, body] of cases) {
  if (body()) {
    passed++;
    console.log(`PASS ${id}`);
  } else {
    console.log(`FAIL ${id}`);
  }
}
console.log(`RESULT ${passed}/${cases.length} passed`);
process.exitCode = passed === cases.length ? 0 : 1;
