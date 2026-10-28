import { BaseError } from "./BaseError";
import { HTTP_STATUS_CODES } from "../../constants/HttpStatusCode";

export class ConflictError extends BaseError {
  constructor(message: string = "Resource already exists") {
    super(message, HTTP_STATUS_CODES.CONFLICT);
  }
}
