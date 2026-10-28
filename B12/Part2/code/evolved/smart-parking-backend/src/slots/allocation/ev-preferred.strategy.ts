import { Injectable } from '@nestjs/common';
import { Slot, SlotType } from '../slot.entity';
import { EV_PREFERRED, SlotAllocationStrategy } from './slot-allocation.strategy';

@Injectable()
export class EvPreferredStrategy implements SlotAllocationStrategy {
  readonly name = EV_PREFERRED;

  select(candidates: Slot[]): Slot | null {
    const evSlot = candidates.find((slot) => slot.type === SlotType.EV);
    if (evSlot) {
      return evSlot;
    }
    return candidates.length > 0 ? candidates[0] : null;
  }
}
