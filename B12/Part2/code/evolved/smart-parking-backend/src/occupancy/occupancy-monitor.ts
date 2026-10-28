import { Injectable } from '@nestjs/common';
import { OccupancyEvent, OccupancyObserver } from './occupancy-observer';

@Injectable()
export class OccupancyMonitor {
  private readonly observers = new Set<OccupancyObserver>();

  attach(observer: OccupancyObserver): void {
    this.observers.add(observer);
  }

  detach(observer: OccupancyObserver): void {
    this.observers.delete(observer);
  }

  observerCount(): number {
    return this.observers.size;
  }

  report(slotId: number, status: string): OccupancyEvent {
    const event: OccupancyEvent = { slotId, status, at: new Date() };
    this.notify(event);
    return event;
  }

  private notify(event: OccupancyEvent): void {
    for (const observer of this.observers) {
      observer.update(event);
    }
  }
}
