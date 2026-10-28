import { ChargingSession } from './charging-session';

export interface ChargingState {
  readonly name: string;
  plugIn(session: ChargingSession): void;
  start(session: ChargingSession): void;
  complete(session: ChargingSession): void;
  unplug(session: ChargingSession): void;
}
