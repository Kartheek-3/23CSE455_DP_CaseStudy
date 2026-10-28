import { OccupancyMonitor } from './occupancy-monitor';
import { OccupancyEvent, OccupancyObserver } from './occupancy-observer';
import { LoggingObserver } from './observers/logging.observer';
import { AvailabilityObserver } from './observers/availability.observer';

describe('OccupancyMonitor (Observer)', () => {
  let monitor: OccupancyMonitor;
  let logging: LoggingObserver;
  let availability: AvailabilityObserver;

  beforeEach(() => {
    monitor = new OccupancyMonitor();
    logging = new LoggingObserver();
    availability = new AvailabilityObserver();
    monitor.attach(logging);
    monitor.attach(availability);
  });

  it('tracks attached observers', () => {
    expect(monitor.observerCount()).toBe(2);
    monitor.detach(logging);
    expect(monitor.observerCount()).toBe(1);
  });

  it('notifies every observer on a status change', () => {
    monitor.report(5, 'occupied');
    expect(logging.entries).toHaveLength(1);
    expect(logging.entries[0].slotId).toBe(5);
    expect(availability.isOccupied(5)).toBe(true);
    expect(availability.occupiedCount()).toBe(1);
  });

  it('frees the slot when it becomes available again', () => {
    monitor.report(5, 'occupied');
    monitor.report(5, 'available');
    expect(availability.isOccupied(5)).toBe(false);
    expect(availability.occupiedCount()).toBe(0);
    expect(logging.entries).toHaveLength(2);
  });

  it('stops notifying a detached observer', () => {
    monitor.detach(availability);
    monitor.report(5, 'occupied');
    expect(availability.occupiedCount()).toBe(0);
    expect(logging.entries).toHaveLength(1);
  });

  it('supports a plain mock observer', () => {
    const seen: OccupancyEvent[] = [];
    const spy: OccupancyObserver = {
      name: 'spy',
      update: (event) => seen.push(event),
    };
    monitor.attach(spy);
    monitor.report(9, 'occupied');
    expect(seen[0].slotId).toBe(9);
  });
});
