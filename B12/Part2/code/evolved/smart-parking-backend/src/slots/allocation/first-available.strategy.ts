import { Injectable } from '@nestjs/common';
import { Slot } from '../slot.entity';
import { FIRST_AVAILABLE, SlotAllocationStrategy } from './slot-allocation.strategy';

@Injectable()
export class FirstAvailableStrategy implements SlotAllocationStrategy {
  readonly name = FIRST_AVAILABLE;

  select(candidates: Slot[]): Slot | null {
    return candidates.length > 0 ? candidates[0] : null;
  }
}
