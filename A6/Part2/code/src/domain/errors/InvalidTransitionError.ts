import { BaseError } from "./BaseError";
import { HTTP_STATUS_CODES } from "../../constants/HttpStatusCode";

// Raised by state objects when an action is not allowed in the current state.
export class InvalidTransitionError extends BaseError {
  constructor(message: string) {
    super(message, HTTP_STATUS_CODES.CONFLICT);
  }
}
