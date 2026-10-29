import { Injectable } from '@nestjs/common';
import { Slot } from '../slot.entity';
import {
  NEAREST_TO_ENTRANCE,
  SlotAllocationStrategy,
} from './slot-allocation.strategy';

@Injectable()
export class NearestToEntranceStrategy implements SlotAllocationStrategy {
  readonly name = NEAREST_TO_ENTRANCE;

  select(candidates: Slot[]): Slot | null {
    if (candidates.length === 0) {
      return null;
    }
    return candidates.reduce((best, slot) => {
      const bestDistance = best.distanceToEntrance ?? Number.MAX_SAFE_INTEGER;
      const slotDistance = slot.distanceToEntrance ?? Number.MAX_SAFE_INTEGER;
      return slotDistance < bestDistance ? slot : best;
    });
  }
}
