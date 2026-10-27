import { performance } from 'perf_hooks';
import {
  StateCondition,
  NumericStateCondition,
  AndCondition,
  OrCondition,
  NotCondition
} from './conditionComposite.js';

function runTests() {
  const start = performance.now();

  const stateStore = {
    'light.living_room': 'on',
    'climate.ac': 'cool',
    'sensor.temperature': 24.5,
    'binary_sensor.motion': 'off'
  };

  let passed = 0;
  const total = 6;

  // Test 1: Leaf State Condition (True)
  const c1 = new StateCondition('light.living_room', 'on');
  if (c1.evaluate(stateStore)) passed++;

  // Test 2: Leaf Numeric Condition (False)
  const c2 = new NumericStateCondition('sensor.temperature', '>', 30.0);
  if (!c2.evaluate(stateStore)) passed++;

  // Test 3: Composite AND (True)
  const c3 = new AndCondition()
    .add(new StateCondition('light.living_room', 'on'))
    .add(new NumericStateCondition('sensor.temperature', '>=', 20.0));
  if (c3.evaluate(stateStore)) passed++;

  // Test 4: Composite OR (False)
  const c4 = new OrCondition()
    .add(new NumericStateCondition('sensor.temperature', '<', 20.0))
    .add(new StateCondition('binary_sensor.motion', 'on'));
  if (!c4.evaluate(stateStore)) passed++;

  // Test 5: Composite NOT (True)
  const c5 = new NotCondition(new StateCondition('binary_sensor.motion', 'on'));
  if (c5.evaluate(stateStore)) passed++;

  // Test 6: Nested Composite AND(state, OR(numeric, NOT(state))) (True)
  const orBranch = new OrCondition()
    .add(new NumericStateCondition('sensor.temperature', '>', 25.0))
    .add(new NotCondition(new StateCondition('binary_sensor.motion', 'on')));
  const c6 = new AndCondition()
    .add(new StateCondition('light.living_room', 'on'))
    .add(orBranch);
  if (c6.evaluate(stateStore)) passed++;

  const elapsedMs = performance.now() - start;

  console.log(`RESULT: ${passed}/${total} passed`);
  console.log(`TIME_MS: ${elapsedMs.toFixed(3)}`);

  if (passed !== total) {
    process.exit(1);
  }
}

runTests();
