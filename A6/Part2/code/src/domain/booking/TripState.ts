import { BookingStatus } from "../models/Booking";
import { InvalidTransitionError } from "../errors/InvalidTransitionError";

export type TripEvent = "accept" | "complete" | "cancel" | "reject" | "expire";

/**
 * State pattern for the trip (booking) lifecycle. Each state object knows which
 * events it accepts; anything else raises InvalidTransitionError.
 */
export interface TripState {
  readonly status: BookingStatus;
  accept(): TripState;
  complete(): TripState;
  cancel(): TripState;
  reject(): TripState;
  expire(): TripState;
}

abstract class BaseTripState implements TripState {
  abstract readonly status: BookingStatus;
  accept(): TripState {
    return this.refuse("accept");
  }
  complete(): TripState {
    return this.refuse("complete");
  }
  cancel(): TripState {
    return this.refuse("cancel");
  }
  reject(): TripState {
    return this.refuse("reject");
  }
  expire(): TripState {
    return this.refuse("expire");
  }
  protected refuse(event: TripEvent): never {
    throw new InvalidTransitionError(`Cannot ${event} a ${this.status.toLowerCase()} ride.`);
  }
}

export class PendingTrip extends BaseTripState {
  readonly status = BookingStatus.PENDING;
  accept() {
    return new ConfirmedTrip();
  }
  cancel() {
    return new FinishedTrip(BookingStatus.CANCELLED);
  }
  reject() {
    return new FinishedTrip(BookingStatus.REJECTED);
  }
  expire() {
    return new FinishedTrip(BookingStatus.EXPIRED);
  }
}

export class ConfirmedTrip extends BaseTripState {
  readonly status = BookingStatus.CONFIRMED;
  complete() {
    return new FinishedTrip(BookingStatus.COMPLETED);
  }
  cancel() {
    return new FinishedTrip(BookingStatus.CANCELLED);
  }
  reject() {
    return new FinishedTrip(BookingStatus.REJECTED);
  }
}

/** COMPLETED, CANCELLED, REJECTED and EXPIRED accept no further events. */
export class FinishedTrip extends BaseTripState {
  constructor(readonly status: BookingStatus) {
    super();
  }
}

export function tripStateFor(status: BookingStatus | undefined): TripState {
  switch (status ?? BookingStatus.PENDING) {
    case BookingStatus.PENDING:
      return new PendingTrip();
    case BookingStatus.CONFIRMED:
      return new ConfirmedTrip();
    default:
      return new FinishedTrip(status as BookingStatus);
  }
}

const EVENT_FOR_TARGET: Partial<Record<BookingStatus, TripEvent>> = {
  [BookingStatus.CONFIRMED]: "accept",
  [BookingStatus.COMPLETED]: "complete",
  [BookingStatus.CANCELLED]: "cancel",
  [BookingStatus.REJECTED]: "reject",
  [BookingStatus.EXPIRED]: "expire",
};

/** Context: keeps the current trip state and applies events to it. */
export class TripLifecycle {
  private state: TripState;

  constructor(status: BookingStatus | undefined) {
    this.state = tripStateFor(status);
  }

  get status(): BookingStatus {
    return this.state.status;
  }

  apply(event: TripEvent): BookingStatus {
    this.state = this.state[event]();
    return this.state.status;
  }

  moveTo(target: BookingStatus): BookingStatus {
    const event = EVENT_FOR_TARGET[target];
    if (!event) {
      throw new InvalidTransitionError(`A ride cannot be moved back to ${target}.`);
    }
    return this.apply(event);
  }
}
