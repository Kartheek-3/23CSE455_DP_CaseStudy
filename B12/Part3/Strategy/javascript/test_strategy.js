'use strict';

const assert = require('assert');
const {
  Slot,
  FirstAvailableStrategy,
  NearestToEntranceStrategy,
  EvPreferredStrategy,
  SlotAllocator,
} = require('./slot_allocation_strategy.js');

const slots = [
  new Slot(1, 'A1', 2, 'standard', 50),
  new Slot(2, 'A2', 1, 'standard', 30),
  new Slot(3, 'E1', 1, 'ev', 40),
];
const noEv = [slots[0], slots[1]];

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

const allocator = new SlotAllocator(new FirstAvailableStrategy());
check('first-available', allocator.allocate(slots).id, 1);

allocator.setStrategy(new NearestToEntranceStrategy());
check('nearest-to-entrance', allocator.allocate(slots).id, 2);

allocator.setStrategy(new EvPreferredStrategy());
check('ev-preferred', allocator.allocate(slots).id, 3);
check('ev-preferred-no-ev', allocator.allocate(noEv).id, 2);
check('empty', allocator.allocate([]), null);

console.log('STRATEGY_JS PASS ' + passed + '/' + total);
