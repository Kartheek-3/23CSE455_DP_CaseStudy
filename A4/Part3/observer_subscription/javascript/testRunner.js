import { performance } from 'perf_hooks';
import { EntitySubscriptionObserver, EntityHub } from './entityObserver.js';

class DashboardWidgetObserver extends EntitySubscriptionObserver {
  constructor() {
    super();
    this.updateCount = 0;
    this.receivedEntities = [];
  }

  onEntityUpdate(entityId, state, attributes) {
    this.updateCount++;
    this.receivedEntities.push(entityId);
  }
}

class NotificationLoggerObserver extends EntitySubscriptionObserver {
  constructor() {
    super();
    this.updateCount = 0;
    this.receivedEntities = [];
  }

  onEntityUpdate(entityId, state, attributes) {
    this.updateCount++;
    this.receivedEntities.push(entityId);
  }
}

function runTests() {
  const start = performance.now();

  const hub = new EntityHub();
  const widget = new DashboardWidgetObserver();
  const logger = new NotificationLoggerObserver();

  hub.subscribe(widget);
  hub.subscribe(logger);

  let passed = 0;
  const total = 5;

  // Event 1
  hub.updateEntity('light.living_room', 'on', { brightness: '100' });

  // Event 2
  hub.updateEntity('climate.thermostat', 'cool', { temperature: '21.5' });

  // Event 3
  hub.updateEntity('sensor.smoke', 'emergency', { battery: '95' });

  // Unsubscribe logger
  hub.unsubscribe(logger);

  // Event 4
  hub.updateEntity('light.kitchen', 'off', { brightness: '0' });

  // Check 1: DashboardWidget received 4 updates
  if (widget.updateCount === 4) passed++;

  // Check 2: Logger received 3 updates (none after unsubscribe)
  if (logger.updateCount === 3) passed++;

  // Check 3: State of light.living_room is on
  const e1 = hub.getEntity('light.living_room');
  if (e1 && e1.state === 'on') passed++;

  // Check 4: State of sensor.smoke is emergency
  const e2 = hub.getEntity('sensor.smoke');
  if (e2 && e2.state === 'emergency') passed++;

  // Check 5: Logger did not receive light.kitchen
  if (!logger.receivedEntities.includes('light.kitchen')) passed++;

  const elapsedMs = performance.now() - start;

  console.log(`RESULT: ${passed}/${total} passed`);
  console.log(`TIME_MS: ${elapsedMs.toFixed(3)}`);

  if (passed !== total) {
    process.exit(1);
  }
}

runTests();
