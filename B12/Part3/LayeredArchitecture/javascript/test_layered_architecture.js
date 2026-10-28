'use strict';

const assert = require('assert');
const {
  ReservationRepository,
  ParkingService,
  ParkingController,
} = require('./layered_architecture.js');

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

const repository = new ReservationRepository();
const service = new ParkingService(repository);
const controller = new ParkingController(service);

check('valid-response', controller.postReservation(1, 'ABC'), 'OK:1:ABC');
check('count-1', repository.count(), 1);

check(
  'invalid-response',
  controller.postReservation(0, 'ZZZ'),
  'ERR:invalid-slot',
);
check('count-still-1', repository.count(), 1);

check('second-response', controller.postReservation(2, 'XYZ'), 'OK:2:XYZ');
check('count-2', repository.count(), 2);

check('find-by-plate', repository.findByPlate('ABC').slotId, 1);
check(
  'negative-response',
  controller.postReservation(-5, 'QQ'),
  'ERR:invalid-slot',
);

console.log('LAYERED_ARCHITECTURE_JS PASS ' + passed + '/' + total);
