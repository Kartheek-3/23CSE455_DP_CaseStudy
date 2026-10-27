import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ChargingSession } from './charging-session';

export type ChargingAction = 'plug-in' | 'start' | 'complete' | 'unplug';

@Injectable()
export class ChargingService {
  private readonly sessions = new Map<number, ChargingSession>();

  open(slotId: number): ChargingSession {
    const existing = this.sessions.get(slotId);
    if (existing) {
      return existing;
    }
    const session = new ChargingSession(slotId);
    this.sessions.set(slotId, session);
    return session;
  }

  get(slotId: number): ChargingSession {
    const session = this.sessions.get(slotId);
    if (!session) {
      throw new NotFoundException(`No charging session for slot ${slotId}`);
    }
    return session;
  }

  apply(slotId: number, action: ChargingAction): ChargingSession {
    const session = this.get(slotId);
    switch (action) {
      case 'plug-in':
        session.plugIn();
        break;
      case 'start':
        session.start();
        break;
      case 'complete':
        session.complete();
        break;
      case 'unplug':
        session.unplug();
        break;
      default:
        throw new BadRequestException(`Unknown charging action: ${action}`);
    }
    return session;
  }
}
