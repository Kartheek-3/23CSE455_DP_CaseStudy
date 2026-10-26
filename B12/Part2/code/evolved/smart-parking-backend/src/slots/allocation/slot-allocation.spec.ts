import { Slot, SlotStatus, SlotType } from '../slot.entity';
import { FirstAvailableStrategy } from './first-available.strategy';
import { NearestToEntranceStrategy } from './nearest-to-entrance.strategy';
import { EvPreferredStrategy } from './ev-preferred.strategy';
import { SlotAllocationContext } from './slot-allocation.context';
import {
  EV_PREFERRED,
  FIRST_AVAILABLE,
  NEAREST_TO_ENTRANCE,
} from './slot-allocation.strategy';

function slot(
  id: number,
  slotNumber: string,
  type: SlotType,
  distanceToEntrance?: number,
): Slot {
  return {
    id,
    slotNumber,
    type,
    status: SlotStatus.AVAILABLE,
    distanceToEntrance,
  } as Slot;
}

const candidates: Slot[] = [
  slot(1, 'A-01', SlotType.STANDARD, 40),
  slot(2, 'A-02', SlotType.EV, 10),
  slot(3, 'A-03', SlotType.STANDARD, 25),
];

describe('SlotAllocationStrategy', () => {
  it('first-available returns the first candidate and null when empty', () => {
    const strategy = new FirstAvailableStrategy();
    expect(strategy.select(candidates)?.id).toBe(1);
    expect(strategy.select([])).toBeNull();
  });

  it('nearest-to-entrance picks the smallest distance', () => {
    const strategy = new NearestToEntranceStrategy();
    expect(strategy.select(candidates)?.id).toBe(2);
    expect(strategy.select([])).toBeNull();
  });

  it('nearest-to-entrance treats a missing distance as furthest', () => {
    const strategy = new NearestToEntranceStrategy();
    const withUnknown = [slot(9, 'A-09', SlotType.STANDARD), ...candidates];
    expect(strategy.select(withUnknown)?.id).toBe(2);
  });

  it('ev-preferred returns the first EV slot', () => {
    const strategy = new EvPreferredStrategy();
    expect(strategy.select(candidates)?.id).toBe(2);
  });

  it('ev-preferred falls back to the first slot when no EV is free', () => {
    const strategy = new EvPreferredStrategy();
    const noEv = candidates.filter((c) => c.type !== SlotType.EV);
    expect(strategy.select(noEv)?.id).toBe(1);
    expect(strategy.select([])).toBeNull();
  });
});

describe('SlotAllocationContext', () => {
  const context = new SlotAllocationContext([
    new FirstAvailableStrategy(),
    new NearestToEntranceStrategy(),
    new EvPreferredStrategy(),
  ]);

  it('exposes the registered strategy names', () => {
    expect(context.available().sort()).toEqual(
      [EV_PREFERRED, FIRST_AVAILABLE, NEAREST_TO_ENTRANCE].sort(),
    );
  });

  it('dispatches to the requested strategy', () => {
    expect(context.select(NEAREST_TO_ENTRANCE, candidates)?.id).toBe(2);
    expect(context.select(EV_PREFERRED, candidates)?.id).toBe(2);
    expect(context.select(FIRST_AVAILABLE, candidates)?.id).toBe(1);
  });

  it('falls back to first-available for an unknown strategy', () => {
    expect(context.select('does-not-exist', candidates)?.id).toBe(1);
  });
});
