import { performance } from 'perf_hooks';
import { EvaluatorContext } from './conditionStrategy.js';

function runTests() {
  const start = performance.now();

  const context = new EvaluatorContext();

  const stateStore = {
    'light.patio': 'on',
    'sensor.lux': 150.0,
    'device.battery': 85.0
  };
  const envContext = { screenWidth: 1024 };

  let passed = 0;
  const total = 6;

  // Test 1: Strategy state (True)
  const cond1 = { type: 'state', entity: 'light.patio', expected: 'on' };
  if (context.evaluate(cond1, stateStore, envContext)) passed++;

  // Test 2: Strategy state (False)
  const cond2 = { type: 'state', entity: 'light.patio', expected: 'off' };
  if (!context.evaluate(cond2, stateStore, envContext)) passed++;

  // Test 3: Strategy numeric > 100 (True)
  const cond3 = {
    type: 'numeric',
    entity: 'sensor.lux',
    op: '>',
    threshold: 100.0
  };
  if (context.evaluate(cond3, stateStore, envContext)) passed++;

  // Test 4: Strategy numeric <= 20 (False)
  const cond4 = {
    type: 'numeric',
    entity: 'device.battery',
    op: '<=',
    threshold: 20.0
  };
  if (!context.evaluate(cond4, stateStore, envContext)) passed++;

  // Test 5: Strategy screen range 768-1200 (True)
  const cond5 = { type: 'screen', minWidth: 768, maxWidth: 1200 };
  if (context.evaluate(cond5, stateStore, envContext)) passed++;

  // Test 6: Custom pluggable strategy "battery_ok" (True)
  context.register('battery_ok', (data, states, env) => {
    const b = states['device.battery'];
    return b !== undefined && Number(b) > 50.0;
  });
  const cond6 = { type: 'battery_ok' };
  if (context.evaluate(cond6, stateStore, envContext)) passed++;

  const elapsedMs = performance.now() - start;

  console.log(`RESULT: ${passed}/${total} passed`);
  console.log(`TIME_MS: ${elapsedMs.toFixed(3)}`);

  if (passed !== total) {
    process.exit(1);
  }
}

runTests();
