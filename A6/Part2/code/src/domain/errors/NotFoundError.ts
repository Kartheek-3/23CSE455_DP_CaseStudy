import { BaseError } from "./BaseError";
import { HTTP_STATUS_CODES } from "../../constants/HttpStatusCode";

export class NotFoundError extends BaseError {
  constructor(message: string = "Resource not found") {
    super(message, HTTP_STATUS_CODES.NOT_FOUND);
  }
}
