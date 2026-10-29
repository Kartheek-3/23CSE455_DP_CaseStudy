'use strict';

const assert = require('assert');
const { ChargingSession } = require('./ev_charging_state.js');

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

const session = new ChargingSession();
check('initial', session.state, 'idle');
check('startCharge-invalid', session.startCharge(), 'error');
check('state-unchanged', session.state, 'idle');
check('errors', session.errors.join(','), 'startCharge@idle');
check('plugIn', session.plugIn(), 'plugged_in');
check('state-plugged', session.state, 'plugged_in');
check('removeCable-back', session.removeCable(), 'idle');

session.plugIn();
check('startCharge', session.startCharge(), 'charging');
check('state-charging', session.state, 'charging');
check('removeCable-invalid', session.removeCable(), 'error');
check('finishCharge', session.finishCharge(), 'completed');
check('state-completed', session.state, 'completed');
check('removeCable-done', session.removeCable(), 'idle');

console.log('STATE_JS PASS ' + passed + '/' + total);
