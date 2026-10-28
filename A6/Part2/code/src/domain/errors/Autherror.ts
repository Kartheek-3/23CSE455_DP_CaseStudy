import { BaseError } from "./BaseError";
import { HTTP_STATUS_CODES } from "../../constants/HttpStatusCode";
export class AuthError extends BaseError {
  constructor(message: string, statusCode: number = HTTP_STATUS_CODES.BAD_REQUEST) {
    super(message, statusCode);
  }
}