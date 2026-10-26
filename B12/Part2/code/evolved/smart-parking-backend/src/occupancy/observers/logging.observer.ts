import { Injectable } from '@nestjs/common';
import { OccupancyEvent, OccupancyObserver } from '../occupancy-observer';

@Injectable()
export class LoggingObserver implements OccupancyObserver {
  readonly name = 'logging';
  readonly entries: OccupancyEvent[] = [];

  update(event: OccupancyEvent): void {
    this.entries.push(event);
  }
}
