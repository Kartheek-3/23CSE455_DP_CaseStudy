'use strict';

const assert = require('assert');
const {
  AvailabilityObserver,
  LoggingObserver,
  OccupancyMonitor,
} = require('./occupancy_observer.js');

let passed = 0;
let total = 0;
function check(label, actual, expected) {
  total += 1;
  assert.strictEqual(
    actual,
    expected,
    label + ': expected ' + expected + ' got ' + actual,
  );
  passed += 1;
}

const avail = new AvailabilityObserver();
const log = new LoggingObserver();
const monitor = new OccupancyMonitor();
monitor.attach(avail);
monitor.attach(log);

check('notify-return', monitor.notify('occupy:1'), 2);
check('avail-1', avail.count(), 1);
check('log-1', log.events.length, 1);

monitor.notify('occupy:2');
check('avail-2', avail.count(), 2);

monitor.notify('free:1');
check('avail-free', avail.count(), 1);

monitor.detach(log);
monitor.notify('occupy:3');
check('avail-3', avail.count(), 2);
check('log-still-3', log.events.length, 3);
check('log-contents', log.events.join(','), 'occupy:1,occupy:2,free:1');

console.log('OBSERVER_JS PASS ' + passed + '/' + total);
