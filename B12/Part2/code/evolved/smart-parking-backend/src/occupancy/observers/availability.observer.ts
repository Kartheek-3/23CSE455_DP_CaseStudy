import { Injectable } from '@nestjs/common';
import { OccupancyEvent, OccupancyObserver } from '../occupancy-observer';

@Injectable()
export class AvailabilityObserver implements OccupancyObserver {
  readonly name = 'availability';
  private readonly occupied = new Set<number>();

  update(event: OccupancyEvent): void {
    if (event.status === 'occupied') {
      this.occupied.add(event.slotId);
    } else {
      this.occupied.delete(event.slotId);
    }
  }

  isOccupied(slotId: number): boolean {
    return this.occupied.has(slotId);
  }

  occupiedCount(): number {
    return this.occupied.size;
  }
}
