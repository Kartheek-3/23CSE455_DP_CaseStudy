import { performance } from 'perf_hooks';
import { ModalFactory } from './entityModalFactory.js';

function runTests() {
  const start = performance.now();

  const factory = new ModalFactory();

  let passed = 0;
  const total = 5;

  // Test 1: Light modal
  const m1 = factory.createModal('light.kitchen');
  if (m1.getDomain() === 'light' && m1.renderAction() === 'RENDER_LIGHT_CONTROLS') passed++;

  // Test 2: Switch modal
  const m2 = factory.createModal('switch.water_heater');
  if (m2.getDomain() === 'switch' && m2.renderAction() === 'RENDER_SWITCH_TOGGLE') passed++;

  // Test 3: Sensor modal
  const m3 = factory.createModal('sensor.living_room_temp');
  if (m3.getDomain() === 'sensor' && m3.renderAction() === 'RENDER_SENSOR_GRAPH') passed++;

  // Test 4: Climate modal
  const m4 = factory.createModal('climate.main_floor');
  if (m4.getDomain() === 'climate' && m4.renderAction() === 'RENDER_CLIMATE_HVAC') passed++;

  // Test 5: Generic fallback modal
  const m5 = factory.createModal('unknown_domain.device_123');
  if (m5.getDomain() === 'unknown_domain' && m5.renderAction() === 'RENDER_GENERIC_ATTRIBUTES') passed++;

  const elapsedMs = performance.now() - start;

  console.log(`RESULT: ${passed}/${total} passed`);
  console.log(`TIME_MS: ${elapsedMs.toFixed(3)}`);

  if (passed !== total) {
    process.exit(1);
  }
}

runTests();
