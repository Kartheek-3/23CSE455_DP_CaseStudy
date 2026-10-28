import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ChargingSession } from './charging-session';
import { ChargingService } from './charging.service';

describe('ChargingSession (State)', () => {
  it('walks the idle -> plugged-in -> charging -> completed -> idle lifecycle', () => {
    const session = new ChargingSession(7);
    expect(session.status).toBe('idle');

    session.plugIn();
    expect(session.status).toBe('plugged-in');

    session.start();
    expect(session.status).toBe('charging');

    session.addEnergy(12.5);
    session.complete();
    expect(session.status).toBe('completed');
    expect(session.energyDeliveredKwh).toBe(12.5);

    session.unplug();
    expect(session.status).toBe('idle');

    expect(session.history).toEqual([
      'idle',
      'plugged-in',
      'charging',
      'completed',
      'idle',
    ]);
  });

  it('rejects starting a session that is not plugged in', () => {
    const session = new ChargingSession(1);
    expect(() => session.start()).toThrow(BadRequestException);
  });

  it('allows unplugging while charging and returns to idle', () => {
    const session = new ChargingSession(1);
    session.plugIn();
    session.start();
    session.unplug();
    expect(session.status).toBe('idle');
  });

  it('rejects completing a session that never started', () => {
    const session = new ChargingSession(1);
    session.plugIn();
    expect(() => session.complete()).toThrow(BadRequestException);
  });
});

describe('ChargingService', () => {
  let service: ChargingService;

  beforeEach(() => {
    service = new ChargingService();
  });

  it('opens a session once per slot', () => {
    const first = service.open(3);
    const again = service.open(3);
    expect(again).toBe(first);
    expect(service.get(3).status).toBe('idle');
  });

  it('applies actions through the state machine', () => {
    service.open(3);
    expect(service.apply(3, 'plug-in').status).toBe('plugged-in');
    expect(service.apply(3, 'start').status).toBe('charging');
    expect(service.apply(3, 'complete').status).toBe('completed');
  });

  it('rejects an unknown action', () => {
    service.open(3);
    expect(() => service.apply(3, 'explode' as never)).toThrow(
      BadRequestException,
    );
  });

  it('throws when the slot has no session', () => {
    expect(() => service.get(99)).toThrow(NotFoundException);
  });
});
