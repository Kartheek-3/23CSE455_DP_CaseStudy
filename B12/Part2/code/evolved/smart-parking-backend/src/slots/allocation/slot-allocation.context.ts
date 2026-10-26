import { Slot } from '../slot.entity';
import {
  FIRST_AVAILABLE,
  SlotAllocationStrategy,
} from './slot-allocation.strategy';

export class SlotAllocationContext {
  private readonly strategies = new Map<string, SlotAllocationStrategy>();

  constructor(strategies: SlotAllocationStrategy[]) {
    for (const strategy of strategies) {
      this.strategies.set(strategy.name, strategy);
    }
  }

  select(strategyName: string, candidates: Slot[]): Slot | null {
    const strategy =
      this.strategies.get(strategyName) ?? this.strategies.get(FIRST_AVAILABLE);
    if (!strategy) {
      return null;
    }
    return strategy.select(candidates);
  }

  available(): string[] {
    return [...this.strategies.keys()];
  }
}
