import { InvalidTransitionError } from "../errors/InvalidTransitionError";
import { AuthError } from "../errors/Autherror";
import { HTTP_STATUS_CODES } from "../../constants/HttpStatusCode";

export type DriverAccountStatus = "pending" | "approved" | "rejected" | "suspended";

export const DRIVER_ACCOUNT_STATUSES: DriverAccountStatus[] = ["pending", "approved", "rejected", "suspended"];

/**
 * State pattern: each driver account status is an object that decides which admin
 * actions are legal and whether the driver may take rides.
 */
export interface DriverAccountState {
  readonly status: DriverAccountStatus;
  approve(): DriverAccountState;
  reject(reason?: string): DriverAccountState;
  suspend(reason?: string): DriverAccountState;
  resetToPending(): DriverAccountState;
  canReceiveRides(): boolean;
}

abstract class BaseDriverAccountState implements DriverAccountState {
  abstract readonly status: DriverAccountStatus;

  approve(): DriverAccountState {
    return this.refuse("approve");
  }
  reject(_reason?: string): DriverAccountState {
    return this.refuse("reject");
  }
  suspend(_reason?: string): DriverAccountState {
    return this.refuse("suspend");
  }
  resetToPending(): DriverAccountState {
    return this.refuse("move to pending");
  }
  canReceiveRides(): boolean {
    return false;
  }

  protected refuse(action: string): never {
    throw new InvalidTransitionError(`Cannot ${action} a driver whose status is ${this.status}.`);
  }
}

const requireReason = (reason: string | undefined, action: string) => {
  if (!reason || !reason.trim()) {
    throw new AuthError(`A reason is required to ${action} a driver.`, HTTP_STATUS_CODES.UNPROCESSABLE_ENTITY);
  }
};

export class PendingDriverState extends BaseDriverAccountState {
  readonly status = "pending" as const;
  approve() {
    return new ApprovedDriverState();
  }
  reject(reason?: string) {
    requireReason(reason, "reject");
    return new RejectedDriverState();
  }
}

export class ApprovedDriverState extends BaseDriverAccountState {
  readonly status = "approved" as const;
  suspend(reason?: string) {
    requireReason(reason, "suspend");
    return new SuspendedDriverState();
  }
  canReceiveRides() {
    return true;
  }
}

export class RejectedDriverState extends BaseDriverAccountState {
  readonly status = "rejected" as const;
  // A rejected driver may re-submit documents; the admin puts the account back in review.
  resetToPending() {
    return new PendingDriverState();
  }
}

export class SuspendedDriverState extends BaseDriverAccountState {
  readonly status = "suspended" as const;
  // Reinstating a suspended driver.
  approve() {
    return new ApprovedDriverState();
  }
  reject(reason?: string) {
    requireReason(reason, "reject");
    return new RejectedDriverState();
  }
}

export function driverAccountStateFor(status: string | undefined): DriverAccountState {
  switch (status ?? "pending") {
    case "pending":
      return new PendingDriverState();
    case "approved":
      return new ApprovedDriverState();
    case "rejected":
      return new RejectedDriverState();
    case "suspended":
      return new SuspendedDriverState();
    default:
      throw new AuthError(`Unknown driver status: ${status}`, HTTP_STATUS_CODES.BAD_REQUEST);
  }
}

/** Context: holds the current state and turns an admin's target status into a state action. */
export class DriverAccount {
  private state: DriverAccountState;

  constructor(status: string | undefined) {
    this.state = driverAccountStateFor(status);
  }

  get status(): DriverAccountStatus {
    return this.state.status;
  }

  canReceiveRides(): boolean {
    return this.state.canReceiveRides();
  }

  changeTo(target: DriverAccountStatus, reason?: string): DriverAccountStatus {
    switch (target) {
      case "approved":
        this.state = this.state.approve();
        break;
      case "rejected":
        this.state = this.state.reject(reason);
        break;
      case "suspended":
        this.state = this.state.suspend(reason);
        break;
      case "pending":
        this.state = this.state.resetToPending();
        break;
      default:
        throw new AuthError(`Unknown driver status: ${target}`, HTTP_STATUS_CODES.BAD_REQUEST);
    }
    return this.state.status;
  }
}
