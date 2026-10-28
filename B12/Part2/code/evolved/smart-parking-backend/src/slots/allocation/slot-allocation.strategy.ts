import { Slot } from '../slot.entity';

export const FIRST_AVAILABLE = 'first-available';
export const NEAREST_TO_ENTRANCE = 'nearest-to-entrance';
export const EV_PREFERRED = 'ev-preferred';

export interface SlotAllocationStrategy {
  readonly name: string;
  select(candidates: Slot[]): Slot | null;
}
