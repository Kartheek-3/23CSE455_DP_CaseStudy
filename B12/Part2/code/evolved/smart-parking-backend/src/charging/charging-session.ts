import { ChargingState } from './charging-state';
import { IdleState } from './charging-states';

export class ChargingSession {
  private state: ChargingState;
  readonly slotId: number;
  energyDeliveredKwh = 0;
  readonly history: string[] = [];

  constructor(slotId: number) {
    this.slotId = slotId;
    this.state = new IdleState();
    this.history.push(this.state.name);
  }

  get status(): string {
    return this.state.name;
  }

  setState(state: ChargingState): void {
    this.state = state;
    this.history.push(state.name);
  }

  addEnergy(kwh: number): void {
    this.energyDeliveredKwh += kwh;
  }

  plugIn(): void {
    this.state.plugIn(this);
  }

  start(): void {
    this.state.start(this);
  }

  complete(): void {
    this.state.complete(this);
  }

  unplug(): void {
    this.state.unplug(this);
  }
}
