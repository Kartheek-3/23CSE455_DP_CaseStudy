import { BadRequestException } from '@nestjs/common';
import { ChargingState } from './charging-state';
import { ChargingSession } from './charging-session';

export class IdleState implements ChargingState {
  readonly name = 'idle';

  plugIn(session: ChargingSession): void {
    session.setState(new PluggedInState());
  }

  start(): void {
    throw new BadRequestException('Cannot start charging: vehicle not plugged in');
  }

  complete(): void {
    throw new BadRequestException('Cannot complete: charging has not started');
  }

  unplug(): void {
    throw new BadRequestException('Cannot unplug: vehicle not plugged in');
  }
}

export class PluggedInState implements ChargingState {
  readonly name = 'plugged-in';

  plugIn(): void {
    throw new BadRequestException('Vehicle is already plugged in');
  }

  start(session: ChargingSession): void {
    session.setState(new ChargingActiveState());
  }

  complete(): void {
    throw new BadRequestException('Cannot complete: charging has not started');
  }

  unplug(session: ChargingSession): void {
    session.setState(new IdleState());
  }
}

export class ChargingActiveState implements ChargingState {
  readonly name = 'charging';

  plugIn(): void {
    throw new BadRequestException('Vehicle is already plugged in');
  }

  start(): void {
    throw new BadRequestException('Charging session is already active');
  }

  complete(session: ChargingSession): void {
    session.setState(new CompletedState());
  }

  unplug(session: ChargingSession): void {
    session.setState(new IdleState());
  }
}

export class CompletedState implements ChargingState {
  readonly name = 'completed';

  plugIn(): void {
    throw new BadRequestException('Unplug the vehicle before starting a new session');
  }

  start(): void {
    throw new BadRequestException('Unplug the vehicle before starting a new session');
  }

  complete(): void {
    throw new BadRequestException('Charging session is already completed');
  }

  unplug(session: ChargingSession): void {
    session.setState(new IdleState());
  }
}
